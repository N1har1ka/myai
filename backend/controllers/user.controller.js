import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";

export const createUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const user = await userService.createUser({ email, password });
    // const user = await userService.createUser(req.body);

    const token = await user.genrateJWT();
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const loginUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ errors: "Invalid credentials" });
    }
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ errors: "Invalid credentials" });
    }
    const token = await user.genrateJWT();
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const profileController = async (req, res) => {
  console.log(req.user);
  res.status(200).json({
    user: req.user,
  });
};

export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ error: "Unauthorized user" });
    }
    // Invalidate the token in Redis
    await redisClient.set(token, "logout", "EX", 60 * 60 * 24);
    // res.clearCookie("token");
    res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).send({ error: error.printStack || error.message });
  }
};
