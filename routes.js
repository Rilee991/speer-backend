const express = require('express');

const authRoutes = require("./src/controllers/auth/authRoutes");
const notesRoutes = require("./src/controllers/notes/notesRoutes");

const expressRouter = express.Router();

const apiRoutes = () => {
    return expressRouter.use("/auth", authRoutes())
    .use("/notes", notesRoutes())
    .get('/', (req, res) => {
        res.status(200).json({ message: 'Alive' });
    })
    .all("*", () => {
        throw new Error({
            status: 400,
            message: "ERROR: API not found!"
        });
    });
}

module.exports = apiRoutes;
