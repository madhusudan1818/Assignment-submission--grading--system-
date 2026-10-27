const express = require("express");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// GET /api/assignments
// Teacher: their own assignments (with submission counts)
// Student: every assignment (with their own submission, if any)
router.get("/", async (req, res, next) => {
  try {
    if (req.user.role === "teacher") {
      const assignments = await Assignment.find({ teacher: req.user._id })
        .sort({ createdAt: -1 })
        .lean();
      const counts = await Submission.aggregate([
        { $match: { assignment: { $in: assignments.map((a) => a._id) } } },
        {
          $group: {
            _id: "$assignment",
            total: { $sum: 1 },
            graded: { $sum: { $cond: [{ $ne: ["$marks", null] }, 1, 0] } },
          },
        },
      ]);
      const byId = Object.fromEntries(counts.map((c) => [String(c._id), c]));
      return res.json(
        assignments.map((a) => ({
          ...a,
          submissionCount: byId[String(a._id)]?.total || 0,
          gradedCount: byId[String(a._id)]?.graded || 0,
        }))
      );
    }

    const assignments = await Assignment.find()
      .populate("teacher", "name")
      .sort({ dueDate: 1 })
      .lean();
    const mine = await Submission.find({ student: req.user._id }).lean();
    const byAssignment = Object.fromEntries(mine.map((s) => [String(s.assignment), s]));
    res.json(assignments.map((a) => ({ ...a, submission: byAssignment[String(a._id)] || null })));
  } catch (err) {
    next(err);
  }
});

// POST /api/assignments (teacher)
router.post("/", requireRole("teacher"), async (req, res, next) => {
  try {
    const { title, description, dueDate, maxMarks } = req.body;
    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      maxMarks: maxMarks || 100,
      teacher: req.user._id,
    });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/assignments/:id (teacher who owns it)
router.delete("/:id", requireRole("teacher"), async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    await Submission.deleteMany({ assignment: assignment._id });
    await assignment.deleteOne();
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    next(err);
  }
});

// GET /api/assignments/:id/submissions (teacher who owns it)
router.get("/:id/submissions", requireRole("teacher"), async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    const submissions = await Submission.find({ assignment: assignment._id })
      .populate("student", "name email")
      .sort({ submittedAt: 1 })
      .lean();
    res.json({ assignment, submissions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
