import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { generateToken, requireAuthentication } from "./utils";

import {
  getAll,
  getById,
  create as createWhisper,
  updateById,
  deleteById,
} from "./stores/whisper";

import { getByCredentials, create as createUser } from "./stores/user";

mongoose.set("toJSON", {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id;
    delete converted.__v;
  },
});

export const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.get("/about", async (req: any, res) => {
  const whispers = await getAll();
  res.render("about", { whispers });
});

app.get("/login", async (req: any, res) => {
  try {
    res.render("login");
  } catch (e) {
    console.log(e);
  }
});

app.post("/login", async (req: any, res) => {
  try {
    const { username, password } = req.body;
    const user = await getByCredentials(username, password);
    const token = generateToken({ username, id: user._id });
    res.json({ accessToken: token });
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e: any) {
    res.sendStatus(400);
  }
});

app.get("/signup", async (req: any, res) => {
  res.render("signup");
});

app.post("/signup", async (req: any, res) => {
  try {
    const { username, password } = req.body;
    const user = await createUser(username, password);
    const token = generateToken({ username, id: user._id });
    res.json({ accessToken: token });
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    res.sendStatus(400);
  }
});

app.get("/api/v1/whisper", requireAuthentication, async (req: any, res) => {
  const whispers = await getAll();
  res.json(whispers);
});

app.get("/api/v1/whisper/:id", requireAuthentication, async (req: any, res) => {
  const id = req.params.id;
  const whisper = await getById(id);
  if (whisper) res.json(whisper);
  else res.sendStatus(404);
});

app.post("/api/v1/whisper", requireAuthentication, async (req: any, res) => {
  const { message } = req.body;
  if (message) res.status(201).json(await createWhisper(message, req.user.id));
  else res.sendStatus(400);
});

app.put("/api/v1/whisper/:id", requireAuthentication, async (req: any, res) => {
  const id = req.params.id;
  const { message } = req.body;
  if (!message) return void res.sendStatus(400);
  let whisper: any = await getById(id);
  if (!whisper) return void res.sendStatus(404);
  if (whisper.author.id !== req.user.id) return void res.sendStatus(403);
  whisper = await updateById(id, message);
  res.json(whisper);
});

app.delete(
  "/api/v1/whisper/:id",
  requireAuthentication,
  async (req: any, res) => {
    const id = req.params.id;
    const whisper: any = await getById(id);
    if (!whisper) return void res.sendStatus(404);
    if (whisper.author.id !== req.user.id) return void res.sendStatus(403);
    await deleteById(id);
    res.sendStatus(200);
  }
);
