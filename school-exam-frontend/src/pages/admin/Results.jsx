import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";

function downloadExamScoresCsv(exam, rows) {
  const headers = [
    "Exam",
    "Class",
    "Subject",
    "Teacher",
    "Student",
    "Roll Number",
    "Student Email",
    "Score",
    "Total Marks",
    "Percentage",
    "Released",
    "Exam Date",
  ];

  const escapeValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.title,
        row.class_name,
        row.subject_name,
        row.teacher_name || "Unassigned",
        row.student_name,
        row.roll_number,
        row.student_email,
        row.score,
        row.total_marks,
        row.total_marks ? ((Number(row.score || 0) / Number(row.total_marks)) * 100).toFixed(2) : "",
        row.released ? "Yes" : "No",
        row.exam_date ? String(row.exam_date).slice(0, 10) : "",
      ]
        .map(escapeValue)
        .join(",")
    ),
  ];

  const safeName = String(exam.title || "exam").replace(/[^\w\d-]+/g, "_");
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeName}-scores.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Results() {
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeExamId, setActiveExamId] = useState(null);
  const [scoreRowsByExam, setScoreRowsByExam] = useState({});
  const [scoresLoadingExamId, setScoresLoadingExamId] = useState(null);

  const loadRows = async () => {
    const [resultsRes, classesRes] = await Promise.all([
      API.get("/admin/results-release-list"),
      API.get("/admin/classes"),
    ]);

    setRows(resultsRes.data || []);
    setClasses(classesRes.data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadRows();
      } catch (e) {
        setError(e.response?.data?.message || "Could not load exam results.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const normalizedRows = useMemo(
    () =>
      rows.map((row) => {
        const classAssignments = Number(row.class_assignment_count || 0);
        const singleAssignments = Number(row.single_student_count || 0);

        let assignmentLabel = "Not assigned";
        let assignmentType = "none";

        if (classAssignments > 0 && singleAssignments > 0) {
          assignmentLabel = "Class and single students";
          assignmentType = "mixed";
        } else if (classAssignments > 0) {
          assignmentLabel = "Whole class";
          assignmentType = "class";
        } else if (singleAssignments > 0) {
          assignmentLabel = "Single student";
          assignmentType = "single";
        }

        return {
          ...row,
          assignmentLabel,
          assignmentType,
        };
      }),
    [rows]
  );

  const filteredRows = normalizedRows.filter((row) => {
    const classMatch = selectedClass === "all" || String(row.class_id) === selectedClass;
    const assignmentMatch = assignmentFilter === "all" || row.assignmentType === assignmentFilter;
    return classMatch && assignmentMatch;
  });

  const loadExamScores = async (examId) => {
    setScoresLoadingExamId(examId);
    try {
      const res = await API.get(`/admin/exams/${examId}/scores`);
      setScoreRowsByExam((prev) => ({ ...prev, [examId]: res.data || [] }));
    } catch (e) {
      setError(e.response?.data?.message || "Could not load exam scores.");
    } finally {
      setScoresLoadingExamId(null);
    }
  };

  const toggleScores = async (examId) => {
    if (activeExamId === examId) {
      setActiveExamId(null);
      return;
    }

    setActiveExamId(examId);
    if (!scoreRowsByExam[examId]) {
      await loadExamScores(examId);
    }
  };

  const handleRelease = async (examId) => {
    setError("");
    try {
      await API.post("/admin/release", { exam_id: examId });
      await Promise.all([loadRows(), loadExamScores(examId)]);
    } catch (e) {
      setError(e.response?.data?.message || "Could not release this result.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 sm:p-10">
        <p className="text-gray-500">Loading result dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Results</h1>
        <p className="text-sm text-gray-500 mt-2">
          Review tentative student scores for each exam before releasing, and export every exam separately.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-5 shadow-sm mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            >
              <option value="all">All classes</option>
              {classes.map((classRow) => (
                <option key={classRow.id} value={String(classRow.id)}>
                  {classRow.class_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment type</label>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            >
              <option value="all">All assignments</option>
              <option value="class">Whole class</option>
              <option value="single">Single student</option>
              <option value="mixed">Class and single students</option>
              <option value="none">Not assigned</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {filteredRows.length ? (
          filteredRows.map((exam) => {
            const scoreRows = scoreRowsByExam[exam.id] || [];
            const allReleased =
              Number(exam.submitted_count) > 0 && Number(exam.submitted_count) === Number(exam.released_count);
            const canRelease = Number(exam.submitted_count) > 0 && !allReleased;
            const isOpen = activeExamId === exam.id;

            return (
              <section key={exam.id} className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{exam.title}</h2>
                      <p className="text-sm text-gray-500 mt-2">
                        {exam.class_name} · {exam.subject_name} · {exam.exam_date ? String(exam.exam_date).slice(0, 10) : "No date"}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Teacher: {exam.teacher_name || "Unassigned"} · Assignment: {exam.assignmentLabel}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => toggleScores(exam.id)}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                      >
                        {isOpen ? "Hide tentative scores" : "View tentative scores"}
                      </button>
                      <button
                        type="button"
                        disabled={!scoreRows.length}
                        onClick={() => downloadExamScoresCsv(exam, scoreRows)}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                      >
                        Export this exam
                      </button>
                      <button
                        type="button"
                        disabled={!canRelease}
                        onClick={() => handleRelease(exam.id)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                      >
                        {allReleased ? "Released" : "Release result"}
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 mt-5">
                    <StatPill label="Submitted" value={exam.submitted_count} />
                    <StatPill label="Released" value={exam.released_count} />
                    <StatPill label="Total marks" value={exam.total_marks} />
                  </div>
                </div>

                {isOpen && (
                  <div className="p-6">
                    {scoresLoadingExamId === exam.id ? (
                      <p className="text-sm text-gray-500">Loading tentative scores...</p>
                    ) : scoreRows.length ? (
                      <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 text-gray-600">
                            <tr>
                              <th className="text-left px-4 py-3 font-semibold">Student</th>
                              <th className="text-left px-4 py-3 font-semibold">Roll</th>
                              <th className="text-left px-4 py-3 font-semibold">Email</th>
                              <th className="text-left px-4 py-3 font-semibold">Tentative score</th>
                              <th className="text-left px-4 py-3 font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scoreRows.map((scoreRow) => (
                              <tr key={scoreRow.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 font-medium text-gray-900">{scoreRow.student_name}</td>
                                <td className="px-4 py-3 text-gray-600">{scoreRow.roll_number || "-"}</td>
                                <td className="px-4 py-3 text-gray-600">{scoreRow.student_email || "-"}</td>
                                <td className="px-4 py-3 text-gray-900 font-semibold">
                                  {scoreRow.score} / {scoreRow.total_marks}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                      scoreRow.released ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {scoreRow.released ? "Released" : "Tentative"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                        No submitted scores found for this exam yet.
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center text-gray-500">
            No exams match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
