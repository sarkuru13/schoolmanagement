const db = require("../config/db");
const { calculateResult } = require("../utils/resultCalculator");

exports.getExams = (req, res) => {
  const user_id = req.user.id;

  db.query(
    `SELECT e.*, c.class_name, sub.subject_name
     FROM exams e
     JOIN classes c ON c.id = e.class_id
     JOIN subjects sub ON sub.id = e.subject_id
     JOIN exam_assignments ea ON ea.exam_id = e.id
     JOIN students s ON s.user_id = ?
     WHERE ea.class_id = s.class_id OR ea.student_id = s.id`,
    [user_id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      const seen = new Set();
      const unique = (rows || []).filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
      res.json(unique);
    }
  );
};

exports.getExamAttempt = (req, res) => {
  const user_id = req.user.id;
  const exam_id = req.params.examId;

  db.query("SELECT id FROM students WHERE user_id = ?", [user_id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a student" });
    const student_id = rows[0].id;

    db.query(
      `SELECT e.*, c.class_name, sub.subject_name
       FROM exams e
       JOIN classes c ON c.id = e.class_id
       JOIN subjects sub ON sub.id = e.subject_id
       JOIN exam_assignments ea ON ea.exam_id = e.id
       WHERE e.id = ?
         AND (ea.class_id = (SELECT class_id FROM students WHERE id = ?) OR ea.student_id = ?)`,
      [exam_id, student_id, student_id],
      (err2, examRows) => {
        if (err2) return res.status(500).json(err2);
        if (!examRows.length) return res.status(403).json({ message: "Exam not assigned to you" });

        db.query(
          "SELECT id FROM results WHERE exam_id = ? AND student_id = ?",
          [exam_id, student_id],
          (errR, existing) => {
            if (errR) return res.status(500).json(errR);
            if (existing.length) {
              return res.status(400).json({ message: "You have already submitted this exam" });
            }

            db.query(
              `SELECT id, question_text, option_a, option_b, option_c, option_d, marks
               FROM questions WHERE exam_id = ? ORDER BY id`,
              [exam_id],
              (err3, questions) => {
                if (err3) return res.status(500).json(err3);
                res.json({ exam: examRows[0], questions });
              }
            );
          }
        );
      }
    );
  });
};

exports.submitExam = (req, res) => {
  const { exam_id, answers } = req.body;
  const user_id = req.user.id;

  db.query("SELECT id FROM students WHERE user_id = ?", [user_id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.status(403).json({ message: "Not a student" });
    const student_id = rows[0].id;

    db.query(
      "SELECT id FROM results WHERE exam_id = ? AND student_id = ?",
      [exam_id, student_id],
      (errDup, dup) => {
        if (errDup) return res.status(500).json(errDup);
        if (dup.length) return res.status(400).json({ message: "Already submitted" });

        const insertAnswer = (a) =>
          new Promise((resolve, reject) => {
            db.query(
              "INSERT INTO student_answers(exam_id,student_id,question_id,selected_option) VALUES(?,?,?,?)",
              [exam_id, student_id, a.question_id, a.answer],
              (e) => (e ? reject(e) : resolve())
            );
          });

        (async () => {
          try {
            for (const a of answers || []) {
              await insertAnswer(a);
            }
            const score = await calculateResult(exam_id, student_id);
            await new Promise((resolve, reject) => {
              db.query(
                "INSERT INTO results(exam_id,student_id,score) VALUES(?,?,?)",
                [exam_id, student_id, score],
                (e) => (e ? reject(e) : resolve())
              );
            });
            res.json({ message: "Exam submitted", score });
          } catch (e) {
            res.status(500).json({ message: e.message || "Submit failed" });
          }
        })();
      }
    );
  });
};

exports.getResults = (req, res) => {
  const user_id = req.user.id;

  db.query("SELECT id FROM students WHERE user_id = ?", [user_id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows.length) return res.json([]);
    const student_id = rows[0].id;

    db.query(
      `SELECT r.*, e.title, e.total_marks, c.class_name
       FROM results r
       JOIN exams e ON e.id = r.exam_id
       JOIN classes c ON c.id = e.class_id
       WHERE r.student_id = ? AND r.released = TRUE
       ORDER BY r.id DESC`,
      [student_id],
      (err2, result) => {
        if (err2) return res.status(500).json(err2);
        res.json(result);
      }
    );
  });
};
