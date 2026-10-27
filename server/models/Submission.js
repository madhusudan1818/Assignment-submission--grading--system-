const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answer: { type: String, default: "", trim: true, maxlength: 10000 },
    link: { type: String, default: "", trim: true, maxlength: 500 },
    submittedAt: { type: Date, default: Date.now },
    marks: { type: Number, default: null, min: 0 },
    feedback: { type: String, default: "", trim: true, maxlength: 2000 },
    gradedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One submission per student per assignment (resubmission updates it)
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
