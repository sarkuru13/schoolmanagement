const db = require("../config/db");
const { ensureExamWorkflowSchema, runQuery } = require("../utils/examWorkflowSchema");

function getTeacherId(userId, cb) {
  db.query("SELECT id FROM teachers WHERE user_id = ?", [userId], cb);
}

exports.getAssignments = (req, res) => {
  const userId = req.user.id;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.json([]);
    const tid = rows[0].id;
    db.query(
      `SELECT ta.id, ta.class_id, ta.subject_id, c.class_name, s.subject_name, s.syllabus_link
       FROM teacher_assignments ta
       JOIN classes c ON c.id = ta.class_id
       JOIN subjects s ON s.id = ta.subject_id
       WHERE ta.teacher_id = ?
       ORDER BY c.class_name, s.subject_name`,
      [tid],
      (err2, result) => {
        if (err2) return res.status(500).json(err2);
        res.json(result);
      }
    );
  });
};

exports.getTeacherStats = (req, res) => {
  const userId = req.user.id;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) {
      return res.json({
        assignments: 0,
        exams: 0,
        classes: 0,
        subjects: 0,
        students: 0,
      });
    }
    const tid = rows[0].id;
    db.query(
      `SELECT 
        (SELECT COUNT(*) FROM teacher_assignments WHERE teacher_id = ?) AS assignments,
        (SELECT COUNT(*) FROM exams WHERE teacher_id = ?) AS exams,
        (SELECT COUNT(DISTINCT class_id) FROM teacher_assignments WHERE teacher_id = ?) AS classes,
        (SELECT COUNT(DISTINCT subject_id) FROM teacher_assignments WHERE teacher_id = ?) AS subjects`,
      [tid, tid, tid, tid],
      (err2, statsRows) => {
        if (err2) return res.status(500).json(err2);
        db.query(
          `SELECT COUNT(DISTINCT st.id) AS students
           FROM students st
           JOIN teacher_assignments ta ON ta.class_id = st.class_id AND ta.teacher_id = ?`,
          [tid],
          (err3, studentRows) => {
            if (err3) return res.status(500).json(err3);
            const s = statsRows[0];
            res.json({
              assignments: s.assignments,
              exams: s.exams,
              classes: s.classes,
              subjects: s.subjects,
              students: studentRows[0]?.students || 0,
            });
          }
        );
      }
    );
  });
};

exports.getMyExams = (req, res) => {
  const userId = req.user.id;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.json([]);
    const tid = rows[0].id;
    db.query(
      `SELECT e.*, c.class_name, sub.subject_name
       FROM exams e
       JOIN classes c ON c.id = e.class_id
       JOIN subjects sub ON sub.id = e.subject_id
       WHERE e.teacher_id = ?
       ORDER BY e.exam_date DESC, e.id DESC`,
      [tid],
      (err2, result) => {
        if (err2) return res.status(500).json(err2);
        res.json(result);
      }
    );
  });
};

exports.getExamDetail = (req, res) => {
  const userId = req.user.id;
  const examId = req.params.id;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });
    const tid = rows[0].id;
    db.query(
      `SELECT e.*, c.class_name, sub.subject_name
       FROM exams e
       JOIN classes c ON c.id = e.class_id
       JOIN subjects sub ON sub.id = e.subject_id
       WHERE e.id = ? AND e.teacher_id = ?`,
      [examId, tid],
      (err2, examRows) => {
        if (err2) return res.status(500).json(err2);
        if (!examRows.length) return res.status(404).json({ message: "Exam not found" });
        db.query(
          "SELECT * FROM questions WHERE exam_id = ? ORDER BY id",
          [examId],
          (err3, questions) => {
            if (err3) return res.status(500).json(err3);
            res.json({ exam: examRows[0], questions });
          }
        );
      }
    );
  });
};

exports.getStudentsInClass = (req, res) => {
  const userId = req.user.id;
  const classId = req.params.classId;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });
    const tid = rows[0].id;
    db.query(
      "SELECT 1 FROM teacher_assignments WHERE teacher_id = ? AND class_id = ?",
      [tid, classId],
      (err2, ok) => {
        if (err2) return res.status(500).json(err2);
        if (!ok.length) return res.status(403).json({ message: "Not assigned to this class" });
        db.query(
          `SELECT students.id, students.roll_number, users.name
           FROM students
           JOIN users ON users.id = students.user_id
           WHERE students.class_id = ?
           ORDER BY students.roll_number`,
          [classId],
          (err3, students) => {
            if (err3) return res.status(500).json(err3);
            res.json(students);
          }
        );
      }
    );
  });
};

