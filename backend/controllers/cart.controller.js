const User = require("../models/user");
const Book = require("../models/book");

// ─── Cart Controllers ─────────────────────────────────────────────────────────

/**
 * PUT /add-to-cart
 * Adds a book to cart or increments quantity if already there.
 * Validates against available stock.
 */
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id; // Corrected: Using token identity
    const { bookid } = req.headers;
    const { quantity = 1 } = req.body;

    const [userData, book] = await Promise.all([
      User.findById(userId),
      Book.findById(bookid),
    ]);

    if (!userData) return res.status(404).json({ message: "User not found" });
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.stock < 1) return res.status(400).json({ message: "Book is out of stock" });

    const existingItem = userData.cart.find(
      (item) => item.book.toString() === bookid
    );

    if (existingItem) {
      const newQty = existingItem.quantity + Number(quantity);
      if (newQty > book.stock) {
        return res.status(400).json({
          message: `Only ${book.stock} copies available`,
        });
      }
      existingItem.quantity = newQty;
    } else {
      userData.cart.push({ book: bookid, quantity: Number(quantity) });
    }

    await userData.save();
    return res.json({ status: "Success", message: "Book added to cart" });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /update-cart-quantity
 * Set a specific quantity for a cart item.
 */
const updateCartQuantity = async (req, res, next) => {
  try {
    const userId = req.user.id; // Using token identity
    const { bookId, quantity } = req.body;

    if (!bookId || !quantity) {
      return res.status(400).json({ message: "bookId and quantity are required" });
    }

    const [userData, book] = await Promise.all([
      User.findById(userId),
      Book.findById(bookId),
    ]);

    if (!userData) return res.status(404).json({ message: "User not found" });
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (Number(quantity) < 1) {
      // Remove item
      userData.cart = userData.cart.filter(
        (item) => item.book.toString() !== bookId
      );
    } else {
      if (Number(quantity) > book.stock) {
        return res.status(400).json({ message: `Only ${book.stock} copies available` });
      }
      const item = userData.cart.find((i) => i.book.toString() === bookId);
      if (item) {
        item.quantity = Number(quantity);
      }
    }

    await userData.save();
    return res.json({ status: "Success", message: "Cart updated" });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /remove-from-cart/:bookid
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { bookid } = req.params;
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, {
      $pull: { cart: { book: bookid } },
    });
    return res.json({ status: "Success", message: "Book removed from cart" });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /get-user-cart
 * Returns populated cart items with book details.
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userData = await User.findById(userId)
      .populate("cart.book")
      .lean();

    if (!userData) return res.status(404).json({ message: "User not found" });

    const cart = (userData.cart || [])
      .filter((item) => item.book) // filter out removed books
      .reverse();

    return res.json({ status: "Success", data: cart });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /clear-cart
 * Clears the entire cart.
 */
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id; // Using token identity
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });
    return res.json({ status: "Success", message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToCart, updateCartQuantity, removeFromCart, getCart, clearCart };
