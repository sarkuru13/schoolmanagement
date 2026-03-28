import { useEffect, useState } from "react";
import API from "../../api/axios";

function toPreviewUrl(url) {
  if (!url) return "";

  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch?.[1]) {
    return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  }

  const openMatch = url.match(/[?&]id=([^&]+)/);
  if (openMatch?.[1]) {
    return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
  }

  return url;
}

export default function TeacherClasses() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/teacher/assignments");
        const data = res.data || [];
        setRows(data);
        setActiveId(data[0]?.id || null);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load assignments.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  const activeRow = rows.find((row) => row.id === activeId) || null;

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My classes &amp; subjects</h1>
      <p className="text-sm text-gray-500 mb-6">Teaching assignments and syllabus links shared by your administrator.</p>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      {rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No assignments found.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[340px_minmax(0,1fr)] gap-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
            <div className="space-y-2">
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveId(r.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-4 transition ${
                    activeId === r.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{r.subject_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{r.class_name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm min-h-[320px]">
            {activeRow && (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Assigned subject</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{activeRow.subject_name}</h2>
                <p className="text-sm text-gray-500 mt-2">Class: {activeRow.class_name}</p>

                {activeRow.syllabus_link ? (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 break-all">{activeRow.syllabus_link}</p>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-gray-200">
                      <iframe
                        title={`${activeRow.subject_name} syllabus`}
                        src={toPreviewUrl(activeRow.syllabus_link)}
                        className="w-full h-[520px] bg-white"
                      />
                    </div>
                    <a
                      href={activeRow.syllabus_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    >
                      Open syllabus
                    </a>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                    No syllabus link uploaded for this subject yet.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