exports.createExam = (req, res) => {
  const userId = req.user.id;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Teacher profile not found" });
    const teacher_id = rows[0].id;
    const { title, subject_id, class_id, exam_date, start_time, duration, total_marks } = req.body;
    db.query(
      `INSERT INTO exams(title,teacher_id,subject_id,class_id,exam_date,start_time,duration,total_marks)
       VALUES(?,?,?,?,?,?,?,?)`,
      [title, teacher_id, subject_id, class_id, exam_date, start_time, duration, total_marks],
      (err2, result) => {
        if (err2) return res.status(500).json(err2);
        res.json({ message: "Exam created", exam_id: result.insertId });
      }
    );
  });
};

exports.addQuestion = (req, res) => {
  const userId = req.user.id;
  const {
    exam_id,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
    marks,
  } = req.body;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });
    const tid = rows[0].id;
    db.query("SELECT id FROM exams WHERE id = ? AND teacher_id = ?", [exam_id, tid], (err2, erows) => {
      if (err2) return res.status(500).json(err2);
      if (!erows.length) return res.status(403).json({ message: "Exam not found" });
      db.query(
        `INSERT INTO questions(exam_id,question_text,option_a,option_b,option_c,option_d,correct_option,marks)
         VALUES(?,?,?,?,?,?,?,?)`,
        [exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks],
        (err3, result) => {
          if (err3) return res.status(500).json(err3);
          res.json({ message: "Question added", question_id: result.insertId });
        }
      );
    });
  });
};

exports.assignExam = (req, res) => {
  const userId = req.user.id;
  const { exam_id, class_id, student_id } = req.body;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });
    const tid = rows[0].id;
    db.query("SELECT id FROM exams WHERE id = ? AND teacher_id = ?", [exam_id, tid], (err2, erows) => {
      if (err2) return res.status(500).json(err2);
      if (!erows.length) return res.status(403).json({ message: "Exam not found" });
      db.query(
        "INSERT INTO exam_assignments(exam_id,class_id,student_id) VALUES(?,?,?)",
        [exam_id, class_id, student_id || null],
        (err3) => {
          if (err3) return res.status(500).json(err3);
          res.json({ message: "Exam assigned" });
        }
      );
    });
  });
};

function assertTeacherOwnsAssignment(tid, class_id, subject_id, cb) {
  db.query(
    "SELECT 1 FROM teacher_assignments WHERE teacher_id = ? AND class_id = ? AND subject_id = ?",
    [tid, class_id, subject_id],
    cb
  );
}

function assertTeacherOwnsExam(tid, examId, cb) {
  db.query("SELECT * FROM exams WHERE id = ? AND teacher_id = ?", [examId, tid], cb);
}

exports.updateExam = (req, res) => {
  const examId = req.params.id;
  const userId = req.user.id;
  const { title, subject_id, class_id, exam_date, start_time, duration, total_marks } = req.body;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });
    const tid = rows[0].id;
    db.query("SELECT id FROM exams WHERE id = ? AND teacher_id = ?", [examId, tid], (err2, erows) => {
      if (err2) return res.status(500).json(err2);
      if (!erows.length) return res.status(404).json({ message: "Exam not found" });
      assertTeacherOwnsAssignment(tid, class_id, subject_id, (err3, ok) => {
        if (err3) return res.status(500).json(err3);
        if (!ok.length) return res.status(403).json({ message: "You are not assigned to this class and subject" });
        db.query(
          `UPDATE exams SET title=?, subject_id=?, class_id=?, exam_date=?, start_time=?, duration=?, total_marks=?
           WHERE id=? AND teacher_id=?`,
          [title, subject_id, class_id, exam_date, start_time, duration, total_marks, examId, tid],
          (err4) => {
            if (err4) return res.status(500).json(err4);
            res.json({ message: "Exam updated" });
          }
        );
      });
    });
  });
};

exports.deleteExam = (req, res) => {
  const examId = req.params.id;
  const userId = req.user.id;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });
    const tid = rows[0].id;
    db.query("SELECT id FROM exams WHERE id = ? AND teacher_id = ?", [examId, tid], (err2, erows) => {
      if (err2) return res.status(500).json(err2);
      if (!erows.length) return res.status(404).json({ message: "Exam not found" });
      db.query(
        "DELETE sa FROM student_answers sa INNER JOIN questions q ON q.id = sa.question_id WHERE q.exam_id = ?",
        [examId],
        (err3) => {
          if (err3) return res.status(500).json(err3);
          db.query("DELETE FROM results WHERE exam_id = ?", [examId], (err4) => {
            if (err4) return res.status(500).json(err4);
            db.query("DELETE FROM exam_assignments WHERE exam_id = ?", [examId], (err5) => {
              if (err5) return res.status(500).json(err5);
              db.query("DELETE FROM questions WHERE exam_id = ?", [examId], (err6) => {
                if (err6) return res.status(500).json(err6);
                db.query("DELETE FROM exams WHERE id = ?", [examId], (err7) => {
                  if (err7) return res.status(500).json(err7);
                  res.json({ message: "Exam deleted" });
                });
              });
            });
          });
        }
      );
    });
  });
};

