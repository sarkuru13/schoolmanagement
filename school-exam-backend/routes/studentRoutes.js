const router = require("express").Router();
const student = require("../controllers/studentController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/exams/:examId/attempt", auth, role("student"), student.getExamAttempt);
router.get("/exams", auth, role("student"), student.getExams);
router.post("/submit", auth, role("student"), student.submitExam);
router.get("/results", auth, role("student"), student.getResults);

module.exports = router;
