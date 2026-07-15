// ============================================================
// STUDENTS PAGE (Admin only)
// ============================================================
// Lists all students (populated with user + department info) and
// provides a form to create a new student profile.

// ============================================================
// STUDENTS PAGE (Admin only)
// ============================================================
// Lists all students (populated with user + department info) and
// provides a form to create a new student profile.
//
// VISUAL POLISH: icon on section headers, skeleton loading table,
// friendlier empty state.

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getAllStudents, createStudent } from "../services/studentService";
import { UserPlus, Users } from "lucide-react";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      fetchStudents();
    } catch (err) {
      setFormMessage(err.response?.data?.message || "Failed to create student.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg border border-ink/10 p-6 h-56 animate-pulse mb-8"></div>
        <div className="bg-white rounded-lg border border-ink/10 p-6 h-40 animate-pulse"></div>
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

      <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="text-maroon" size={20} strokeWidth={1.75} />
          <h2 className="font-display text-lg font-semibold text-ink">Add Student</h2>
        </div>
        <form onSubmit={handleCreateStudent} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="User ID"
            value={formData.user}
            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
            required
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
          />
          <input
            type="text"
            placeholder="Department ID"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
          />
          <input
            type="text"
            placeholder="Roll Number"
            value={formData.rollNumber}
            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
            required
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
          />
          <input
            type="number"
            placeholder="Semester"
            min="1"
            max="8"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            required
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
          />
          <input
            type="text"
            placeholder="Section"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            required
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
          />
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="border border-ink/15 rounded px-3 py-2 font-body text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-maroon/40"
          />
          <button
            type="submit"
            className="bg-maroon text-white px-4 py-2 rounded font-body text-sm hover:bg-maroon-dark hover:scale-[1.02] transition-all col-span-2 md:col-span-4"
          >
            Create Student
          </button>
        </form>
        {formMessage && (
          <p className="font-body text-sm text-ink/60 mt-3">{formMessage}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-maroon" size={20} strokeWidth={1.75} />
          <h2 className="font-display text-lg font-semibold text-ink">
            All Students ({students.length})
          </h2>
        </div>
        {students.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-body text-sm text-ink/40">No students yet.</p>
          </div>
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
                <tr key={s._id} className="border-b border-ink/5 hover:bg-paper/50 transition-colors">
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