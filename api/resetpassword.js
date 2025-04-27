import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "../lib/db.js"; // your db connection helper
import User from "../model/userSchema.js";

dotenv.config();

export const resetPassword = async (req, res) => {
  try {
    console.log("Starting password reset process...");

    await dbConnect();
    console.log("Database connected successfully");

    const { token } = req.query;
    const { newPassword } = req.body;

    console.log("Received token:", token);
    console.log("Received newPassword:", newPassword ? "exists" : "missing");

    if (!token) {
      console.log("No token provided");
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (!newPassword) {
      console.log("No new password provided");
      return res.status(400).json({ message: "New password is required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    console.log("Searching for user with ID:", decoded.id);
    const user = await User.findById(decoded.id);
    console.log("User found:", user);

    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password correctly
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log("Password hashed successfully");

    // Update the password
    user.password = hashedPassword;
    await user.save();
    console.log("Password updated successfully");

    res.status(200).json({ message: "Password successfully updated" });
  } catch (error) {
    console.error("Reset Password Error:", error);

    if (error.name === "TokenExpiredError") {
      console.log("Token expired error");
      return res
        .status(400)
        .json({ message: "Reset token has expired. Please request again." });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};
