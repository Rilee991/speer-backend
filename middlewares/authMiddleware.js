const jwt = require("jsonwebtoken");
const User = require("../src/models/User");

const authenticateToken = (req, res, next) => {
    const token = req?.cookies?.jwt;

    if(!token) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
        if(err) {
            return res.status(401).json({ error: 'Invalid user' });
        }

        const user = await User.findById(data.id, { password: 0 });

        if(!user) return res.status(400).json({ error: true, message: "User doesnt exists." });

        req.user = user;
        next();
    })
}

module.exports = {
    authenticateToken
};
