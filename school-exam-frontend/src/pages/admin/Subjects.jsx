import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Subjects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newClassId, setNewClassId] = useState("");
  const [newSyllabusLink, setNewSyllabusLink] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [editId, setEditId] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editClassId, setEditClassId] = useState("");
  const [editSyllabusLink, setEditSyllabusLink] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    const res = await API.get("/admin/subjects");
    setSubjects(res.data || []);
  };

  const fetchClasses = async () => {
    const res = await API.get("/admin/classes");
    setClasses(res.data || []);
  };

  const createSubject = async () => {
    if (!newSubject.trim() || !newClassId) return;

    try {
      setError("");
      await API.post("/admin/subject", {
        subject_name: newSubject,
        class_id: newClassId,
        syllabus_link: newSyllabusLink,
      });

      closeModal();
      fetchSubjects();
    } catch (e) {
      setError(e.response?.data?.message || "Could not create subject.");
    }
  };

  const updateSubject = async () => {
    if (!editSubject.trim() || !editClassId) return;

    try {
      setError("");
      await API.put("/admin/subject", {
        id: editId,
        subject_name: editSubject,
        class_id: editClassId,
        syllabus_link: editSyllabusLink,
      });

      cancelEdit();
      fetchSubjects();
    } catch (e) {
      setError(e.response?.data?.message || "Could not update subject.");
    }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      setError("");
      await API.delete(`/admin/subject/${id}`);
      fetchSubjects();
    } catch (e) {
      setError(e.response?.data?.message || "Could not delete subject.");
    }
  };

  const startEdit = (subject) => {
    setEditId(subject.id);
    setEditSubject(subject.subject_name);
    setEditClassId(subject.class_id || "");
    setEditSyllabusLink(subject.syllabus_link || "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditSubject("");
    setEditClassId("");
    setEditSyllabusLink("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewSubject("");
    setNewClassId("");
    setNewSyllabusLink("");
  };

  const filteredSubjects = filterClassId
    ? subjects.filter((subject) => String(subject.class_id) === String(filterClassId))
    : subjects;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Subjects and Syllabus</h1>
          <p className="text-sm text-gray-500 mt-2">
            Paste a Google Drive PDF link for each subject so students and assigned teachers can view the syllabus.
          </p>
        </div>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 shadow-sm whitespace-nowrap"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Subject
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 w-full max-w-sm">
            <label htmlFor="filterClass" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by Class:
            </label>
            <select
              id="filterClass"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500">Showing {filteredSubjects.length} subject(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Class</th>
                <th className="p-4">Syllabus PDF</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className={editId === subject.id ? "bg-blue-50/40" : "group hover:bg-gray-50"}>
                    <td className="p-4 pl-6 text-sm text-gray-500">#{subject.id}</td>
                    <td className="p-4 text-sm font-medium text-gray-900 align-top">
                      {editId === subject.id ? (
                        <input
                          type="text"
                          className="w-full border border-blue-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                        />
                      ) : (
                        subject.subject_name
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-700 align-top">
                      {editId === subject.id ? (
                        <select
                          className="w-full border border-blue-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          value={editClassId}
                          onChange={(e) => setEditClassId(e.target.value)}
                        >
                          <option value="" disabled>Select Class</option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.class_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        subject.class_name
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-700 align-top min-w-[320px]">
                      {editId === subject.id ? (
                        <textarea
                          rows={3}
                          className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder="Paste Google Drive PDF link"
                          value={editSyllabusLink}
                          onChange={(e) => setEditSyllabusLink(e.target.value)}
                        />
                      ) : subject.syllabus_link ? (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 break-all">{subject.syllabus_link}</p>
                          <a
                            href={subject.syllabus_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-blue-600 font-semibold hover:underline"
                          >
                            Open syllabus
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400">No syllabus link</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right align-top">
                      {editId === subject.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors shadow-sm"
                            onClick={updateSubject}
                          >
                            Save
                          </button>
                          <button
                            className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex justify-end gap-2">
                          <button
                            className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                            onClick={() => startEdit(subject)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-md transition-colors"
                            onClick={() => deleteSubject(subject.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 text-sm">
                    No subjects found for this criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Add Subject and Syllabus</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl font-semibold leading-none">
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="e.g., Mathematics"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Class</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                >
                  <option value="" disabled>Select a Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Drive syllabus PDF link</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Paste the shareable Google Drive PDF link here"
                  value={newSyllabusLink}
                  onChange={(e) => setNewSyllabusLink(e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50"
                onClick={createSubject}
                disabled={!newSubject.trim() || !newClassId}
              >
                Save Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
