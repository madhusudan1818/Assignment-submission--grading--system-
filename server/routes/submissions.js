const express = require("express");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

const isHttpUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// POST /api/submissions (student) - submit or resubmit before grading/deadline
router.post("/", requireRole("student"), async (req, res, next) => {
  try {
    const { assignmentId, answer = "", link = "" } = req.body;
    if (!assignmentId) return res.status(400).json({ message: "assignmentId is required" });
    if (!answer.trim() && !link.trim()) {
      return res.status(400).json({ message: "Provide an answer, a link, or both" });
    }
    if (link.trim() && !isHttpUrl(link.trim())) {
      return res.status(400).json({ message: "Link must start with http:// or https://" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: "The deadline for this assignment has passed" });
    }

    const existing = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
    if (existing && existing.marks !== null) {
      return res.status(400).json({ message: "Already graded - you can no longer change this submission" });
    }

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignment._id, student: req.user._id },
      { answer, link: link.trim(), submittedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
    res.status(existing ? 200 : 201).json(submission);
  } catch (err) {
    next(err);
  }
});

// PUT /api/submissions/:id/grade (teacher who owns the assignment)
router.put("/:id/grade", requireRole("teacher"), async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const assignment = await Assignment.findOne({
      _id: submission.assignment,
      teacher: req.user._id,
    });
    if (!assignment) return res.status(403).json({ message: "Not your assignment" });

    const marks = Number(req.body.marks);
    if (req.body.marks === "" || req.body.marks === null || Number.isNaN(marks)) {
      return res.status(400).json({ message: "Marks must be a number" });
    }
    if (marks < 0 || marks > assignment.maxMarks) {
      return res.status(400).json({ message: `Marks must be between 0 and ${assignment.maxMarks}` });
    }

    submission.marks = marks;
    submission.feedback = req.body.feedback || "";
    submission.gradedAt = new Date();
    await submission.save();
    res.json(submission);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
