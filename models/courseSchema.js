import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique IDs

const CourseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    default: () => uuidv4().split("-")[0],
    unique: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: {
    filename: String, // Name of the image file
    contentType: String, // MIME type of the image
    imageBase64: String, // Image stored as a base64 string
  },
  instructor: { type: String, required: true }, // New Field
  timing: { type: String, required: true }, // New Field (e.g. 10:00 AM)
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  benefits: { type: String, required: true }, // New Field (e.g. key benefits)
  syllabus: { type: String, required: true },
});

const Course = mongoose.model("Course", CourseSchema);

export default Course;
