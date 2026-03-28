import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import { parseExamQuestionsJson, SAMPLE_QUESTIONS_JSON } from "../../utils/parseExamQuestionsJson";

const OPT = ["A", "B", "C", "D"];

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [data, setData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [reexamActionStudentId, setReexamActionStudentId] = useState(null);

  const [showExamEdit, setShowExamEdit] = useState(false);
  const [examSaving, setExamSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAssignmentKey, setEditAssignmentKey] = useState("");
  const [editExamDate, setEditExamDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("09:00");
  const [editDuration, setEditDuration] = useState(60);
  const [editTotalMarks, setEditTotalMarks] = useState(100);

  const [qText, setQText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correct, setCorrect] = useState("A");
  const [marks, setMarks] = useState(1);
  const [adding, setAdding] = useState(false);

  const [editingQ, setEditingQ] = useState(null);
  const [editQText, setEditQText] = useState("");
  const [editOptA, setEditOptA] = useState("");
  const [editOptB, setEditOptB] = useState("");
  const [editOptC, setEditOptC] = useState("");
  const [editOptD, setEditOptD] = useState("");
  const [editCorrect, setEditCorrect] = useState("A");
  const [editMarks, setEditMarks] = useState(1);
  const [savingQ, setSavingQ] = useState(false);

  const [assignMode, setAssignMode] = useState("class");
  const [studentId, setStudentId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState("");

  const [importPreview, setImportPreview] = useState(null);
  const [importParseError, setImportParseError] = useState("");
  const [importing, setImporting] = useState(false);

  const load = async () => {
    const [examRes, submissionsRes] = await Promise.all([
      API.get(`/teacher/exams/${id}`),
      API.get(`/teacher/exams/${id}/submissions`),
    ]);
    setData(examRes.data);
    setSubmissions(submissionsRes.data || []);
  };

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const [examRes, assignRes, submissionsRes] = await Promise.all([
          API.get(`/teacher/exams/${id}`),
          API.get("/teacher/assignments"),
          API.get(`/teacher/exams/${id}/submissions`),
        ]);
        setData(examRes.data);
        setAssignments(assignRes.data || []);
        setSubmissions(submissionsRes.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load exam.");
      } finally {
        setLoading(false);
        setSubmissionsLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!data?.exam) return;
    const ex = data.exam;
    setEditTitle(ex.title || "");
    setEditAssignmentKey(`${ex.class_id}-${ex.subject_id}`);
    setEditExamDate(ex.exam_date ? String(ex.exam_date).slice(0, 10) : "");
    setEditStartTime(formatTimeForInput(ex.start_time));
    setEditDuration(ex.duration ?? 60);
    setEditTotalMarks(ex.total_marks ?? 100);
  }, [data?.exam]);

  useEffect(() => {
    if (!data?.exam?.class_id) return;
    (async () => {
      try {
        const res = await API.get(`/teacher/class/${data.exam.class_id}/students`);
        setStudents(res.data || []);
      } catch {
        setStudents([]);
      }
    })();
  }, [data?.exam?.class_id]);

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    const selected = assignments.find((a) => `${a.class_id}-${a.subject_id}` === editAssignmentKey);
    if (!selected) {
      setError("Choose a valid class and subject.");
      return;
    }
    setError("");
    setExamSaving(true);
    try {
      await API.put(`/teacher/exams/${id}`, {
        title: editTitle,
        class_id: selected.class_id,
        subject_id: selected.subject_id,
        exam_date: editExamDate || null,
        start_time: editStartTime,
        duration: Number(editDuration),
        total_marks: Number(editTotalMarks),
      });
      setShowExamEdit(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update exam.");
    } finally {
      setExamSaving(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!window.confirm("Delete this exam and all its questions and assignments? This cannot be undone.")) return;
    try {
      await API.delete(`/teacher/exams/${id}`);
      navigate("/teacher/exams");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete exam.");
    }
  };

  const startEditQuestion = (q) => {
    setEditingQ(q.id);
    setEditQText(q.question_text);
    setEditOptA(q.option_a);
    setEditOptB(q.option_b);
    setEditOptC(q.option_c);
    setEditOptD(q.option_d);
    setEditCorrect(String(q.correct_option).toUpperCase().slice(0, 1));
    setEditMarks(q.marks);
  };

  const cancelEditQuestion = () => {
    setEditingQ(null);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!editingQ) return;
    setSavingQ(true);
    setError("");
    try {
      await API.put(`/teacher/questions/${editingQ}`, {
        question_text: editQText,
        option_a: editOptA,
        option_b: editOptB,
        option_c: editOptC,
        option_d: editOptD,
        correct_option: editCorrect,
        marks: Number(editMarks),
      });
      setEditingQ(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update question.");
    } finally {
      setSavingQ(false);
    }
  };

  const handleDeleteQuestion = async (qid) => {
    if (!window.confirm("Delete this question? Student answers for it will be removed.")) return;
    setError("");
    try {
      await API.delete(`/teacher/questions/${qid}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete question.");
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      await API.post("/teacher/question", {
        exam_id: Number(id),
        question_text: qText,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_option: correct,
        marks: Number(marks),
      });
      setQText("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setMarks(1);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add question.");
    } finally {
      setAdding(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssigning(true);
    setAssignMsg("");
    try {
      await API.post("/teacher/assign", {
        exam_id: Number(id),
        class_id: data.exam.class_id,
        student_id: assignMode === "student" && studentId ? Number(studentId) : null,
      });
      setAssignMsg("Exam assigned successfully.");
    } catch (err) {
      setAssignMsg(err.response?.data?.message || "Assignment failed.");
    } finally {
      setAssigning(false);
    }
  };

  const onPickJsonFile = (e) => {
    const file = e.target.files?.[0];
    setImportParseError("");
    setImportPreview(null);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = parseExamQuestionsJson(String(reader.result || ""));
      if (result.error) {
        setImportParseError(result.error);
        return;
      }
      setImportPreview(result);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportConfirmed = async () => {
    if (!importPreview?.validPayloads?.length) return;
    setImporting(true);
    setError("");
    try {
      await API.post(`/teacher/exams/${id}/import-questions`, {
        questions: importPreview.validPayloads,
      });
      setImportPreview(null);
      setImportParseError("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  const handleRequestReexam = async (student) => {
    const reason = window.prompt(
      `Why should ${student.name} be allowed to retake this exam?`,
      student.reexam_reason || ""
    );

    if (reason === null) return;

    setReexamActionStudentId(student.id);
    setError("");
    try {
      const response = await API.post("/teacher/reexam-request", {
        exam_id: Number(id),
        student_id: student.id,
        reason,
      });
      setAssignMsg(response.data?.message || "Re-exam request sent.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send re-exam request.");
    } finally {
      setReexamActionStudentId(null);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_QUESTIONS_JSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam-questions-sample.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading exam…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-red-600">{error}</p>
        <Link to="/teacher/exams" className="text-purple-600 mt-4 inline-block">
          ← Back to exams
        </Link>
      </div>
    );
  }

  const exam = data.exam;
  const questions = data.questions || [];

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/teacher/exams" className="text-sm text-purple-600 hover:underline">
            ← All exams
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{exam.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {exam.class_name} · {exam.subject_name} · {exam.exam_date ? String(exam.exam_date).slice(0, 10) : "No date"} ·{" "}
            {exam.total_marks} marks
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowExamEdit((v) => !v)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            {showExamEdit ? "Close editor" : "Edit exam"}
          </button>
          <button
            type="button"
            onClick={handleDeleteExam}
            className="px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Delete exam
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {showExamEdit && (
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Edit exam details</h2>
          <form onSubmit={handleUpdateExam} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class &amp; subject</label>
              <select
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                value={editAssignmentKey}
                onChange={(e) => setEditAssignmentKey(e.target.value)}
              >
                {assignments.map((a) => (
                  <option key={a.id} value={`${a.class_id}-${a.subject_id}`}>
                    {a.class_name} — {a.subject_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={editExamDate}
                onChange={(e) => setEditExamDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total marks</label>
              <input
                type="number"
                min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={editTotalMarks}
                onChange={(e) => setEditTotalMarks(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={examSaving}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-60"
            >
              {examSaving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </section>
      )}

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Assign to students</h2>
        <p className="text-sm text-gray-500 mb-4">
          Assign the whole class, or one student. Students only see exams assigned to their class or to them directly.
        </p>
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                checked={assignMode === "class"}
                onChange={() => setAssignMode("class")}
              />
              Entire class ({exam.class_name})
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                checked={assignMode === "student"}
                onChange={() => setAssignMode("student")}
              />
              Single student
            </label>
          </div>
          {assignMode === "student" && (
            <select
              className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Select student…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (roll {s.roll_number})
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            disabled={assigning || (assignMode === "student" && !studentId)}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {assigning ? "Saving…" : "Assign exam"}
          </button>
          {assignMsg && <p className="text-sm text-gray-600">{assignMsg}</p>}
        </form>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Submissions and re-exam approvals</h2>
            <p className="text-sm text-gray-500 mt-1">
              Teachers can request a re-exam for one student after submission. Admin approval is required before the
              student can take this exam again.
            </p>
          </div>
        </div>

        {submissionsLoading ? (
          <p className="text-sm text-gray-500">Loading student submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No assigned students found for this exam yet.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Student</th>
                  <th className="text-left px-4 py-3 font-semibold">Score</th>
                  <th className="text-left px-4 py-3 font-semibold">Result</th>
                  <th className="text-left px-4 py-3 font-semibold">Re-exam</th>
                  <th className="text-right px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((student) => {
                  const hasSubmission = Boolean(student.result_id);
                  const pendingRequest = student.reexam_status === "pending";
                  const approvedRequest = student.reexam_status === "approved";
                  const rejectedRequest = student.reexam_status === "rejected";

                  return (
                    <tr key={student.id} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">
                          Roll {student.roll_number || "-"} {student.email ? `· ${student.email}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">
                        {hasSubmission ? `${student.score} / ${exam.total_marks}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            hasSubmission
                              ? student.released
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {hasSubmission ? (student.released ? "Released" : "Submitted") : "Not submitted"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">
                          {pendingRequest
                            ? "Pending admin approval"
                            : approvedRequest
                              ? "Approved"
                              : rejectedRequest
                                ? "Rejected"
                                : "No request"}
                        </p>
                        {student.reexam_reason && (
                          <p className="text-xs text-gray-500 mt-1">Reason: {student.reexam_reason}</p>
                        )}
                        {student.reexam_admin_note && (
                          <p className="text-xs text-gray-500 mt-1">Admin note: {student.reexam_admin_note}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={!hasSubmission || pendingRequest || reexamActionStudentId === student.id}
                          onClick={() => handleRequestReexam(student)}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {reexamActionStudentId === student.id
                            ? "Sending..."
                            : pendingRequest
                              ? "Requested"
                              : approvedRequest && !hasSubmission
                                ? "Approved"
                                : "Request re-exam"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Import questions (JSON)</h2>
          <button
            type="button"
            onClick={downloadSample}
            className="text-sm text-purple-600 font-semibold hover:underline"
          >
            Download sample JSON
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Upload a file with an array of MCQs. Preview shows which rows are valid; the correct option is highlighted in
          green. Only valid rows are imported.
        </p>
        <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={onPickJsonFile} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Choose JSON file
        </button>
        {importParseError && (
          <p className="mt-3 text-sm text-red-600">{importParseError}</p>
        )}
        {importPreview && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              {importPreview.validPayloads.length} valid of {importPreview.total} — invalid rows are skipped.
            </p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-2 py-2">#</th>
                    <th className="text-left px-2 py-2">Status</th>
                    <th className="text-left px-2 py-2">Question</th>
                    <th className="text-left px-2 py-2">Options &amp; answer</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.preview.map((row) => (
                    <tr key={row.index} className="border-t border-gray-100 align-top">
                      <td className="px-2 py-2 text-gray-500">{row.index + 1}</td>
                      <td className="px-2 py-2">
                        {row.valid ? (
                          <span className="text-green-700 font-semibold">OK</span>
                        ) : (
                          <span className="text-red-600" title={row.reason}>
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-gray-800 max-w-[200px]">{row.question_text || "—"}</td>
                      <td className="px-2 py-2">
                        <ul className="space-y-0.5">
                          {OPT.map((L) => {
                            const opt = row[`option_${L.toLowerCase()}`];
                            const isCorrect = row.valid && row.correct_option === L;
                            return (
                              <li
                                key={L}
                                className={
                                  isCorrect ? "bg-green-100 text-green-900 font-medium px-1 rounded" : "text-gray-600"
                                }
                              >
                                {L}: {opt || "—"}
                              </li>
                            );
                          })}
                        </ul>
                        {!row.valid && row.reason && (
                          <p className="text-red-600 mt-1">{row.reason}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              disabled={importing || !importPreview.validPayloads.length}
              onClick={handleImportConfirmed}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              {importing ? "Importing…" : `Import ${importPreview.validPayloads.length} question(s)`}
            </button>
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Questions ({questions.length})</h2>
        <ul className="space-y-4 mb-6">
          {questions.map((q, i) =>
            editingQ === q.id ? (
              <li key={q.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50/50">
                <form onSubmit={handleSaveQuestion} className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Edit question {i + 1}</p>
                  <textarea
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    rows={2}
                    value={editQText}
                    onChange={(e) => setEditQText(e.target.value)}
                  />
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      required
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={editOptA}
                      onChange={(e) => setEditOptA(e.target.value)}
                    />
                    <input
                      required
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={editOptB}
                      onChange={(e) => setEditOptB(e.target.value)}
                    />
                    <input
                      required
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={editOptC}
                      onChange={(e) => setEditOptC(e.target.value)}
                    />
                    <input
                      required
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={editOptD}
                      onChange={(e) => setEditOptD(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <select
                      className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                      value={editCorrect}
                      onChange={(e) => setEditCorrect(e.target.value)}
                    >
                      {OPT.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                      value={editMarks}
                      onChange={(e) => setEditMarks(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={savingQ}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {savingQ ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditQuestion}
                      className="px-3 py-1.5 text-sm text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </li>
            ) : (
              <li key={q.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-medium text-gray-900">
                    {i + 1}. {q.question_text}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditQuestion(q)}
                      className="text-sm text-purple-600 font-semibold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-sm text-red-600 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  {OPT.map((L) => {
                    const opt = q[`option_${L.toLowerCase()}`];
                    const isCorrect = String(q.correct_option || "").trim().toUpperCase() === L;
                    return (
                      <li
                        key={L}
                        className={isCorrect ? "bg-green-100 text-green-900 rounded px-1 w-fit font-medium" : ""}
                      >
                        {L}: {opt}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Correct: {q.correct_option} · {q.marks} mark(s)
                </p>
              </li>
            )
          )}
        </ul>

        <h3 className="text-md font-semibold text-gray-800 mb-3">Add MCQ</h3>
        <form onSubmit={handleAddQuestion} className="space-y-3">
          <textarea
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            rows={2}
            placeholder="Question"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
          />
          <div className="grid sm:grid-cols-2 gap-2">
            <input
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Option A"
              value={optA}
              onChange={(e) => setOptA(e.target.value)}
            />
            <input
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Option B"
              value={optB}
              onChange={(e) => setOptB(e.target.value)}
            />
            <input
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Option C"
              value={optC}
              onChange={(e) => setOptC(e.target.value)}
            />
            <input
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Option D"
              value={optD}
              onChange={(e) => setOptD(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-sm text-gray-700">Correct</label>
            <select
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
            >
              {OPT.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <label className="text-sm text-gray-700">Marks</label>
            <input
              type="number"
              min={1}
              className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
            />
            <button
              type="submit"
              disabled={adding}
              className="ml-auto px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-60"
            >
              {adding ? "Adding…" : "Add question"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function formatTimeForInput(t) {
  if (t == null || t === "") return "09:00";
  const s = String(t);
  if (s.length >= 5) return s.slice(0, 5);
  return s;
}