exports.updateQuestion = (req, res) => {
  const questionId = req.params.id;
  const userId = req.user.id;
  const { question_text, option_a, option_b, option_c, option_d, correct_option, marks } = req.body;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });
    const tid = rows[0].id;
    db.query(
      `SELECT q.id FROM questions q
       INNER JOIN exams e ON e.id = q.exam_id
       WHERE q.id = ? AND e.teacher_id = ?`,
      [questionId, tid],
      (err2, qrows) => {
        if (err2) return res.status(500).json(err2);
        if (!qrows.length) return res.status(404).json({ message: "Question not found" });
        db.query(
          `UPDATE questions SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=?, marks=?
           WHERE id=?`,
          [question_text, option_a, option_b, option_c, option_d, correct_option, marks, questionId],
          (err3) => {
            if (err3) return res.status(500).json(err3);
            res.json({ message: "Question updated" });
          }
        );
      }
    );
  });
};

exports.deleteQuestion = (req, res) => {
  const questionId = req.params.id;
  const userId = req.user.id;
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });
    const tid = rows[0].id;
    db.query(
      `SELECT q.id FROM questions q
       INNER JOIN exams e ON e.id = q.exam_id
       WHERE q.id = ? AND e.teacher_id = ?`,
      [questionId, tid],
      (err2, qrows) => {
        if (err2) return res.status(500).json(err2);
        if (!qrows.length) return res.status(404).json({ message: "Question not found" });
        db.query("DELETE FROM student_answers WHERE question_id = ?", [questionId], (err3) => {
          if (err3) return res.status(500).json(err3);
          db.query("DELETE FROM questions WHERE id = ?", [questionId], (err4) => {
            if (err4) return res.status(500).json(err4);
            res.json({ message: "Question deleted" });
          });
        });
      }
    );
  });
};

function normalizeCorrectOption(c) {
  if (c == null || c === "") return null;
  const u = String(c).trim().toUpperCase();
  if (["A", "B", "C", "D"].includes(u)) return u;
  return null;
}

exports.importQuestions = (req, res) => {
  const examId = req.params.id;
  const userId = req.user.id;
  let list = req.body.questions;
  if (!Array.isArray(list) && Array.isArray(req.body)) list = req.body;
  if (!Array.isArray(list)) {
    return res.status(400).json({ message: "Expected body.questions to be an array" });
  }
  getTeacherId(userId, (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });
    const tid = rows[0].id;
    db.query("SELECT id FROM exams WHERE id = ? AND teacher_id = ?", [examId, tid], (err2, erows) => {
      if (err2) return res.status(500).json(err2);
      if (!erows.length) return res.status(404).json({ message: "Exam not found" });

      const errors = [];
      const valid = [];
      list.forEach((raw, idx) => {
        const row = raw || {};
        const co = normalizeCorrectOption(row.correct_option ?? row.correct);
        const marks = Number(row.marks);
        const text = row.question_text ?? row.text ?? "";
        const oa = row.option_a ?? row.a ?? "";
        const ob = row.option_b ?? row.b ?? "";
        const oc = row.option_c ?? row.c ?? "";
        const od = row.option_d ?? row.d ?? "";
        if (!text || !oa || !ob || !oc || !od || !co) {
          errors.push({ index: idx, reason: "Missing fields or invalid correct_option (use A–D)" });
          return;
        }
        if (!Number.isFinite(marks) || marks < 1) {
          errors.push({ index: idx, reason: "marks must be a number ≥ 1" });
          return;
        }
        valid.push({ question_text: text, option_a: oa, option_b: ob, option_c: oc, option_d: od, correct_option: co, marks });
      });

      if (!valid.length) {
        return res.status(400).json({ message: "No valid questions to import", errors });
      }

      const insertNext = (i) => {
        if (i >= valid.length) {
          return res.json({
            message: "Import complete",
            imported: valid.length,
            skippedErrors: errors,
          });
        }
        const q = valid[i];
        db.query(
          `INSERT INTO questions(exam_id,question_text,option_a,option_b,option_c,option_d,correct_option,marks)
           VALUES(?,?,?,?,?,?,?,?)`,
          [examId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.marks],
          (e) => {
            if (e) return res.status(500).json(e);
            insertNext(i + 1);
          }
        );
      };
      insertNext(0);
    });
  });
};

