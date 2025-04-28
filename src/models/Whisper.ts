import { Schema, model } from "mongoose";
import { getCollectionName } from "../utils";

interface IWhisper {
  author: Schema.Types.ObjectId;
  message: string;
  createdDate: Date;
  updatedDate: Date;
}

const whisperSchema = new Schema<IWhisper>({
  author: { type: Schema.Types.ObjectId, ref: getCollectionName("User") },
  message: String,
  createdDate: { type: Date, default: () => new Date() },
  updatedDate: { type: Date, default: () => new Date() },
});

whisperSchema.pre("save", function (next) {
  this.updatedDate = new Date();
  next();
});

export default model(getCollectionName("Whisper"), whisperSchema);
