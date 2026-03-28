const db = require("../config/db");
const bcrypt = require("bcryptjs");

/* ---------- CLASS MANAGEMENT ---------- */

exports.createClass = (req,res)=>{

const {class_name} = req.body;

db.query(
"INSERT INTO classes(class_name) VALUES(?)",
[class_name],
(err)=>{
if(err) return res.status(500).json(err);
res.json({message:"Class created"});
}
);

};

exports.getClasses = (req,res)=>{

db.query(
"SELECT * FROM classes",
(err,result)=>{
if(err) return res.status(500).json(err);
res.json(result);
}
);

};

exports.updateClass = (req,res)=>{

const {id,class_name} = req.body;

db.query(
"UPDATE classes SET class_name=? WHERE id=?",
[class_name,id],
(err)=>{
if(err) return res.status(500).json(err);
res.json({message:"Class updated"});
}
);

};

exports.deleteClass = (req,res)=>{

const {id} = req.params;

db.query(
"DELETE FROM classes WHERE id=?",
[id],
(err)=>{
if(err) return res.status(500).json(err);
res.json({message:"Class deleted"});
}
);

};


/* ---------- SUBJECT MANAGEMENT ---------- */

exports.addSubject = (req,res)=>{

const {subject_name,class_id} = req.body;

db.query(
"INSERT INTO subjects(subject_name,class_id) VALUES(?,?)",
[subject_name,class_id],
(err)=>{
if(err) return res.status(500).json(err);
res.json({message:"Subject created"});
}
);

};

exports.getSubjects = (req,res)=>{

db.query(
`SELECT subjects.id,
        subjects.subject_name,
        subjects.class_id,
        classes.class_name
 FROM subjects
 LEFT JOIN classes ON subjects.class_id = classes.id`,
(err,result)=>{
if(err) return res.status(500).json(err);
res.json(result);
}
);

};

exports.getSubjectsByClass = (req,res)=>{

const {class_id} = req.params;

db.query(
"SELECT * FROM subjects WHERE class_id=?",
[class_id],
(err,result)=>{
if(err) return res.status(500).json(err);
res.json(result);
}
);

};

exports.updateSubject = (req,res)=>{

const {id,subject_name,class_id} = req.body;

db.query(
"UPDATE subjects SET subject_name=?, class_id=? WHERE id=?",
[subject_name,class_id,id],
(err)=>{
if(err) return res.status(500).json(err);
res.json({message:"Subject updated"});
}
);

};

exports.deleteSubject = (req,res)=>{

const {id} = req.params;

db.query(
"DELETE FROM subjects WHERE id=?",
[id],
(err)=>{
if(err) return res.status(500).json(err);
res.json({message:"Subject deleted"});
}
);

};

exports.addSyllabus = (req,res)=>{

const {subject_id,chapter_title} = req.body;

db.query(
"INSERT INTO syllabus(subject_id,chapter_title) VALUES(?,?)",
[subject_id,chapter_title],
(err)=>{
if(err) return res.status(500).json(err);
res.json({message:"Syllabus added"});
}
);

};


/* ---------- TEACHER MANAGEMENT ---------- */

exports.addTeacher = async (req,res)=>{

const {name,email,password,specialization} = req.body;

const hash = await bcrypt.hash(password,10);

db.query(
"INSERT INTO users(name,email,password,role) VALUES(?,?,?,'teacher')",
[name,email,hash],
(err,result)=>{

if(err) return res.status(500).json(err);

const userId = result.insertId;

db.query(
"INSERT INTO teachers(user_id,specialization) VALUES(?,?)",
[userId,specialization],
(err2)=>{

if(err2) return res.status(500).json(err2);

res.json({message:"Teacher created"});

});

});

};

exports.getTeachers = (req,res)=>{

db.query(
`SELECT teachers.id, users.name, teachers.specialization
 FROM teachers
 JOIN users ON teachers.user_id = users.id`,
(err,result)=>{
if(err) return res.status(500).json(err);
res.json(result);
}
);

};

exports.assignTeacher = (req,res)=>{

const {teacher_id,subject_id,class_id} = req.body;

db.query(
"INSERT INTO teacher_assignments(teacher_id,subject_id,class_id) VALUES(?,?,?)",
[teacher_id,subject_id,class_id],
(err)=>{
if(err) return res.status(500).json(err);
res.json({message:"Teacher assigned"});
}
);

};

exports.getAssignedTeachers = (req,res)=>{

const {class_id,subject_id} = req.params;

db.query(
`SELECT teachers.id,
        users.name,
        teachers.specialization
 FROM teacher_assignments
 JOIN teachers ON teacher_assignments.teacher_id = teachers.id
 JOIN users ON teachers.user_id = users.id
 WHERE teacher_assignments.class_id = ?
 AND teacher_assignments.subject_id = ?`,
[class_id,subject_id],
(err,result)=>{
if(err) return res.status(500).json(err);
res.json(result);
}
);

};


