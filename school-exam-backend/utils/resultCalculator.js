const db = require("../config/db");

exports.calculateResult = (exam_id,student_id)=>{

 return new Promise((resolve,reject)=>{

  const query = `
  SELECT q.correct_option, sa.selected_option, q.marks
  FROM questions q
  JOIN student_answers sa
  ON q.id = sa.question_id
  WHERE sa.exam_id=? AND sa.student_id=?`;

  db.query(query,[exam_id,student_id],(err,rows)=>{

   if(err) return reject(err);

   let score = 0;

   rows.forEach(r=>{
    if(r.correct_option === r.selected_option){
      score += r.marks;
    }
   });

   resolve(score);

  });

 });

};