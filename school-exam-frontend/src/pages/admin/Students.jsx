import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Students() {
  /* ---------- STATES ---------- */
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterClass, setFilterClass] = useState("");

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roll, setRoll] = useState("");
  const [classId, setClassId] = useState("");

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const s = await API.get("/admin/students");
      const c = await API.get("/admin/classes");
      setStudents(s.data);
      setClasses(c.data);
    } catch (err) {
      console.log(err);
    }
  };

  /* ---------- CREATE ---------- */
  const addStudent = async (e) => {
    e?.preventDefault(); // Prevent form from refreshing page
    try {
      await API.post("/admin/student", {
        name,
        email,
        password,
        roll_number: roll,
        class_id: classId,
      });

      alert("Student Added Successfully!");
      resetForm();
      fetchData();
    } catch (err) {
      alert("Error adding student");
      console.log(err);
    }
  };

  /* ---------- UPDATE ---------- */
  const updateStudent = async (e) => {
    e?.preventDefault();
    try {
      await API.put("/admin/student", {
        id: editId,
        name,
        email,
        class_id: classId,
        roll_number: roll,
      });

      alert("Student Updated Successfully!");
      resetForm();
      fetchData();
    } catch (err) {
      alert("Error updating student");
      console.log(err);
    }
  };

  /* ---------- DELETE ---------- */
  const deleteStudent = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this student? This action cannot be undone.");
    if (!isConfirmed) return;

    try {
      await API.delete(`/admin/student/${id}`);
      fetchData();
    } catch (err) {
      alert("Error deleting student");
      console.log(err);
    }
  };

  /* ---------- EDIT MODE ---------- */
  const startEdit = (s) => {
    setEditId(s.id);
    setName(s.name);
    setEmail(s.email);
    setRoll(s.roll_number);
    setClassId(s.class_id || "");
    setPassword(""); // Clear password field
    setIsModalOpen(true);
  };

  /* ---------- RESET ---------- */
  const resetForm = () => {
    setEditId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRoll("");
    setClassId("");
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  /* ---------- FILTER ---------- */
  const filteredStudents = filterClass
    ? students.filter((s) => String(s.class_id) === String(filterClass))
    : students;

  /* ---------- UI ---------- */
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 relative">
      
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Manage Students
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            View, filter, and manage student accounts across all classes.
          </p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 shadow-sm whitespace-nowrap"
          onClick={openAddModal}
        >
          + Add New Student
        </button>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* FILTER BAR */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:max-w-xs">
            <label htmlFor="filterClass" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by Class:
            </label>
            <select
              id="filterClass"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            Total Students: {filteredStudents.length}
          </span>
        </div>

        {/* STUDENTS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6 w-20">ID</th>
                <th className="p-4">Student Info</th>
                <th className="p-4">Class</th>
                <th className="p-4">Roll No.</th>
                <th className="p-4 pr-6 text-right w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                    <td className="p-4 pl-6 text-sm text-gray-500">#{s.id}</td>
                    
                    {/* Combined Name and Email Cell for a cleaner look */}
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.email}</div>
                    </td>

                    <td className="p-4 text-sm text-gray-700">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-100 inline-block">
                        {s.class_name || "Unassigned"}
                      </span>
                    </td>
                    
                    <td className="p-4 text-sm font-mono text-gray-600">
                      {s.roll_number}
                    </td>

                    <td className="p-4 pr-6 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                        onClick={() => startEdit(s)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                        onClick={() => deleteStudent(s.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No students found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new student to the system.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8 transform transition-all">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-900">
                {editId ? "Edit Student Profile" : "Register New Student"}
              </h3>
              <button 
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-semibold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Changed to a form so pressing "Enter" works automatically */}
            <form onSubmit={editId ? updateStudent : addStudent}>
              <div className="p-6 space-y-4">
                
                {/* 2-Column Grid for Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      autoFocus
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="e.g., John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="student@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Only show Password field if creating a NEW student */}
                  {!editId && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        required={!editId}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Assign a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="e.g., CS-101"
                      value={roll}
                      onChange={(e) => setRoll(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Class</label>
                    <select
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
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
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
                <button
                  type="button"
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${
                    editId ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
                  } text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 shadow-sm`}
                >
                  {editId ? "Update Student" : "Save Student"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}