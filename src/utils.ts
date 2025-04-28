import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const getCollectionName = (name: string) =>
  (process.env.NODE_ENV === "test" ? "test-" : "") + name;

export const validatePassword = (password: string) =>
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
    password
  );

export const generateToken = (data: any) =>
  jwt.sign({ data }, process.env.JWT_SECRET!, { expiresIn: "1h" });

export const requireAuthentication: RequestHandler = (req: any, res, next) => {
  try {
    const token = req.headers.authentication;
    if (!token) throw new Error();
    const payload: any = jwt.verify(
      token.split(" ")[1],
      process.env.JWT_SECRET!
    );
    req.user = payload.data;
    next();
    /* eslint-disable @typescript-eslint/no-unused-vars */
  } catch (e) {
    res.sendStatus(401);
  }
};
