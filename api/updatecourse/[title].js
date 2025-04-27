import dbConnect from "../../lib/db.js"; // adjust path if needed
import Course from "../../models/courseSchema.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", "*"); // or specific domain
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

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const { title } = req.query; // Vercel way of getting dynamic id from URL

    // Find course
    const course = await Course.findOne({ title });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update fields
    course.title = req.body.title || course.title;
    course.instructor = req.body.instructor || course.instructor;
    course.description = req.body.description || course.description;
    course.syllabus = req.body.syllabus || course.syllabus;
    course.price = req.body.price || course.price;
    course.duration = req.body.duration || course.duration;
    course.timing = req.body.timing || course.timing;

    // ⚡ Image updating skipped here because Vercel serverless functions cannot easily handle file uploads (like multer buffer) directly
    // You can update image separately using Cloudinary or another API

    // Save
    const updatedCourse = await course.save();

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
