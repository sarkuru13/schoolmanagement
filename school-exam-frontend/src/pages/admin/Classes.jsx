import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Classes() {
  // State for creating a new class
  const [newClassName, setNewClassName] = useState("");
  
  // State for the class list
  const [classes, setClasses] = useState([]);
  
  // State for inline editing
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const res = await API.get("/admin/classes");
    setClasses(res.data);
  };

  const createClass = async () => {
    if (!newClassName.trim()) return;
    
    await API.post("/admin/class", {
      class_name: newClassName,
    });
    setNewClassName("");
    fetchClasses();
  };

  const updateClass = async () => {
    if (!editName.trim()) return;

    await API.put("/admin/class", {
      id: editId,
      class_name: editName,
    });
    setEditId(null);
    setEditName("");
    fetchClasses();
  };

  const deleteClass = async (id) => {
    // Added confirmation prompt
    const isConfirmed = window.confirm("Are you sure you want to delete this class? This action cannot be undone.");
    
    if (isConfirmed) {
      await API.delete(`/admin/class/${id}`);
      fetchClasses();
    }
  };

  const startEdit = (c) => {
    setEditId(c.id);
    setEditName(c.class_name);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Manage Classes
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Add new classes, update existing ones directly in the list, or remove classes.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* CREATE FORM SECTION (Top) */}
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
            <div className="flex-1 w-full">
              <label 
                htmlFor="newClassName" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Class Name
              </label>
              <input
                id="newClassName"
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                placeholder="e.g., Mathematics 101"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createClass()}
              />
            </div>
            <button
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={createClass}
              disabled={!newClassName.trim()}
            >
              Create Class
            </button>
          </div>
        </div>

        {/* CLASS TABLE SECTION (Inline Edit) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6 w-24">ID</th>
                <th className="p-4">Class Name</th>
                <th className="p-4 pr-6 text-right w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.length > 0 ? (
                classes.map((c) => (
                  <tr 
                    key={c.id} 
                    className={`hover:bg-gray-50 transition-colors duration-150 ${editId === c.id ? 'bg-blue-50/30' : 'group'}`}
                  >
                    <td className="p-4 pl-6 text-sm text-gray-500">
                      #{c.id}
                    </td>
                    
                    {/* Dynamic Table Cell: Input or Text */}
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {editId === c.id ? (
                        <input
                          type="text"
                          autoFocus
                          className="w-full sm:w-2/3 border border-blue-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && updateClass()}
                        />
                      ) : (
                        c.class_name
                      )}
                    </td>

                    {/* Dynamic Action Buttons */}
                    <td className="p-4 pr-6 flex justify-end gap-2 transition-opacity duration-200">
                      {editId === c.id ? (
                        <>
                          <button
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors shadow-sm"
                            onClick={updateClass}
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
                            onClick={() => startEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-md transition-colors"
                            onClick={() => deleteClass(c.id)}
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
                  <td colSpan="3" className="p-8 text-center text-gray-500 text-sm">
                    No classes found. Create one above to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}