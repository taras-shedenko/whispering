import User from "../models/User";

export const create = async (username: string, password: string) => {
  const user = new User({ username, password });
  await user.save();
  return user;
};

export const getByCredentials = async (username: string, password: string) => {
  const user = await User.findOne({ username });
  if (!user) throw new Error("Not found");
  if (!(await user.comparePassword(password)))
    throw new Error("Wrong password");
  return user;
};
