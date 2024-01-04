const Router = require("express-promise-router");

const { authenticateToken } = require("../../../middlewares/authMiddleware");
const controller = require("./notesController");

const notesRouter = () => {
    const notesRoutes = Router({ mergeParams: true });

    notesRoutes.route("/list").get(authenticateToken, controller.listNotes);
    notesRoutes.route("/:id").get(authenticateToken, controller.getNoteDetails);
    notesRoutes.route("/create").post(authenticateToken, controller.createNote);
    notesRoutes.route("/:id").put(authenticateToken, controller.updateNote);
    notesRoutes.route("/:id").delete(authenticateToken, controller.deleteNote);
    notesRoutes.route("/:id/share").post(authenticateToken, controller.shareNote);
    notesRoutes.route("/search").post(authenticateToken, controller.searchNotes);
    

    return notesRoutes;
}

module.exports = notesRouter;
