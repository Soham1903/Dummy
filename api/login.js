import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import dbConnect from "../lib/db.js"; // We'll need to manually connect to DB inside serverless
dotenv.config();

const allowedOrigins = ["*"]; // Adjust this list

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-Origin",
      allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "*"
    );
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.status(200).end();
    return;
  }

  res.setHeader(
    "Access-Control-Allow-Origin",
    allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "*"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  await dbConnect(); // Connect to MongoDB (important in Vercel serverless)

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password Valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    console.log("Token:", token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
