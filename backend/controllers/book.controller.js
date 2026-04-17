const { body, query } = require("express-validator");
const Book = require("../models/book");
const { getPaginatedBooks, getDistinctGenres, getDistinctLanguages } = require("../services/book.service");
const { logAudit } = require("../utils/auditLogger");

// ─── Validation Rules ─────────────────────────────────────────────────────────
const addBookValidation = [
  body("url").notEmpty().withMessage("Image URL is required").isURL().withMessage("Must be a valid URL"),
  body("title").notEmpty().trim().withMessage("Title is required"),
  body("author").notEmpty().trim().withMessage("Author is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
  body("desc").notEmpty().trim().withMessage("Description is required"),
  body("language").notEmpty().trim().withMessage("Language is required"),
  body("genres").optional().isArray().withMessage("Genres must be an array"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
];

// ─── Controllers ─────────────────────────────────────────────────────────────

const addBook = async (req, res, next) => {
  try {
    const adminId = req.user.id; // Corrected: Using token identity
    const { url, title, author, price, desc, language, genres = [], stock = 100, isbn = "" } = req.body;
    const book = new Book({ url, title, author, price, desc, language, genres, stock, isbn });
    await book.save();

    await logAudit(adminId, "CREATE_BOOK", "Book", book._id, { title });

    res.status(201).json({ message: "Book added successfully", data: book });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const adminId = req.user.id; // Corrected: Using token identity
    const { bookid } = req.headers;
    if (!bookid) return res.status(400).json({ message: "bookid header is required" });

    const { url, title, author, price, desc, language, genres, stock, isbn } = req.body;
    const updated = await Book.findByIdAndUpdate(
      bookid,
      { url, title, author, price, desc, language, genres, stock, isbn },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Book not found" });

    await logAudit(adminId, "UPDATE_BOOK", "Book", updated._id, { title });

    return res.status(200).json({ message: "Book updated successfully", data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const adminId = req.user.id; // Corrected: Using token identity
    const { bookid } = req.headers;
    if (!bookid) return res.status(400).json({ message: "bookid header is required" });
    const deleted = await Book.findByIdAndDelete(bookid);
    if (!deleted) return res.status(404).json({ message: "Book not found" });

    await logAudit(adminId, "DELETE_BOOK", "Book", bookid, { title: deleted.title });

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getAllBooks = async (req, res, next) => {
  try {
    const result = await getPaginatedBooks(req.query);
    return res.json({ status: "Success", ...result });
  } catch (error) {
    next(error);
  }
};

const getRecentBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).limit(8).lean();
    return res.json({ status: "Success", data: books });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id).lean();
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.json({ status: "Success", data: book });
  } catch (error) {
    next(error);
  }
};

const getFilterOptions = async (req, res, next) => {
  try {
    const [genres, languages] = await Promise.all([
      getDistinctGenres(),
      getDistinctLanguages(),
    ]);
    return res.json({ status: "Success", data: { genres, languages } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBook,
  updateBook,
  deleteBook,
  getAllBooks,
  getRecentBooks,
  getBookById,
  getFilterOptions,
  addBookValidation,
};
