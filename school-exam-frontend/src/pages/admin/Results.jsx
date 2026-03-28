import { useEffect, useState } from "react";
import API from "../../api/axios";

function downloadCsv(rows) {
  const headers = [
    "Exam",
    "Class",
    "Subject",
    "Teacher",
    "Assignment Type",
    "Assigned Students",
    "Assigned Count",
    "Submitted",
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
        row.assignmentLabel,
        row.assigned_students || "",
        row.assigned_count,
        row.submitted_count,
        row.released_count,
        row.exam_date ? String(row.exam_date).slice(0, 10) : "",
      ]
        .map(escapeValue)
        .join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exam-release-dashboard.csv";
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

  const normalizedRows = rows.map((row) => {
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
  });

  const filteredRows = normalizedRows.filter((row) => {
    const classMatch = selectedClass === "all" || String(row.class_id) === selectedClass;
    const assignmentMatch = assignmentFilter === "all" || row.assignmentType === assignmentFilter;
    return classMatch && assignmentMatch;
  });

  const handleRelease = async (examId) => {
    setActiveExamId(examId);
    setError("");
    try {
      await API.post("/admin/release", { exam_id: examId });
      await loadRows();
    } catch (e) {
      setError(e.response?.data?.message || "Could not release this result.");
    } finally {
      setActiveExamId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading result release dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Result Release Dashboard</h1>
          <p className="text-sm text-gray-500 mt-2">
            Filter by class, review class-wide or single-student assignments, and release results when ready.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadCsv(filteredRows)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
          >
            Export Excel CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm mb-6">
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

      {filteredRows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          No exams match the selected filters.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Exam</th>
                <th className="text-left px-4 py-3 font-semibold">Class</th>
                <th className="text-left px-4 py-3 font-semibold">Assignment</th>
                <th className="text-left px-4 py-3 font-semibold">Teacher</th>
                <th className="text-left px-4 py-3 font-semibold">Submitted</th>
                <th className="text-left px-4 py-3 font-semibold">Released</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                const allReleased =
                  Number(row.submitted_count) > 0 && Number(row.submitted_count) === Number(row.released_count);
                const canRelease = Number(row.submitted_count) > 0 && !allReleased;

                return (
                  <tr key={row.id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{row.title}</p>
                        <p className="text-xs text-gray-500">
                          {row.subject_name} · {row.exam_date ? String(row.exam_date).slice(0, 10) : "No date"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{row.class_name}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{row.assignmentLabel}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {row.assigned_students || `${row.assigned_count} assignment record(s)`}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{row.teacher_name || "Unassigned"}</td>
                    <td className="px-4 py-4 text-gray-900 font-semibold">{row.submitted_count}</td>
                    <td className="px-4 py-4 text-gray-700">{row.released_count}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          allReleased
                            ? "bg-green-100 text-green-700"
                            : Number(row.submitted_count) > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {allReleased ? "Released" : Number(row.submitted_count) > 0 ? "Ready to release" : "Waiting for submissions"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        disabled={!canRelease || activeExamId === row.id}
                        onClick={() => handleRelease(row.id)}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                      >
                        {activeExamId === row.id ? "Releasing..." : allReleased ? "Released" : "Release"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
