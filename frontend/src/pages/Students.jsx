// ============================================================
// STUDENTS PAGE (Admin only)
// ============================================================
// Lists all students (populated with user + department info) and
// provides a form to create a new student profile.

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getAllStudents, createStudent } from "../services/studentService";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    user: "",
    department: "",
    rollNumber: "",
    semester: "",
    section: "",
    phone: "",
    address: "",
  });
  const [formMessage, setFormMessage] = useState("");

  // Extracted into its own function (not just inline in useEffect)
  // so we can call it AGAIN after successfully creating a student —
  // this refreshes the table without needing a full page reload.
  const fetchStudents = async () => {
    try {
      const data = await getAllStudents();
      setStudents(data.students);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setFormMessage("");
    try {
      await createStudent({
        ...formData,
        semester: Number(formData.semester),
      });
      setFormMessage("Student created successfully.");
      setFormData({
        user: "",
        department: "",
        rollNumber: "",
        semester: "",
        section: "",
        phone: "",
        address: "",
      });
      fetchStudents(); // re-fetch so the new student shows up immediately
    } catch (err) {
      setFormMessage(err.response?.data?.message || "Failed to create student.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="font-body text-ink/50">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Students
      </h1>

      {error && (
        <div className="bg-maroon/10 text-maroon p-4 rounded font-body border border-maroon/20 mb-6">
          {error}
        </div>
      )}

      {/* Create form */}
      <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 mb-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">
          Add Student
        </h2>
        <form onSubmit={handleCreateStudent} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="User ID"
            value={formData.user}
            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
            required
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm"
          />
          <input
            type="text"
            placeholder="Department ID"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm"
          />
          <input
            type="text"
            placeholder="Roll Number"
            value={formData.rollNumber}
            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
            required
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm"
          />
          <input
            type="number"
            placeholder="Semester"
            min="1"
            max="8"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            required
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm"
          />
          <input
            type="text"
            placeholder="Section"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            required
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm"
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm"
          />
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm col-span-2"
          />
          <button
            type="submit"
            className="bg-maroon text-white px-4 py-2 rounded font-body text-sm hover:bg-maroon-dark transition-colors col-span-2 md:col-span-4"
          >
            Create Student
          </button>
        </form>
        {formMessage && (
          <p className="font-body text-sm text-ink/60 mt-3">{formMessage}</p>
        )}
      </div>

      {/* Students table */}
      <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">
          All Students ({students.length})
        </h2>
        {students.length === 0 ? (
          <p className="font-body text-sm text-ink/50">No students yet.</p>
        ) : (
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-ink/50">
                <th className="pb-2">Roll Number</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Department</th>
                <th className="pb-2">Semester</th>
                <th className="pb-2">Section</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b border-ink/5">
                  <td className="py-2 text-ink">{s.rollNumber}</td>
                  <td className="py-2 text-ink">{s.user?.name}</td>
                  <td className="py-2 text-ink">{s.department?.name}</td>
                  <td className="py-2 text-ink">{s.semester}</td>
                  <td className="py-2 text-ink">{s.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Students;