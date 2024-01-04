const supertest = require("supertest");

const server = require("../../app");

describe('Signup testing', () => {

    test("Signing up new user with password less than 6 chars", async () => {
        const resp = await supertest(server).post("/speerapis/auth/signup").send({
            email: "ming@nfs.com",
            password: "pass"
        });

        expect(resp.statusCode).toBe(401);
    });


    test("Signing up an user with invalid email format", async () => {
        const resp = await supertest(server).post("/speerapis/auth/signup").send({
            email: "mingnfs.com",
            password: "lamborghini"
        });

        expect(resp.statusCode).toBe(401);
    });

    test("Signing up new user with password more than 6 chars", async () => {
        const resp = await supertest(server).post("/speerapis/auth/signup").send({
            email: "ming@nfs.com",
            password: "lamborghini"
        });

        expect(resp.statusCode).toBe(200);
    });

    test("Signing up an user which already exists", async () => {
        const resp = await supertest(server).post("/speerapis/auth/signup").send({
            email: "ming@nfs.com",
            password: "lamborghini"
        });

        expect(resp.statusCode).toBe(401);
    });

    test("Sigin a user which doesn't exists", async () => {
        const resp = await supertest(server).post("/speerapis/auth/login").send({
            email: "webster@nfs.com",
            password: "lamborg"
        });

        expect(resp.statusCode).toBe(401);
    });

    test("Sigin a user with wrong password", async () => {
        const resp = await supertest(server).post("/speerapis/auth/login").send({
            email: "ming@nfs.com",
            password: "lamborg"
        });

        expect(resp.statusCode).toBe(401);
    });

    test("Sigin a user which exists", async () => {
        const resp = await supertest(server).post("/speerapis/auth/login").send({
            email: "ming@nfs.com",
            password: "lamborghini"
        });

        expect(resp.statusCode).toBe(200);
    });

    test("Delete all dummy records", async () => {
        const resp = await supertest(server).delete("/speerapis/auth/deleteDummyRecords");

        expect(resp.statusCode).toBe(200);
    });
});
