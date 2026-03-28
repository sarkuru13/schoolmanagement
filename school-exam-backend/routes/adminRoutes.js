const router = require("express").Router();
const admin = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

/* ---------- CLASS MANAGEMENT ---------- */

router.get("/dashboard-stats", auth, role("admin"), admin.getDashboardStats);

router.post("/class", auth, role("admin"), admin.createClass);
router.get("/classes", auth, role("admin"), admin.getClasses);
router.put("/class", auth, role("admin"), admin.updateClass);
router.delete("/class/:id", auth, role("admin"), admin.deleteClass);

/* ---------- SUBJECT MANAGEMENT ---------- */

router.post("/subject", auth, role("admin"), admin.addSubject);
router.get("/subjects", auth, role("admin"), admin.getSubjects);
router.put("/subject", auth, role("admin"), admin.updateSubject);
router.delete("/subject/:id", auth, role("admin"), admin.deleteSubject);

/* ✅ ADD THIS */
router.get("/subjects-by-class/:class_id", auth, role("admin"), admin.getSubjectsByClass);

/* ---------- TEACHER MANAGEMENT ---------- */

router.post("/teacher", auth, role("admin"), admin.addTeacher);
router.post("/assign-teacher", auth, role("admin"), admin.assignTeacher);
router.post("/unassign-teacher", auth, role("admin"), admin.unassignTeacher);
router.get("/teachers", auth, role("admin"), admin.getTeachers);
router.post("/teacher/:id/reset-password", auth, role("admin"), admin.resetTeacherPassword);

/* ✅ ADD THIS */
router.get("/assigned-teachers/:class_id/:subject_id",
auth,
role("admin"),
admin.getAssignedTeachers
);

/* ---------- STUDENT MANAGEMENT ---------- */

router.post("/student", auth, role("admin"), admin.addStudent);
router.get("/students", auth, role("admin"), admin.getStudents);
router.get("/students-by-class/:class_id", auth, role("admin"), admin.getStudentsByClass);
router.put("/student", auth, role("admin"), admin.updateStudent);
router.delete("/student/:id", auth, role("admin"), admin.deleteStudent);
router.post("/student/:id/reset-password", auth, role("admin"), admin.resetStudentPassword);

/* ---------- RESULT MANAGEMENT ---------- */

router.get("/results-release-list", auth, role("admin"), admin.getResultReleaseList);
router.get("/results-export", auth, role("admin"), admin.getResultsExport);
router.get("/exams/:examId/scores", auth, role("admin"), admin.getExamScores);
router.get("/reexam-requests", auth, role("admin"), admin.getReexamRequests);
router.post("/release", auth, role("admin"), admin.releaseResult);
router.post("/reexam-requests/:id/review", auth, role("admin"), admin.reviewReexamRequest);

module.exports = router;
