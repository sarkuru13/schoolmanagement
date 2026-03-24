import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Subjects() {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for creating a new subject (inside modal)
  const [newSubject, setNewSubject] = useState("");
  const [newClassId, setNewClassId] = useState("");

  // State for filtering the table
  const [filterClassId, setFilterClassId] = useState("");

  // State for inline editing
  const [editId, setEditId] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editClassId, setEditClassId] = useState("");

  // Data states
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  const fetchSubjects = async () => {
    const res = await API.get("/admin/subjects");
    setSubjects(res.data);
  };

  const fetchClasses = async () => {
    const res = await API.get("/admin/classes");
    setClasses(res.data);
  };

  const createSubject = async () => {
    if (!newSubject.trim() || !newClassId) return;

    await API.post("/admin/subject", {
      subject_name: newSubject,
      class_id: newClassId,
    });

    setNewSubject("");
    setNewClassId("");
    setIsModalOpen(false); // Close the modal on success
    fetchSubjects();
  };

  const updateSubject = async () => {
    if (!editSubject.trim() || !editClassId) return;

    await API.put("/admin/subject", {
      id: editId,
      subject_name: editSubject,
      class_id: editClassId,
    });

    setEditId(null);
    setEditSubject("");
    setEditClassId("");
    fetchSubjects();
  };

  const deleteSubject = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this subject? This action cannot be undone.");
    
    if (isConfirmed) {
      await API.delete(`/admin/subject/${id}`);
      fetchSubjects();
    }
  };

  const startEdit = (s) => {
    setEditId(s.id);
    setEditSubject(s.subject_name);
    setEditClassId(s.class_id || ""); 
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditSubject("");
    setEditClassId("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewSubject("");
    setNewClassId("");
  };

  // Derive the filtered subjects based on the selected dropdown value
  const filteredSubjects = filterClassId
    ? subjects.filter((s) => String(s.class_id) === String(filterClassId))
    : subjects;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 relative">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Manage Subjects
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Filter by class, update curriculum data, or add new subjects.
          </p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 shadow-sm whitespace-nowrap"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Subject
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* FILTER BAR */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
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
          <span className="text-sm text-gray-500 hidden sm:block">
            Showing {filteredSubjects.length} subject{filteredSubjects.length !== 1 && 's'}
          </span>
        </div>

        {/* SUBJECTS TABLE SECTION */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6 w-24">ID</th>
                <th className="p-4 w-1/3">Subject</th>
                <th className="p-4 w-1/3">Class</th>
                <th className="p-4 pr-6 text-right w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((s) => (
                  <tr 
                    key={s.id} 
                    className={`hover:bg-gray-50 transition-colors duration-150 ${editId === s.id ? 'bg-blue-50/30' : 'group'}`}
                  >
                    <td className="p-4 pl-6 text-sm text-gray-500">#{s.id}</td>
                    
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {editId === s.id ? (
                        <input
                          type="text"
                          autoFocus
                          className="w-full border border-blue-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && updateSubject()}
                        />
                      ) : (
                        s.subject_name
                      )}
                    </td>

                    <td className="p-4 text-sm text-gray-700">
                      {editId === s.id ? (
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
                        s.class_name
                      )}
                    </td>

                    <td className="p-4 pr-6 flex justify-end gap-2 transition-opacity duration-200">
                      {editId === s.id ? (
                        <>
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
                        </>
                      ) : (
                        <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex gap-2">
                          <button
                            className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md transition-colors"
                            onClick={() => startEdit(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-md transition-colors"
                            onClick={() => deleteSubject(s.id)}
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
                  <td colSpan="4" className="p-8 text-center text-gray-500 text-sm">
                    No subjects found for this criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SUBJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Add New Subject</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-semibold leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="modalNewSubject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <input
                  id="modalNewSubject"
                  type="text"
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                  placeholder="e.g., Biology"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="modalNewClass" className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Class
                </label>
                <select
                  id="modalNewClass"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
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
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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