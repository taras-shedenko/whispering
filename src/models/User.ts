import { Model, Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { getCollectionName, validatePassword } from "../utils";

interface IUser {
  username: string;
  password: string;
}

interface IUserMethods {
  comparePassword(newPassword: string): Promise<boolean>;
}

/* eslint-disable  @typescript-eslint/no-empty-object-type */
type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    unique: true,
    trim: true,
    required: [true, "Username is required"],
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [20, "Username must be at most 20 characters long"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    validate: { validator: validatePassword },
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, await bcrypt.genSalt());
  next();
});

userSchema.methods.comparePassword = function (newPassword: string) {
  return bcrypt.compare(newPassword, this.password);
};

export default model(getCollectionName("User"), userSchema);
