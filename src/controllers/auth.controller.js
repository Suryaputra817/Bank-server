import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail,sendOTPEmail,sendWelcomeEmail } from "../services/email.service.js";
import { generateOTP } from "../utils/otp.util.js";
import OTP from "../model/otp.model.js";
import crypto from "crypto";

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
    verified: false,
  });
const otp = generateOTP();
const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
await OTP.create({
  email,
  user: newUser._id.toString(),
  otpHash,
});
await sendOTPEmail(newUser.email, newUser.name, otp).catch((err) =>
  console.error("Failed to send OTP email:", err),
);

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
  // await sendEmail(newUser.email, newUser.name);
  res.status(201).json({
    message: "User created successfully",
    user: {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      verified: newUser.verified,
    },
    token,
  });
  
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
      verified: user.verified,
    },
    token,
  });
}

export async function verifyEmail(req, res) {
  const { email, otp } = req.body;
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const otpRecord = await OTP.findOne({
    email,
    otpHash,
  });
  if (!otpRecord) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }
  const user = await userModel.findByIdAndUpdate(
    otpRecord.user,
    { verified: true },
    { new: true },
  );
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  await OTP.deleteMany({ email, otpHash });
  await sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error("Email failed:", err),
  );
  return res.status(200).json({
    message: "Email verified successfully",
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      verified: user.verified,
    },
  });
}
