const router = require("express").Router();
const User = require("../models/user");
const { authenticateToken } = require("./userAuth");

// ─── Add Book to Favorites ────────────────────────────────────────────────────
// FIX 1.7: Corrected typo in route name: "favurite" → "favorite"
// Old route kept as alias for backward compatibility during transition.
router.put("/add-book-to-favorite", authenticateToken, async (req, res, next) => {
  try {
    const { bookid } = req.headers;
    const userId = req.user.id; // Corrected: Using token identity

    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAlreadyFavorite = userData.favourites.includes(bookid);
    if (isAlreadyFavorite) {
      return res.status(200).json({ message: "Book is already in favorites" });
    }

    await User.findByIdAndUpdate(userId, { $push: { favourites: bookid } });
    return res.status(200).json({ message: "Book added to favorites" });
  } catch (error) {
    next(error);
  }
});

// ─── Backward-compatible alias (old typo route) ───────────────────────────────
router.put("/add-book-to-favurite", authenticateToken, async (req, res, next) => {
  req.url = "/add-book-to-favorite";
  next("route");
});

// ─── Remove Book from Favorites ───────────────────────────────────────────────
router.put("/remove-book-from-favorite", authenticateToken, async (req, res, next) => {
  try {
    const { bookid } = req.headers;
    const userId = req.user.id; // Using token identity
    await User.findByIdAndUpdate(userId, { $pull: { favourites: bookid } });
    return res.status(200).json({ message: "Book removed from favorites" });
  } catch (error) {
    next(error);
  }
});

// Backward-compatible alias
router.put("/remove-book-from-favurite", authenticateToken, async (req, res, next) => {
  try {
    const { bookid, id } = req.headers;
    await User.findByIdAndUpdate(id, { $pull: { favourites: bookid } });
    return res.status(200).json({ message: "Book removed from favorites" });
  } catch (error) {
    next(error);
  }
});

// ─── Get Favorite Books of a User ────────────────────────────────────────────
router.get("/get-favorite-books", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id; // Using token identity
    const userData = await User.findById(userId).populate("favourites");

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ status: "Success", data: userData.favourites });
  } catch (error) {
    next(error);
  }
});

// Backward-compatible alias for old route name
router.get("/get-favourite-books", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id; // Using token identity
    const userData = await User.findById(userId).populate("favourites");
    if (!userData) return res.status(404).json({ message: "User not found" });
    return res.json({ status: "Success", data: userData.favourites });
  } catch (error) {
    next(error);
  }
});

module.exports = router;