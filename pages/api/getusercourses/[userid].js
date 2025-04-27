import dbConnect from "../../lib/db.js"; // adjust path if needed
import User from "../../models/userSchema.js"; // adjust path if needed

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  console.log("Function invoked");

  try {
    await dbConnect(); // Important to ensure DB connection on serverless

    const { userId } = req.query; // <-- dynamic [userId] from URL
    console.log(req.query);

    const user = await User.findById(userId).populate({
      path: "courses",
      select: "title description price duration instructor image",
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      courses: user.courses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
