import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import sendRegisterEmail from "../services/email.service.js";

export async function userRegister(req, res) {
  const { email, password, name } = req.body;
  const isEmailExists = await userModel.findOne({
    email,
  });
  if (isEmailExists) {
    return res.status(422).json({
      message: "User already exists with this email",
      status: "failed",
    });
  }
  const newUser = await userModel.create({
    email,
    password,
    name,
  });
  const token = jwt.sign(
    {
      userId: newUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    },
  );
  res.cookie("token", token);
  // await sendRegisterEmail(newUser.email, newUser.name);
  res.status(201).json({
    message: "User created successfully",
    user: {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
    },
    token,
  });
  await sendRegisterEmail(newUser.email, newUser.name).catch((err) =>
    console.error("Email failed:", err),
  );
}

export async function userLogin(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      message: "User not found with this email address",
    });
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid password",
    });
  }
  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );
  res.cookie("token", token);

  return res.status(200).json({
    message: "Login successful",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}
