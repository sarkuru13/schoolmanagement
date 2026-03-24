import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Teachers() {
  /* ---------- STATES ---------- */
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]); // Currently assigned teachers
  const [allTeachers, setAllTeachers] = useState([]); // Every teacher in the system

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const c = await API.get("/admin/classes");
    const t = await API.get("/admin/teachers");

    setClasses(c.data);
    setAllTeachers(t.data);
  };

  /* ---------- SUBJECTS BY CLASS ---------- */
  useEffect(() => {
    if (classId) {
      setSubjects([]);      // reset
      setSubjectId("");     // clear old selection
      setTeachers([]);      // clear table
      fetchSubjects();
    } else {
      setSubjects([]);
      setSubjectId("");
      setTeachers([]);
    }
  }, [classId]);

  const fetchSubjects = async () => {
    try {
      const res = await API.get(`/admin/subjects-by-class/${classId}`);
      if (Array.isArray(res.data)) {
        setSubjects(res.data);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.log("Error:", err);
      setSubjects([]);
    }
  };

  /* ---------- ASSIGNED TEACHERS ---------- */
  useEffect(() => {
    if (classId && subjectId) {
      fetchAssignedTeachers();
    } else {
      setTeachers([]);
    }
  }, [subjectId, classId]);

  const fetchAssignedTeachers = async () => {
    try {
      const res = await API.get(`/admin/assigned-teachers/${classId}/${subjectId}`);
      setTeachers(res.data);
    } catch (err) {
      console.log("Error fetching assigned teachers:", err);
      setTeachers([]);
    }
  };

  /* ---------- ASSIGN TEACHER ---------- */
  const assignTeacher = async () => {
    try {
      await API.post("/admin/assign-teacher", {
        teacher_id: teacherId,
        subject_id: subjectId,
        class_id: classId,
      });

      alert("Teacher Assigned Successfully!");
      setTeacherId(""); 
      fetchAssignedTeachers(); 
    } catch (err) {
      console.log(err);
      alert("Error assigning teacher.");
    }
  };

  /* ---------- UNASSIGN TEACHER (Added for Convenience) ---------- */
  const unassignTeacher = async (teacherIdToRemove) => {
    const isConfirmed = window.confirm("Are you sure you want to remove this teacher from this subject?");
    
    if (isConfirmed) {
      try {
        // NOTE: Adjust this endpoint to match your backend route for deleting an assignment
        await API.post("/admin/unassign-teacher", {
          teacher_id: teacherIdToRemove,
          subject_id: subjectId,
          class_id: classId,
        });
        
        fetchAssignedTeachers(); // Refresh list to show they were removed
      } catch (err) {
        console.log(err);
        alert("Error removing teacher assignment.");
      }
    }
  };

  /* ---------- FILTER AVAILABLE TEACHERS ---------- */
  // This filters out teachers who are already in the `teachers` array
  const availableTeachers = allTeachers.filter(
    (teacher) => !teachers.some((assigned) => assigned.id === teacher.id)
  );

  /* ---------- UI ---------- */
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Teacher Assignment Panel
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Select a class and subject to view or assign teaching faculty.
        </p>
      </div>

      {/* STEP 1: SELECT CURRICULUM */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
          Step 1: Select Curriculum
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          
          <div className="flex-1">
            <label htmlFor="classSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              id="classSelect"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-shadow"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">-- Select Class --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="subjectSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              id="subjectSelect"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-shadow"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={!classId}
            >
              <option value="">
                {!classId ? "-- Select a Class First --" : "-- Select Subject --"}
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STEP 2: ASSIGNMENT AREA */}
      {classId && subjectId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
          
          {/* Assign New Teacher Form */}
          <div className="p-6 border-b border-gray-200 bg-purple-50/30">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Step 2: Assign a Teacher
            </h2>
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label htmlFor="teacherSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Teacher to Assign
                </label>
                <select
                  id="teacherSelect"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-shadow disabled:bg-gray-100 disabled:text-gray-500"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  disabled={availableTeachers.length === 0} // Disable if no teachers left
                >
                  {/* Dynamic default option based on availability */}
                  {availableTeachers.length === 0 ? (
                    <option value="">-- All Teachers Assigned --</option>
                  ) : (
                    <option value="">-- Choose a Teacher --</option>
                  )}
                  
                  {/* Only map through unassigned teachers */}
                  {availableTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialization})
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={assignTeacher}
                disabled={!teacherId}
              >
                Assign Teacher
              </button>
            </div>
          </div>

          {/* Assigned Teachers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4 pl-6 w-24">ID</th>
                  <th className="p-4">Teacher Name</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4 pr-6 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teachers.length > 0 ? (
                  teachers.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                      <td className="p-4 pl-6 text-sm text-gray-500">#{t.id}</td>
                      <td className="p-4 text-sm font-medium text-gray-900">{t.name}</td>
                      <td className="p-4 text-sm text-gray-600">
                        <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-medium border border-purple-100 inline-block">
                          {t.specialization || "General"}
                        </span>
                      </td>
                      <td className="p-4 pr-6 flex justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          className="text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                          onClick={() => unassignTeacher(t.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 text-sm">
                      No teachers are currently assigned to this subject.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        /* EMPTY STATE GRAPHIC */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">Awaiting Selection</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a class and a subject from the menus above to view or manage assignments.
          </p>
        </div>
      )}

    </div>
  );
}