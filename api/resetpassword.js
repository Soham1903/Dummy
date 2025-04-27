import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "../lib/db.js"; // your db connection helper
import User from "../model/userSchema.js";

dotenv.config();

export const resetPassword = async (req, res) => {
  try {
    await dbConnect(); // Connect to DB

    const { token } = req.query; // ✅ token from query parameters
    const { newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password correctly
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the password
    user.password = hashedPassword; // ❗ Use hashed password (not plain)
    await user.save();

    res.status(200).json({ message: "Password successfully updated" });
  } catch (error) {
    console.error("Reset Password Error:", error);

    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Reset token has expired. Please request again." });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};
