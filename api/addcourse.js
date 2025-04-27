import dbConnect from "../lib/db.js"; // Connect to MongoDB
import Course from "../models/courseSchema.js"; // Your Mongoose model
import multiparty from "multiparty";

export const config = {
  api: {
    bodyParser: false, // Important: because we're handling file upload manually
  },
};

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

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const form = new multiparty.Form();

  form.parse(req, async function (err, fields, files) {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Error parsing form data" });
    }

    try {
      const {
        title,
        description,
        price,
        duration,
        syllabus,
        instructor,
        timing,
        benefits,
      } = fields;

      let image = null;
      if (files && files.image && files.image.length > 0) {
        const file = files.image[0];
        const buffer = await fileToBuffer(file.path);

        image = {
          filename: file.originalFilename,
          contentType: file.headers["content-type"],
          imageBase64: buffer.toString("base64"),
        };
      }

      const newCourse = new Course({
        title: title[0],
        description: description[0],
        price: price[0],
        duration: duration[0],
        syllabus: syllabus[0],
        instructor: instructor[0],
        timing: timing[0],
        benefits: benefits[0],
        image,
      });

      await newCourse.save();

      res
        .status(201)
        .json({ message: "Course added successfully!", course: newCourse });
    } catch (error) {
      console.error("Error adding course:", error);
      res.status(500).json({ error: "Server Error" });
    }
  });
}

// Helper function to convert file path to buffer
import { promises as fs } from "fs";
async function fileToBuffer(path) {
  return await fs.readFile(path);
}
