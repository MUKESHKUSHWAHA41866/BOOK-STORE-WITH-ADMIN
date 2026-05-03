const router = require("express").Router();
const User = require("../models/user");
const Favourite = require("../models/favourite");
const Book = require("../models/book");
const { authenticateToken } = require("./userAuth");

// ─── Add Book to Favorites ────────────────────────────────────────────────────
// FIX 1.7: Corrected typo in route name: "favurite" → "favorite"
// Old route kept as alias for backward compatibility during transition.
router.put("/add-book-to-favorite", authenticateToken, async (req, res, next) => {
  try {
    const { bookid } = req.headers;
    const userId = req.user.id; // Corrected: Using token identity

    const existingFav = await Favourite.findOne({ user: userId, book: bookid });
    if (existingFav) {
      return res.status(200).json({ message: "Book is already in favorites" });
    }

    const newFav = new Favourite({ user: userId, book: bookid });
    await newFav.save();
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
    await Favourite.findOneAndDelete({ user: userId, book: bookid });
    return res.status(200).json({ message: "Book removed from favorites" });
  } catch (error) {
    next(error);
  }
});

// Backward-compatible alias
router.put("/remove-book-from-favurite", authenticateToken, async (req, res, next) => {
  try {
    const { bookid } = req.headers;
    const userId = req.user.id;
    await Favourite.findOneAndDelete({ user: userId, book: bookid });
    return res.status(200).json({ message: "Book removed from favorites" });
  } catch (error) {
    next(error);
  }
});

// ─── Get Favorite Books of a User ────────────────────────────────────────────
router.get("/get-favorite-books", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id; // Using token identity
    const favs = await Favourite.find({ user: userId }).populate("book").sort({ createdAt: -1 });
    const formattedFavs = favs.map(f => f.book).filter(b => b != null);

    return res.json({ status: "Success", data: formattedFavs });
  } catch (error) {
    next(error);
  }
});

// Backward-compatible alias for old route name
router.get("/get-favourite-books", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id; // Using token identity
    const favs = await Favourite.find({ user: userId }).populate("book").sort({ createdAt: -1 });
    const formattedFavs = favs.map(f => f.book).filter(b => b != null);
    return res.json({ status: "Success", data: formattedFavs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;