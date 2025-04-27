import dbConnect from "../lib/db.js"; // Connect to MongoDB
import Course from "../models/courseSchema.js"; // Your Mongoose model

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await dbConnect(); // always connect first

    const courses = await Course.find(); // fetch courses
    res.status(200).json(courses); // send response
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
