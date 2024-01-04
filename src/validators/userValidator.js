const { body } = require("express-validator");

const signupValidations = [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be atleast 6 characters long')
];

const signInValidations = [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Invalid password')
];

module.exports = {
    signInValidations,
    signupValidations
}
