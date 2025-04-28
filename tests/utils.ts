import { writeFileSync } from "node:fs";
import { join } from "node:path";
import mongoose from "mongoose";
import { FSMessage } from "../src/types";
import User from "../src/models/User";
import Whisper from "../src/models/Whisper";
import { generateToken } from "../src/utils";

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

export const prepDB = async () => {
  const user = await User.insertOne({
    username: "user",
    password: "!QAZ2wsx",
  });
  await Whisper.insertOne({
    message: "Hello, World!",
    author: user._id.toHexString(),
  });
};

export const getToken = async () => {
  const user: any = await User.findOne();
  return generateToken({ username: user.username, id: user._id.toString() });
};

export const cleanDB = async () => {
  await Whisper.deleteMany();
  await User.deleteMany();
};
