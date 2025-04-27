// /api/getCourses.js

import dbConnect from "../../lib/db.js"; // Connect to MongoDB
import Course from "../../models/Course"; // Your Mongoose model

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Server Error" });
  }
}
