const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const { ERROR_MESSAGES } = require("../../constants/enums");
const { handleError, createToken } = require("./utils");

const signUp = async (req, res) => {
    try {
        const { email = "", password = "" } = req.body;

        const user = await User.create({ email, password });
        const token = createToken(user._id.toString());
        res.cookie('jwt', token, { httpOnly: true, maxAge: process.env.JWT_EXPIRY*1000 });

        return res.status(200).json({ error: false, message: { user: user._id, jwt: token } });
    } catch (err) {
        const errors = handleError(err);
        return res.status(401).json({ error: true, message: errors });
    }
}

const login = async (req, res) => {
    try {
        const { email = "", password = "" } = req.body;

        const user = await User.findOne({ email });

        if(!user) throw new Error(ERROR_MESSAGES.USER_NOT_EXISTS_MSG);

        const auth = await bcrypt.compare(password, user.password);

        if(!auth)   throw new Error(ERROR_MESSAGES.INCORRECT_PASSWORD);

        const token = createToken(user._id.toString());
        res.cookie('jwt', token, { httpOnly: true, maxAge: process.env.JWT_EXPIRY*1000 });

        return res.status(200).json({ error: false, message: { user: user._id, jwt: token  } });
    } catch (err) {
        const errors = handleError(err);
        return res.status(401).json({ error: true, message: errors });
    }
}

const deleteDummyRecords = async (req, res) => {
    try {
        await User.deleteMany({ email: { $regex: /.*@nfs.*/ } }); //@nfs emails only used for testing

        return res.status(200).json({ error: false, message: "Deletion successful" });
    } catch (err) {
        const errors = handleError(err);
        return res.status(401).json({ error: true, message: errors });
    }
}

module.exports = {
    signUp,
    login,
    deleteDummyRecords
}