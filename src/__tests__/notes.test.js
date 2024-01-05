const supertest = require("supertest");
const setCookieParser = require("set-cookie-parser");

const server = require("../../app");

describe('Notes CRUD testing', () => {
    const noteIds = [];
    const user1Details = { authToken: "", id: "" };
    const user2Details = { authToken: "", id: "" };
    const user3Details = { authToken: "", id: "" };

    test("Logging in a user with password", async () => {
        const resp = await supertest(server).post("/speerapis/auth/login").send({
            email: "baron@test.com",
            password: "qwerty"
        });

        const cookies = setCookieParser(resp.headers["set-cookie"]);
        user1Details["authToken"] = cookies.find(obj => obj.name == "jwt")?.value;
        user1Details["id"] = resp.body.message.user;

        console.log("JWT::", user1Details.authToken);

        expect(resp.statusCode).toBe(200);
    });

    test("Creating a note", async () => {
        const resp = await supertest(server).post("/speerapis/notes/create").send({
            title: "Verity",
            description: "This is one of the most thrilling novels I've read. Really gripping and horrific at time."
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        noteIds.push(resp.body.message);

        expect(resp.statusCode).toBe(200);
    });

    test("Creating a note without title", async () => {
        const resp = await supertest(server).post("/speerapis/notes/create").send({
            description: "This is one of the most thrilling novels I've read. Really gripping and horrific at time."
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        noteIds.push(resp.body.message);

        expect(resp.statusCode).toBe(200);
    });

    test("Creating a note without description", async () => {
        const resp = await supertest(server).post("/speerapis/notes/create").send({
            title: "Verity"
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        noteIds.push(resp.body.message);
        expect(resp.statusCode).toBe(200);
    });

    test("Creating a note without a title and description", async () => {
        const resp = await supertest(server).post("/speerapis/notes/create").send({
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        expect(resp.statusCode).toBe(401);
    });

    test("Updating a note without a title and description", async () => {
        console.log(noteIds[0]);
        const resp = await supertest(server).put(`/speerapis/notes/${noteIds[0]}`).send({
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        expect(resp.statusCode).toBe(401);
    });

    test("Updating a note with only a title", async () => {
        const resp = await supertest(server).put(`/speerapis/notes/${noteIds[0]}`).send({
            title: "Last man standing"
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        expect(resp.statusCode).toBe(200);
    });

    test("Updating a note with only a description", async () => {
        const resp = await supertest(server).put(`/speerapis/notes/${noteIds[0]}`).send({
            description: "Last man standing"
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        expect(resp.statusCode).toBe(200);
    });

    test("Listing user notes", async () => {
        const resp = await supertest(server).get(`/speerapis/notes/list`).send({
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        expect(Array.isArray(resp.body.message)).toBe(true);
    });

    test("Getting details of a user note", async () => {
        const resp = await supertest(server).get(`/speerapis/notes/${noteIds[0]}`).send({
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        expect(resp.statusCode).toBe(200);
    });

    test("Logging 2nd user with password", async () => {
        const resp = await supertest(server).post("/speerapis/auth/login").send({
            email: "rohit@gmail.com",
            password: "qwerty"
        });

        const cookies = setCookieParser(resp.headers["set-cookie"]);
        user2Details["authToken"] = cookies.find(obj => obj.name == "jwt")?.value;
        user2Details["id"] = resp.body.message.user;

        console.log("JWT2::", user2Details.authToken);

        expect(resp.statusCode).toBe(200);
    });

    test("Logging 3rd user with password", async () => {
        const resp = await supertest(server).post("/speerapis/auth/login").send({
            email: "sohit@gmail.com",
            password: "qwerty"
        });

        const cookies = setCookieParser(resp.headers["set-cookie"]);
        user3Details["authToken"] = cookies.find(obj => obj.name == "jwt")?.value;
        user3Details["id"] = resp.body.message.user;

        console.log("JWT3::", user3Details.authToken);

        expect(resp.statusCode).toBe(200);
    });

    test("Share user 1 note to user 2 with gibberish roles access", async () => {
        console.log(user1Details, user2Details, noteIds[0]);
        const resp = await supertest(server).post(`/speerapis/notes/${noteIds[0]}/share`).send({
            userId: user2Details.id, role: "fsdfsg"
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        expect(resp.statusCode).toBe(401);
    });

    test("Share user 1 note to user 2 with viewer access", async () => {
        console.log(user1Details, user2Details, noteIds[0]);
        const resp = await supertest(server).post(`/speerapis/notes/${noteIds[0]}/share`).send({
            userId: user2Details.id, role: "viewer"
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        expect(resp.statusCode).toBe(200);
    });

    test("user 2 tries sharing to user 3 with editor access", async () => {
        console.log(user1Details, user2Details, noteIds[0]);
        const resp = await supertest(server).post(`/speerapis/notes/${noteIds[0]}/share`).send({
            userId: user3Details.id, role: "editor"
        }).set("Cookie", `jwt=${user2Details.authToken}`);

        expect(resp.statusCode).toBe(401);
    });

    test("user 2 tries sharing to user 3 with viewer access", async () => {
        console.log(user1Details, user2Details, noteIds[0]);
        const resp = await supertest(server).post(`/speerapis/notes/${noteIds[0]}/share`).send({
            userId: user3Details.id, role: "viewer"
        }).set("Cookie", `jwt=${user2Details.authToken}`);

        expect(resp.statusCode).toBe(200);
    });

    test("user 2 tries deleting user 1 note", async () => {
        console.log(user1Details, user2Details, noteIds[1]);
        const resp = await supertest(server).delete(`/speerapis/notes/${noteIds[1]}`).send({
        }).set("Cookie", `jwt=${user2Details.authToken}`);

        expect(resp.statusCode).toBe(401);
    });

    test("Search a text in user note", async () => {
        const resp = await supertest(server).post(`/speerapis/notes/search?q=verity`).send({
        }).set("Cookie", `jwt=${user1Details.authToken}`);

        expect(resp.statusCode).toBe(200);
    });

    // test("Deleting dummy notes", async () => {
    //     console.log("Note Ids:", noteIds);
    //     const resp = await supertest(server).delete("/speerapis/notes/deleteDummyNotes").send({
    //         noteIds
    //     }).set("Cookie", `jwt=${user1Details.authToken}`);

    //     console.log("****1",resp.error);
    //     expect(resp.statusCode).toBe(401);
    // });

    // test("Creating a note without description", async () => {
    //     const resp = await supertest(server).post("/speerapis/notes/create").send({
    //         description: "This is one of the most thrilling novels I've read. Really gripping and horrific at time."
    //     });

    //     expect(resp.statusCode).toBe(200);
    // });


    // notesRoutes.route("/list").get(authenticateToken, controller.listNotes);
    // notesRoutes.route("/:id").get(authenticateToken, controller.getNoteDetails);
    // notesRoutes.route("/create").post(authenticateToken, controller.createNote);
    // notesRoutes.route("/:id").put(authenticateToken, controller.updateNote);
    // notesRoutes.route("/:id").delete(authenticateToken, controller.deleteNote);
    // notesRoutes.route("/:id/share").post(authenticateToken, controller.shareNote);
    // notesRoutes.route("/search").post(authenticateToken, controller.searchNotes);
});
