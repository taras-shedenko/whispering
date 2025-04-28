import mongoose from "mongoose";

mongoose.set("toJSON", {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id;
    delete converted.__v;
  },
});

const name = `${process.env.NODE_ENV === "test" ? "test-" : ""}whisper`;
const whisperSchema = new mongoose.Schema({ message: String });
const Whisper = mongoose.model(name, whisperSchema);

export { Whisper };
