import Whisper from "../models/Whisper";

export const getAll = () => Whisper.find().populate("author", "username");

export const getById = (byId: string) =>
  Whisper.findById({ _id: byId }).populate("author", "username");

export const create = async (message: string, authorId: string) => {
  const whisper = new Whisper({ message, author: authorId });
  await whisper.save();
  return whisper;
};

export const updateById = async (byId: string, message: string) =>
  Whisper.findOneAndUpdate({ _id: byId }, { message: message }, { new: false });

export const deleteById = async (byId: string) =>
  Whisper.deleteOne({ _id: byId });
