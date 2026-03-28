import { useEffect, useMemo, useState } from "react";
import API from "../../api/axios";

export default function StudentSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSubjectId, setActiveSubjectId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/student/subjects");
        const rows = res.data || [];
        setSubjects(rows);
        setActiveSubjectId(rows[0]?.id || null);
      } catch (e) {
        setError(e.response?.data?.message || "Could not load subjects.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeSubject = useMemo(
    () => subjects.find((subject) => subject.id === activeSubjectId) || null,
    [subjects, activeSubjectId]
  );

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My subjects</h1>
      <p className="text-sm text-gray-500 mb-6">
        Click a subject to view its syllabus.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {subjects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center text-gray-500">
          No subjects found for your class.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
          <aside className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
            <div className="space-y-2">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setActiveSubjectId(subject.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-4 transition ${
                    activeSubjectId === subject.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{subject.subject_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{subject.class_name}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm min-h-[520px]">
            {activeSubject ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Subject syllabus</p>
                    <h2 className="text-2xl font-bold text-gray-900 mt-2">{activeSubject.subject_name}</h2>
                    <p className="text-sm text-gray-500 mt-2">{activeSubject.class_name}</p>
                  </div>
                  {activeSubject.syllabus_link && (
                    <a
                      href={activeSubject.syllabus_link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    >
                      Open in new tab
                    </a>
                  )}
                </div>

                {activeSubject.syllabus_link ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 break-all">{activeSubject.syllabus_link}</p>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-gray-200">
                      <iframe
                        title={`${activeSubject.subject_name} syllabus`}
                        src={toPreviewUrl(activeSubject.syllabus_link)}
                        className="w-full h-[620px] bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                    No syllabus uploaded for this subject yet.
                  </div>
                )}
              </>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}

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
