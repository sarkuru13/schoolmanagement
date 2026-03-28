import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";

function downloadDetailedResultsCsv(rows) {
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

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "student-exam-results.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function Results() {
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [reexamRequests, setReexamRequests] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeExamId, setActiveExamId] = useState(null);
  const [reviewingRequestId, setReviewingRequestId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loadRows = async () => {
    const [resultsRes, classesRes, requestsRes] = await Promise.all([
      API.get("/admin/results-release-list"),
      API.get("/admin/classes"),
      API.get("/admin/reexam-requests"),
    ]);

    setRows(resultsRes.data || []);
    setClasses(classesRes.data || []);
    setReexamRequests(requestsRes.data || []);
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

  const pendingRequests = reexamRequests.filter((request) => request.status === "pending");

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

  const handleReviewRequest = async (requestId, status) => {
    const actionLabel = status === "approved" ? "approve" : "reject";
    const adminNote = window.prompt(`Optional note for this ${actionLabel} decision:`, "");
    if (adminNote === null) return;

    setReviewingRequestId(requestId);
    setError("");
    try {
      await API.post(`/admin/reexam-requests/${requestId}/review`, {
        status,
        admin_note: adminNote,
      });
      await loadRows();
    } catch (e) {
      setError(e.response?.data?.message || `Could not ${actionLabel} this request.`);
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const res = await API.get("/admin/results-export");
      downloadDetailedResultsCsv(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not export student scores.");
    } finally {
      setExporting(false);
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
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Result and Re-exam Control</h1>
          <p className="text-sm text-gray-500 mt-2">
            Release exam results, approve teacher re-exam requests, and export real student score sheets.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export Student Scores CSV"}
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

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 mb-6">
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Re-exam approval queue</h2>
              <p className="text-sm text-gray-500 mt-1">
                When approved, the student's old submission is cleared and the exam becomes available again.
              </p>
            </div>
            <span className="inline-flex px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold">
              {pendingRequests.length} pending
            </span>
          </div>

          {reexamRequests.length === 0 ? (
            <p className="text-sm text-gray-500">No re-exam requests yet.</p>
          ) : (
            <div className="space-y-4 max-h-[34rem] overflow-y-auto pr-1">
              {reexamRequests.map((request) => {
                const isPending = request.status === "pending";
                const statusClass =
                  request.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : request.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700";

                return (
                  <div key={request.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{request.student_name}</p>
                        <p className="text-sm text-gray-500">
                          Roll {request.roll_number || "-"} · {request.class_name} · {request.exam_title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {request.subject_name} · Teacher: {request.teacher_name}
                        </p>
                      </div>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                        {request.status}
                      </span>
                    </div>

                    {request.reason && (
                      <p className="text-sm text-gray-700 mt-3">
                        <span className="font-medium">Teacher reason:</span> {request.reason}
                      </p>
                    )}

                    {request.admin_note && (
                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Admin note:</span> {request.admin_note}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-3">
                      Requested: {request.requested_at ? String(request.requested_at).slice(0, 19).replace("T", " ") : "-"}
                      {request.admin_name ? ` · Reviewed by ${request.admin_name}` : ""}
                    </p>

                    {isPending && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          type="button"
                          disabled={reviewingRequestId === request.id}
                          onClick={() => handleReviewRequest(request.id, "approved")}
                          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          {reviewingRequestId === request.id ? "Saving..." : "Approve re-exam"}
                        </button>
                        <button
                          type="button"
                          disabled={reviewingRequestId === request.id}
                          onClick={() => handleReviewRequest(request.id, "rejected")}
                          className="px-4 py-2 rounded-lg border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Release filters</h2>
          <div className="space-y-4">
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
        </section>
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
