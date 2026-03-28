const router = require("express").Router();
const teacher = require("../controllers/teacherController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/stats", auth, role("teacher"), teacher.getTeacherStats);
router.get("/assignments", auth, role("teacher"), teacher.getAssignments);
router.get("/exams/:id", auth, role("teacher"), teacher.getExamDetail);
router.get("/exams/:id/submissions", auth, role("teacher"), teacher.getExamSubmissions);
router.get("/class/:classId/students", auth, role("teacher"), teacher.getStudentsInClass);
router.get("/exams", auth, role("teacher"), teacher.getMyExams);

router.put("/exams/:id", auth, role("teacher"), teacher.updateExam);
router.delete("/exams/:id", auth, role("teacher"), teacher.deleteExam);
router.post("/exams/:id/import-questions", auth, role("teacher"), teacher.importQuestions);

router.put("/questions/:id", auth, role("teacher"), teacher.updateQuestion);
router.delete("/questions/:id", auth, role("teacher"), teacher.deleteQuestion);

router.post("/exam", auth, role("teacher"), teacher.createExam);
router.post("/question", auth, role("teacher"), teacher.addQuestion);
router.post("/assign", auth, role("teacher"), teacher.assignExam);
router.post("/reexam-request", auth, role("teacher"), teacher.createReexamRequest);

module.exports = router;
