const db = require("../config/db");
const {calculateResult} = require("../utils/resultCalculator");

exports.getExams = (req,res)=>{

 const user_id = req.user.id;

 db.query(
 `SELECT e.*
 FROM exams e
 JOIN exam_assignments ea ON ea.exam_id=e.id
 JOIN students s ON s.user_id=?
 WHERE ea.class_id=s.class_id OR ea.student_id=s.id`,
 [user_id],
 (err,rows)=>res.json(rows)
 );

};

exports.submitExam = async (req,res)=>{

 const {exam_id,answers} = req.body;
 const student_id = req.user.id;

 answers.forEach(a=>{

  db.query(
  "INSERT INTO student_answers(exam_id,student_id,question_id,selected_option) VALUES(?,?,?,?)",
  [exam_id,student_id,a.question_id,a.answer]
  );

 });

 const score = await calculateResult(exam_id,student_id);

 db.query(
 "INSERT INTO results(exam_id,student_id,score) VALUES(?,?,?)",
 [exam_id,student_id,score]
 );

 res.json({message:"Exam submitted",score});

};

exports.getResults = (req,res)=>{

 const student_id = req.user.id;

 db.query(
 "SELECT * FROM results WHERE student_id=? AND released=TRUE",
 [student_id],
 (err,rows)=>res.json(rows)
 );

};