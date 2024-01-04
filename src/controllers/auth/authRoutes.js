const Router = require("express-promise-router");

const controller = require("./authController");

const authRouter = () => {
    const authRoutes = Router({ mergeParams: true });

    authRoutes.route("/signup").post(controller.signUp);
    authRoutes.route("/login").post(controller.login);
    authRoutes.route("/deleteDummyRecords").delete(controller.deleteDummyRecords);

    return authRoutes;
}

module.exports = authRouter;
