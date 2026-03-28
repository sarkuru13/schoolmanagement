const db = require("../config/db");

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

let ensured = false;

async function ensureExamWorkflowSchema() {
  if (ensured) return;

  await runQuery(`
    CREATE TABLE IF NOT EXISTS reexam_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      exam_id INT NOT NULL,
      student_id INT NOT NULL,
      teacher_id INT NOT NULL,
      approved_by_admin_id INT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      reason TEXT NULL,
      admin_note TEXT NULL,
      requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP NULL DEFAULT NULL,
      INDEX idx_reexam_exam_student (exam_id, student_id),
      INDEX idx_reexam_status (status)
    )
  `);

  try {
    await runQuery("ALTER TABLE subjects ADD COLUMN syllabus_link TEXT NULL");
  } catch (error) {
    if (error.code !== "ER_DUP_FIELDNAME") {
      throw error;
    }
  }

  ensured = true;
}

module.exports = {
  ensureExamWorkflowSchema,
  runQuery,
};
