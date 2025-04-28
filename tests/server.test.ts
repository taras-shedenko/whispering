import supertest from "supertest";
import { getAll, getById } from "../src/stores/whisper";
import { app } from "../src/server";
import {
  checkConnection,
  cleanDB,
  getToken,
  prepDB,
  closeConnection,
} from "./utils";

describe("server", () => {
  beforeAll(checkConnection);
  beforeEach(prepDB);
  afterEach(cleanDB);
  afterAll(closeConnection);

  describe("GET /about", () => {
    it("should return 200", async () => {
      const res = await supertest(app).get("/about");
      expect(res.status).toBe(200);
      expect(res.text).toContain("Welcome to Whispering!");
    });
  });

  describe("GET /login", () => {
    it("should return 200", async () => {
      const res = await supertest(app).get("/login");
      expect(res.status).toBe(200);
      expect(res.text).toContain("Welcome Back!");
    });
  });

  describe("POST /login", () => {
    it("should return 400 when request empty", async () => {
      const res = await supertest(app).post("/login").send({});
      expect(res.status).toBe(400);
    });

    it("should return 400 when username incorrect", async () => {
      const res = await supertest(app)
        .post("/login")
        .send({ username: "incorrect", password: "!QAZ2wsx" });
      expect(res.status).toBe(400);
    });

    it("should return 400 when password incorrect", async () => {
      const res = await supertest(app)
        .post("/login")
        .send({ username: "user", password: "12345678" });
      expect(res.status).toBe(400);
    });

    it("should return 200 when credentials correct", async () => {
      const res = await supertest(app)
        .post("/login")
        .send({ username: "user", password: "!QAZ2wsx" });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /signup", () => {
    it("should return 200", async () => {
      const res = await supertest(app).get("/signup");
      expect(res.status).toBe(200);
      expect(res.text).toContain("Create your account!");
    });
  });

  describe("POST /signup", () => {
    it("should return 400 when request empty", async () => {
      const res = await supertest(app).post("/signup").send({});
      expect(res.status).toBe(400);
    });

    it("should return 400 when username duplicate", async () => {
      const res = await supertest(app)
        .post("/signup")
        .send({ username: "user", password: "!QAZ2wsx" });
      expect(res.status).toBe(400);
    });

    it("should return 400 when password incorrect", async () => {
      const res = await supertest(app)
        .post("/signup")
        .send({ username: "newuser", password: "" });
      expect(res.status).toBe(400);
    });

    it("should return 200 when credentials correct", async () => {
      const res = await supertest(app)
        .post("/signup")
        .send({ username: "newuser", password: "!QAZ2wsx" });
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/whisper", () => {
    it("should return 401 when no authentication", async () => {
      const res = await supertest(app).get("/api/v1/whisper");
      expect(res.status).toBe(401);
    });

    it("should return all messages", async () => {
      const res = await supertest(app)
        .get("/api/v1/whisper")
        .set("Authentication", `Bearer ${await getToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject([{ message: "Hello, World!" }]);
    });
  });

  describe("GET /api/v1/whisper/:id", () => {
    it("should return 401 when no authentication", async () => {
      const res = await supertest(app).get(
        "/api/v1/whisper/0123456789abcd0123456789"
      );
      expect(res.status).toBe(401);
    });

    it("should return 500 when wrong id format", async () => {
      const res = await supertest(app)
        .get("/api/v1/whisper/wrong-id")
        .set("Authentication", `Bearer ${await getToken()}`);
      expect(res.status).toBe(500);
    });

    it("should return 404 when not found", async () => {
      const res = await supertest(app)
        .get("/api/v1/whisper/0123456789abcd0123456789")
        .set("Authentication", `Bearer ${await getToken()}`);
      expect(res.status).toBe(404);
    });

    it("should return message when found", async () => {
      const all = await getAll();
      const id = all[0]._id.toString();
      const res = await supertest(app)
        .get(`/api/v1/whisper/${id}`)
        .set("Authentication", `Bearer ${await getToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ message: "Hello, World!" });
    });
  });

  describe("POST /api/v1/whisper", () => {
    it("should return 401 when no authentication", async () => {
      const res = await supertest(app).post("/api/v1/whisper");
      expect(res.status).toBe(401);
    });

    it("should return 400 when text is missing", async () => {
      const res = await supertest(app)
        .post("/api/v1/whisper")
        .set("Authentication", `Bearer ${await getToken()}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it("should return 201 when text is present", async () => {
      const res = await supertest(app)
        .post("/api/v1/whisper")
        .set("Authentication", `Bearer ${await getToken()}`)
        .send({ message: "Message" });
      expect(res.status).toBe(201);
    });

    it("should save message to db", async () => {
      await supertest(app)
        .post("/api/v1/whisper")
        .set("Authentication", `Bearer ${await getToken()}`)
        .send({ message: "New Message" });
      const all = await getAll();
      const msg = all.find(({ message }) => message === "New Message");
      expect(msg).toBeDefined();
    });
  });

  describe("PUT /api/v1/whisper/:id", () => {
    it("should return 401 when no authentication", async () => {
      const res = await supertest(app).put(
        "/api/v1/whisper/0123456789abcd0123456789"
      );
      expect(res.status).toBe(401);
    });

    it("should return 500 when wrong id format", async () => {
      const res = await supertest(app)
        .put("/api/v1/whisper/wrong-id")
        .set("Authentication", `Bearer ${await getToken()}`)
        .send({ message: "Message" });
      expect(res.status).toBe(500);
    });

    it("should return 400 when text is missing", async () => {
      const res = await supertest(app)
        .put("/api/v1/whisper/0123456789abcd0123456789")
        .set("Authentication", `Bearer ${await getToken()}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it("should return 404 when not found", async () => {
      const res = await supertest(app)
        .put("/api/v1/whisper/0123456789abcd0123456789")
        .set("Authentication", `Bearer ${await getToken()}`)
        .send({ message: "Message" });
      expect(res.status).toBe(404);
    });

    it("should return 200 when updated", async () => {
      const all = await getAll();
      const id = all[0]._id.toString();
      const res = await supertest(app)
        .put(`/api/v1/whisper/${id}`)
        .set("Authentication", `Bearer ${await getToken()}`)
        .send({ message: "Message" });
      expect(res.status).toBe(200);
    });

    it("should update message in db", async () => {
      const all = await getAll();
      const firstId = all[0]._id.toString();
      await supertest(app)
        .put(`/api/v1/whisper/${firstId}`)
        .set("Authentication", `Bearer ${await getToken()}`)
        .send({ message: "New Message" });
      const msg = await getById(firstId);
      expect(msg).toMatchObject({ message: "New Message" });
    });
  });

  describe("DELETE /api/v1/whisper/:id", () => {
    it("should return 401 when no authentication", async () => {
      const res = await supertest(app).delete(
        "/api/v1/whisper/0123456789abcd0123456789"
      );
      expect(res.status).toBe(401);
    });

    it("should return 500 when wrong id format", async () => {
      const res = await supertest(app)
        .delete("/api/v1/whisper/wrong-id")
        .set("Authentication", `Bearer ${await getToken()}`);
      expect(res.status).toBe(500);
    });

    it("should return 404 when not found", async () => {
      const res = await supertest(app)
        .delete("/api/v1/whisper/0123456789abcd0123456789")
        .set("Authentication", `Bearer ${await getToken()}`);
      expect(res.status).toBe(404);
    });

    it("should return 200 when deleted", async () => {
      const all = await getAll();
      const id = all[0]._id.toString();
      const res = await supertest(app)
        .delete(`/api/v1/whisper/${id}`)
        .set("Authentication", `Bearer ${await getToken()}`);
      expect(res.status).toBe(200);
    });

    it("should remove message from db", async () => {
      const all = await getAll();
      const id = all[0]._id.toString();
      await supertest(app)
        .delete(`/api/v1/whisper/${id}`)
        .set("Authentication", `Bearer ${await getToken()}`);
      const msg = await getById(id);
      expect(msg).toBeNull();
    });
  });
});
