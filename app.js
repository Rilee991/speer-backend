const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv");
env.config();

const configureMiddleware = require("./middlewares/middleware");
const apiRoutes = require("./routes");

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;

db.on("error", (err) => {
    console.log(`Cannot connect to db with error: ${err.message}`);
});

// db.once("open", async () => {
//     console.log(`Connected to db`);
//     const app = express();

//     configureMiddleware(app);
//     app.use("/speerapis/", apiRoutes());

//     const PORT = process.env.PORT || 3000;

//     app.listen(PORT, () => {
//         console.log(`App started on PORT: ${PORT}`);
//     }).on("error", (err) => {
//         console.log(`Couldn't start application with error: ${err.message}`);
//     });
// });
const app = express();
configureMiddleware(app);
app.use("/speerapis/", apiRoutes());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`App started on PORT: ${PORT}`);

    db.once("open", async () => {
        console.log(`Connected to db`);
    });
}).on("error", (err) => {
    console.log(`Couldn't start application with error: ${err.message}`);
});

module.exports = app;
