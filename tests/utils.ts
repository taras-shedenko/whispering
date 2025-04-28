import { writeFileSync } from "node:fs";
import { join } from "node:path";
import mongoose from "mongoose";
import { FSMessage, Message } from "../src/types";
import { Whisper } from "../src/dbModel";

const fileName = join(process.cwd(), "db.json");

export const setFS = (data: FSMessage[] = []) =>
  writeFileSync(fileName, JSON.stringify(data));

export const checkConnection = () => {
  if (mongoose.connection.readyState === 1) return;
  return mongoose.connect(process.env.DB_CONN!);
};

export const closeConnection = () => {
  mongoose.connection.readyState === 1 && mongoose.disconnect();
};

export const clearDB = () => Whisper.deleteMany();

export const setDB = (data: Message[] = []) => Whisper.insertMany(data);