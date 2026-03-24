const router = require("express").Router();
const teacher = require("../controllers/teacherController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.post("/exam",auth,role("teacher"),teacher.createExam);
router.post("/question",auth,role("teacher"),teacher.addQuestion);
router.post("/assign",auth,role("teacher"),teacher.assignExam);

module.exports = router;