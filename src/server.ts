import express from "express";
import bodyParser from "body-parser";

import { getAll, getById, create, updateById, deleteById } from "./dbStore";

export const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.get("/about", async (res, req) => {
  const whispers = await getAll();
  req.render("about", { whispers });
});

app.get("/api/v1/whisper", async (req, res) => {
  const whispers = await getAll();
  res.json(whispers);
});

app.get("/api/v1/whisper/:id", async (req, res) => {
  const id = req.params.id;
  const whisper = await getById(id);
  if (whisper) res.json(whisper);
  else res.sendStatus(404);
});

app.post("/api/v1/whisper", async (req, res) => {
  const { message } = req.body;
  if (message) res.status(201).json(await create(message));
  else res.sendStatus(400);
});

app.put("/api/v1/whisper/:id", async (req, res) => {
  const id = req.params.id;
  const { message } = req.body;
  if (!message) return void res.sendStatus(400);
  let whisper = await getById(id);
  if (!whisper) return void res.sendStatus(404);
  whisper = await updateById(id, message);
  res.json(whisper);
});

app.delete("/api/v1/whisper/:id", async (req, res) => {
  const id = req.params.id;
  const whisper = await getById(id);
  if (!whisper) return void res.sendStatus(404);
  await deleteById(id);
  res.sendStatus(200);
});