/* ---------- STUDENT MANAGEMENT ---------- */
/* ---------- STUDENT MANAGEMENT ---------- */

exports.addStudent = async (req,res)=>{

const {name,email,password,class_id,roll_number} = req.body;

const hash = await bcrypt.hash(password,10);

db.query(
"INSERT INTO users(name,email,password,role) VALUES(?,?,?,'student')",
[name,email,hash],
(err,result)=>{

if(err) return res.status(500).json(err);

const userId = result.insertId;

db.query(
"INSERT INTO students(user_id,class_id,roll_number) VALUES(?,?,?)",
[userId,class_id,roll_number],
(err2)=>{

if(err2) return res.status(500).json(err2);

res.json({message:"Student created"});

});

});

};



/* ---------- GET ALL STUDENTS ---------- */

exports.getStudents = (req,res)=>{

db.query(
`SELECT students.id,
        students.roll_number,
        students.class_id,
        users.name,
        users.email,
        classes.class_name
 FROM students
 JOIN users ON students.user_id = users.id
 JOIN classes ON students.class_id = classes.id`,
(err,result)=>{

if(err) return res.status(500).json(err);

res.json(result);

});

};



/* ---------- GET STUDENTS BY CLASS ---------- */

exports.getStudentsByClass = (req,res)=>{

const {class_id} = req.params;

db.query(
`SELECT students.id,
        students.roll_number,
        users.name
 FROM students
 JOIN users ON students.user_id = users.id
 WHERE students.class_id = ?`,
[class_id],
(err,result)=>{

if(err) return res.status(500).json(err);

res.json(result);

});

};



/* ---------- UPDATE STUDENT ---------- */

exports.updateStudent = (req,res)=>{

const {id,name,email,class_id,roll_number} = req.body;

db.query(
"SELECT user_id FROM students WHERE id=?",
[id],
(err,result)=>{

if(err) return res.status(500).json(err);

const userId = result[0].user_id;

db.query(
"UPDATE users SET name=?, email=? WHERE id=?",
[name,email,userId],
(err2)=>{

if(err2) return res.status(500).json(err2);

db.query(
"UPDATE students SET class_id=?, roll_number=? WHERE id=?",
[class_id,roll_number,id],
(err3)=>{

if(err3) return res.status(500).json(err3);

res.json({message:"Student updated"});

});

});

});

};



/* ---------- DELETE STUDENT ---------- */

exports.deleteStudent = (req,res)=>{

const {id} = req.params;

db.query(
"SELECT user_id FROM students WHERE id=?",
[id],
(err,result)=>{

if(err) return res.status(500).json(err);

const userId = result[0].user_id;

db.query(
"DELETE FROM students WHERE id=?",
[id],
(err2)=>{

if(err2) return res.status(500).json(err2);

db.query(
"DELETE FROM users WHERE id=?",
[userId],
(err3)=>{

if(err3) return res.status(500).json(err3);

res.json({message:"Student deleted"});

});

});

});

};


/* ---------- RESULT MANAGEMENT ---------- */

exports.getResultReleaseList = (req,res)=>{

db.query(
`SELECT e.id,
        e.title,
        e.exam_date,
        e.total_marks,
        c.class_name,
        s.subject_name,
        u.name AS teacher_name,
        COALESCE(a.assigned_count, 0) AS assigned_count,
        COALESCE(r.submitted_count, 0) AS submitted_count,
        COALESCE(r.released_count, 0) AS released_count
 FROM exams e
 JOIN classes c ON c.id = e.class_id
 JOIN subjects s ON s.id = e.subject_id
 LEFT JOIN teachers t ON t.id = e.teacher_id
 LEFT JOIN users u ON u.id = t.user_id
 LEFT JOIN (
   SELECT exam_id, COUNT(*) AS assigned_count
   FROM exam_assignments
   GROUP BY exam_id
 ) a ON a.exam_id = e.id
 LEFT JOIN (
   SELECT exam_id,
          COUNT(*) AS submitted_count,
          SUM(CASE WHEN released = TRUE THEN 1 ELSE 0 END) AS released_count
   FROM results
   GROUP BY exam_id
 ) r ON r.exam_id = e.id
 ORDER BY e.exam_date DESC, e.id DESC`,
(err,result)=>{
if(err) return res.status(500).json(err);
res.json(result);
}
);

};

exports.releaseResult = (req,res)=>{

const {exam_id} = req.body;

db.query(
"UPDATE results SET released=TRUE WHERE exam_id=?",
[exam_id],
(err,result)=>{
if(err) return res.status(500).json(err);
if(!result.affectedRows){
return res.status(404).json({message:"No submitted results found for this exam"});
}
res.json({message:"Results released"});
}
);

};
