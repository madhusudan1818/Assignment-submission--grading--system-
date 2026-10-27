const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    dueDate: { type: Date, required: [true, "Due date is required"] },
    maxMarks: { type: Number, required: [true, "Max marks is required"], min: 1, max: 1000, default: 100 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

assignmentSchema.index({ teacher: 1, createdAt: -1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
