const { validationResult } = require("express-validator");

/**
 * Runs after express-validator chains.
 * If there are errors, returns 422 with a structured error array.
 * Otherwise calls next().
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = { handleValidationErrors };
