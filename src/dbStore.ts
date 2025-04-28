import { Whisper } from "./dbModel";

export const getAll = () => Whisper.find();

export const getById = (byId: string) => Whisper.findById({ _id: byId });

export const create = async (message: string) => {
  const whisper = new Whisper({ message });
  await whisper.save();
  return whisper;
};

export const updateById = async (byId: string, message: string) =>
  Whisper.findOneAndUpdate({ _id: byId }, { message: message }, { new: false });

export const deleteById = async (byId: string) =>
  Whisper.deleteOne({ _id: byId });
