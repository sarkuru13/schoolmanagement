/**
 * Parse uploaded JSON into normalized question rows with validation flags for preview.
 * Accepts either `[ {...}, ... ]` or `{ "questions": [ ... ] }`.
 */
export function parseExamQuestionsJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: "Invalid JSON. Check commas and quotes." };
  }

  let rows;
  if (Array.isArray(parsed)) rows = parsed;
  else if (parsed && Array.isArray(parsed.questions)) rows = parsed.questions;
  else return { error: 'Use an array of questions or { "questions": [ ... ] }.' };

  const preview = rows.map((raw, index) => {
    const row = raw || {};
    const question_text = (row.question_text ?? row.text ?? "").toString().trim();
    const option_a = (row.option_a ?? row.a ?? "").toString().trim();
    const option_b = (row.option_b ?? row.b ?? "").toString().trim();
    const option_c = (row.option_c ?? row.c ?? "").toString().trim();
    const option_d = (row.option_d ?? row.d ?? "").toString().trim();
    const coRaw = (row.correct_option ?? row.correct ?? "").toString().trim().toUpperCase();
    const marks = Number(row.marks);

    const base = {
      index,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option: coRaw,
      marks,
    };

    const missing =
      !question_text ||
      !option_a ||
      !option_b ||
      !option_c ||
      !option_d ||
      !["A", "B", "C", "D"].includes(coRaw);
    const badMarks = !Number.isFinite(marks) || marks < 1;

    if (missing) {
      return {
        ...base,
        valid: false,
        reason: "Each question needs question_text, option_a–d, and correct_option (A–D).",
      };
    }
    if (badMarks) {
      return { ...base, valid: false, reason: "marks must be a number ≥ 1." };
    }

    return {
      ...base,
      valid: true,
      reason: null,
      payload: {
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option: coRaw,
        marks,
      },
    };
  });

  const validPayloads = preview.filter((p) => p.valid).map((p) => p.payload);
  return { preview, validPayloads, total: rows.length };
}

export const SAMPLE_QUESTIONS_JSON = `{
  "questions": [
    {
      "question_text": "What is 2 + 2?",
      "option_a": "3",
      "option_b": "4",
      "option_c": "5",
      "option_d": "6",
      "correct_option": "B",
      "marks": 1
    }
  ]
}
`;
