const { body } = require("express-validator")

module.exports.validate = [
  body("username")
    .trim()
    .not()
    .isEmpty()
    .withMessage("username is required")
    .isLength({ min: 2 })
    .withMessage("Cannot be less than 2 characters"),
  body("password")
    .not()
    .isEmpty()
    .withMessage("password is required")
    .isLength({ min: 4 })
    .withMessage("password cannot be less than 4 characters"),
]