exports.getExamSubmissions = (req, res) => {
  const userId = req.user.id;
  const examId = req.params.id;

  getTeacherId(userId, async (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });

    const tid = rows[0].id;
    assertTeacherOwnsExam(tid, examId, async (err2, erows) => {
      if (err2) return res.status(500).json(err2);
      if (!erows.length) return res.status(404).json({ message: "Exam not found" });

      try {
        await ensureExamWorkflowSchema();

        const students = await runQuery(
          `SELECT st.id,
                  st.roll_number,
                  u.name,
                  u.email,
                  r.id AS result_id,
                  r.score,
                  r.released,
                  latest_request.id AS reexam_request_id,
                  latest_request.status AS reexam_status,
                  latest_request.reason AS reexam_reason,
                  latest_request.admin_note AS reexam_admin_note,
                  latest_request.requested_at AS reexam_requested_at,
                  latest_request.reviewed_at AS reexam_reviewed_at
           FROM (
             SELECT DISTINCT st.id, st.roll_number, st.user_id
             FROM students st
             WHERE st.class_id = ?
               AND EXISTS (
                 SELECT 1
                 FROM exam_assignments ea
                 WHERE ea.exam_id = ?
                   AND ea.class_id = ?
               )
             UNION
             SELECT DISTINCT st.id, st.roll_number, st.user_id
             FROM students st
             JOIN exam_assignments ea ON ea.student_id = st.id
             WHERE ea.exam_id = ?
           ) st
           JOIN users u ON u.id = st.user_id
           LEFT JOIN results r ON r.exam_id = ? AND r.student_id = st.id
           LEFT JOIN (
             SELECT rr1.*
             FROM reexam_requests rr1
             INNER JOIN (
               SELECT exam_id, student_id, MAX(id) AS latest_id
               FROM reexam_requests
               GROUP BY exam_id, student_id
             ) rr2 ON rr2.latest_id = rr1.id
           ) latest_request ON latest_request.exam_id = ? AND latest_request.student_id = st.id
           ORDER BY u.name ASC`,
          [
            erows[0].class_id,
            examId,
            erows[0].class_id,
            examId,
            examId,
            examId,
          ]
        );

        res.json(students);
      } catch (error) {
        res.status(500).json({ message: error.message || "Could not load exam submissions" });
      }
    });
  });
};

exports.createReexamRequest = (req, res) => {
  const userId = req.user.id;
  const { exam_id, student_id, reason } = req.body;

  getTeacherId(userId, async (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a teacher" });

    const tid = rows[0].id;
    assertTeacherOwnsExam(tid, exam_id, async (err2, erows) => {
      if (err2) return res.status(500).json(err2);
      if (!erows.length) return res.status(404).json({ message: "Exam not found" });

      try {
        await ensureExamWorkflowSchema();

        const resultRows = await runQuery(
          "SELECT id FROM results WHERE exam_id = ? AND student_id = ?",
          [exam_id, student_id]
        );
        if (!resultRows.length) {
          return res.status(400).json({ message: "This student has not submitted the exam yet." });
        }

        const studentRows = await runQuery(
          `SELECT st.id
           FROM students st
           WHERE st.id = ?
             AND (
               st.class_id = ?
               OR EXISTS (
                 SELECT 1
                 FROM exam_assignments ea
                 WHERE ea.exam_id = ? AND ea.student_id = st.id
               )
             )`,
          [student_id, erows[0].class_id, exam_id]
        );
        if (!studentRows.length) {
          return res.status(400).json({ message: "Student is not assigned to this exam." });
        }

        const pendingRows = await runQuery(
          "SELECT id FROM reexam_requests WHERE exam_id = ? AND student_id = ? AND status = 'pending'",
          [exam_id, student_id]
        );
        if (pendingRows.length) {
          return res.status(400).json({ message: "A re-exam request is already pending for this student." });
        }

        await runQuery(
          `INSERT INTO reexam_requests(exam_id, student_id, teacher_id, status, reason)
           VALUES(?, ?, ?, 'pending', ?)`,
          [exam_id, student_id, tid, (reason || "").trim() || null]
        );

        res.json({ message: "Re-exam request sent to admin for approval." });
      } catch (error) {
        res.status(500).json({ message: error.message || "Could not create re-exam request" });
      }
    });
  });
};
