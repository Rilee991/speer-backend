const mongoose = require("mongoose");
const { isEmail } = require('validator').default;
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is mandatory'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is mandatory'],
        minlength: [6, 'Password must be atleast 6 characters in length']
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    console.log(this);
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
