const jwt = require("jsonwebtoken");

const { ERROR_MESSAGES } = require("../../constants/enums");

const handleError = (err) => {
    console.log(err);
    const errors = { };

    if(err.message == ERROR_MESSAGES.INCORRECT_PASSWORD) {
        errors["password"] = err.message;
    }

    if(err.message == ERROR_MESSAGES.USER_NOT_EXISTS_MSG) {
        errors["email"] = err.message;
    }

    //validation errors
    if(err.message.includes(ERROR_MESSAGES.USER_INVALID)) {
        console.log(Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        }));
    }

    //duplicate error code
    if(err.code == 11000) {
        errors["email"] = ERROR_MESSAGES.USER_EXISTS_MSG;
    }

    return errors;
}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRY
    });
}

module.exports = {
    handleError,
    createToken
}
