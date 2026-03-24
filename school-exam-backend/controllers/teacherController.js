const db = require("../config/db");

exports.createExam = (req,res)=>{

 const teacher_id = req.user.id;

 const {title,subject_id,class_id,exam_date,start_time,duration,total_marks} = req.body;

 db.query(
 `INSERT INTO exams(title,teacher_id,subject_id,class_id,exam_date,start_time,duration,total_marks)
 VALUES(?,?,?,?,?,?,?,?)`,
 [title,teacher_id,subject_id,class_id,exam_date,start_time,duration,total_marks],
 ()=>res.json({message:"Exam created"})
 );

};

exports.addQuestion = (req,res)=>{

 const {exam_id,question_text,option_a,option_b,option_c,option_d,correct_option,marks} = req.body;

 db.query(
 `INSERT INTO questions(exam_id,question_text,option_a,option_b,option_c,option_d,correct_option,marks)
 VALUES(?,?,?,?,?,?,?,?)`,
 [exam_id,question_text,option_a,option_b,option_c,option_d,correct_option,marks],
 ()=>res.json({message:"Question added"})
 );

};

exports.assignExam = (req,res)=>{

 const {exam_id,class_id,student_id} = req.body;

 db.query(
 "INSERT INTO exam_assignments(exam_id,class_id,student_id) VALUES(?,?,?)",
 [exam_id,class_id,student_id],
 ()=>res.json({message:"Exam assigned"})
 );

};