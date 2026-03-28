import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function ReexamRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingRequestId, setReviewingRequestId] = useState(null);

  const load = async () => {
    const res = await API.get("/admin/reexam-requests");
    setRequests(res.data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setError(e.response?.data?.message || "Could not load re-exam requests.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      await load();
    } catch (e) {
      setError(e.response?.data?.message || `Could not ${actionLabel} this request.`);
    } finally {
      setReviewingRequestId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 sm:p-10">
        <p className="text-gray-500">Loading re-exam requests...</p>
      </div>
    );
  }

  return (
    <div className="p-8 sm:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Re-exam Requests</h1>
        <p className="text-sm text-gray-500 mt-2">
          Review teacher requests and approve or reject individual student re-exams.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">No re-exam requests yet.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const isPending = request.status === "pending";
              const statusClass =
                request.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : request.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700";

              return (
                <div key={request.id} className="border border-gray-200 rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{request.student_name}</p>
                      <p className="text-sm text-gray-500 mt-1">
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
                    <p className="text-sm text-gray-700 mt-4">
                      <span className="font-medium">Teacher reason:</span> {request.reason}
                    </p>
                  )}

                  {request.admin_note && (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Admin note:</span> {request.admin_note}
                    </p>
                  )}

                  {isPending && (
                    <div className="flex flex-wrap gap-2 mt-5">
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
      </div>
    </div>
  );
}
