import fs from "node:fs/promises";
import path from "node:path";
import { FSMessage } from "./types";

const fileName = path.join(process.cwd(), "db.json");

const save = (data: Array<FSMessage>) =>
  fs.writeFile(fileName, JSON.stringify(data));

export const getAll = async () =>
  JSON.parse(await fs.readFile(fileName, "utf-8")) as Array<FSMessage>;

export const getById = async (byId: string) => {
  const data = await getAll();
  return data.find(({ id }) => id === byId);
};

export const create = async (message: string) => {
  const data = await getAll();
  const newItem: FSMessage = { message, id: "" + data.length };
  await save([...data, newItem]);
  return newItem;
};

export const updateById = async (byId: string, message: string) => {
  const data = await getAll();
  const item = data.find(({ id }) => id === byId);
  if (item) item.message = message;
  await save(data);
  return item;
};

export const deleteById = async (byId: string) => {
  let data = await getAll();
  data = data.filter(({ id }) => id !== byId);
  await save(data);
};
