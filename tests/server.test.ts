import supertest from "supertest";
import { getAll, getById } from "../src/dbStore";
import { app } from "../src/server";
import { checkConnection, clearDB, setDB, closeConnection } from "./utils";
import { mockData } from "./fixtures";

describe("server", () => {
  beforeAll(checkConnection);
  beforeEach(() => setDB(mockData));
  afterEach(clearDB);
  afterAll(closeConnection);

  describe("GET /about", () => {
    it("should return 200", async () => {
      const res = await supertest(app).get("/about");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/whisper", () => {
    it("should return all messages", async () => {
      const res = await supertest(app).get("/api/v1/whisper");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject([{ message: "Hello, World!" }]);
    });
  });

  describe("GET /api/v1/whisper/:id", () => {
    it("should return 500 when wrong id format", async () => {
      const res = await supertest(app).get("/api/v1/whisper/wrong-id");
      expect(res.status).toBe(500);
    });

    it("should return 404 when not found", async () => {
      const res = await supertest(app).get(
        "/api/v1/whisper/0123456789abcd0123456789"
      );
      expect(res.status).toBe(404);
    });

    it("should return message when found", async () => {
      const all = await getAll();
      const firstId = all[0]._id.toString();
      const res = await supertest(app).get(`/api/v1/whisper/${firstId}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ message: "Hello, World!" });
    });
  });

  describe("POST /api/v1/whisper", () => {
    it("should return 400 when text is missing", async () => {
      const res = await supertest(app).post("/api/v1/whisper").send({});
      expect(res.status).toBe(400);
    });

    it("should return 201 when text is present", async () => {
      const res = await supertest(app)
        .post("/api/v1/whisper")
        .send({ message: "Message" });
      expect(res.status).toBe(201);
    });

    it("should save message to db", async () => {
      await supertest(app)
        .post("/api/v1/whisper")
        .send({ message: "New Message" });
      const all = await getAll();
      const msg = all.find(({ message }) => message === "New Message");
      expect(msg).toBeDefined();
    });
  });

  describe("PUT /api/v1/whisper/:id", () => {
    it("should return 500 when wrong id format", async () => {
      const res = await supertest(app)
        .put("/api/v1/whisper/wrong-id")
        .send({ message: "Message" });
      expect(res.status).toBe(500);
    });

    it("should return 400 when text is missing", async () => {
      const res = await supertest(app)
        .put("/api/v1/whisper/0123456789abcd0123456789")
        .send({});
      expect(res.status).toBe(400);
    });

    it("should return 404 when not found", async () => {
      const res = await supertest(app)
        .put("/api/v1/whisper/0123456789abcd0123456789")
        .send({ message: "Message" });
      expect(res.status).toBe(404);
    });

    it("should return 200 when updated", async () => {
      const all = await getAll();
      const firstId = all[0]._id.toString();
      const res = await supertest(app)
        .put(`/api/v1/whisper/${firstId}`)
        .send({ message: "Message" });
      expect(res.status).toBe(200);
    });

    it("should update message in db", async () => {
      const all = await getAll();
      const firstId = all[0]._id.toString();
      await supertest(app)
        .put(`/api/v1/whisper/${firstId}`)
        .send({ message: "New Message" });
      const msg = await getById(firstId);
      expect(msg).toMatchObject({ message: "New Message" });
    });
  });

  describe("DELETE /api/v1/whisper/:id", () => {
    it("should return 500 when wrong id format", async () => {
      const res = await supertest(app).delete("/api/v1/whisper/wrong-id");
      expect(res.status).toBe(500);
    });

    it("should return 404 when not found", async () => {
      const res = await supertest(app).delete(
        "/api/v1/whisper/0123456789abcd0123456789"
      );
      expect(res.status).toBe(404);
    });

    it("should return 200 when deleted", async () => {
      const all = await getAll();
      const firstId = all[0]._id.toString();
      const res = await supertest(app).delete(`/api/v1/whisper/${firstId}`);
      expect(res.status).toBe(200);
    });

    it("should remove message from db", async () => {
      const all = await getAll();
      const firstId = all[0]._id.toString();
      await supertest(app).delete(`/api/v1/whisper/${firstId}`);
      const msg = await getById(firstId);
      expect(msg).toBeNull();
    });
  });
});
