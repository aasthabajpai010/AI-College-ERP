// ============================================================
// ATTENDANCE PAGE
// ============================================================
// Shows different content depending on role:
// - Faculty/Admin: a form to mark attendance + the defaulter list
// - Student: their own attendance history + percentage, read-only
//
// This is a common React pattern — one page component, but its
// rendered output branches based on user.role, instead of building
// two entirely separate page components for what's largely the
// same layout.

import { useState, useEffect, useContext } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import { getMyProfile } from "../services/studentService";
import {
  markAttendance,
  getStudentAttendance,
  getAttendancePercentage,
  getDefaulterList,
} from "../services/attendanceService";

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const isFacultyOrAdmin = user.role === "admin" || user.role === "faculty";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Student-specific state
  const [myRecords, setMyRecords] = useState([]);
  const [myPercentage, setMyPercentage] = useState(null);

  // Faculty/Admin-specific state
  const [defaulters, setDefaulters] = useState([]);
  const [formData, setFormData] = useState({ student: "", date: "", status: "present" });
  const [formMessage, setFormMessage] = useState("");

  
useEffect(() => {
  const fetchData = async () => {
    try {
      if (isFacultyOrAdmin) {
        const data = await getDefaulterList();
        setDefaulters(data.defaulters);
      } else {
        const profile = await getMyProfile();
        const studentId = profile.student._id;

        const [records, percentageData] = await Promise.all([
          getStudentAttendance(studentId),
          getAttendancePercentage(studentId),
        ]);

        setMyRecords(records.attendance);
        setMyPercentage(percentageData);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [isFacultyOrAdmin]);
  // ------------------------------------------------------------
  // handleMarkAttendance — Faculty/Admin only, submits the form
  // ------------------------------------------------------------
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setFormMessage("");
    try {
      await markAttendance(formData.student, formData.date, formData.status);
      setFormMessage("Attendance marked successfully.");
      setFormData({ student: "", date: "", status: "present" });
    } catch (err) {
      setFormMessage(err.response?.data?.message || "Failed to mark attendance.");
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
        Attendance
      </h1>

      {error && (
        <div className="bg-maroon/10 text-maroon p-4 rounded font-body border border-maroon/20 mb-6">
          {error}
        </div>
      )}

      {/* ---------------- FACULTY / ADMIN VIEW ---------------- */}
      {isFacultyOrAdmin && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 mb-8">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              Mark Attendance
            </h2>
            <form onSubmit={handleMarkAttendance} className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-body text-ink/60 mb-1">Student ID</label>
                <input
                  type="text"
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  required
                  className="border border-ink/15 rounded px-3 py-2 font-body text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-body text-ink/60 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="border border-ink/15 rounded px-3 py-2 font-body text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-body text-ink/60 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="border border-ink/15 rounded px-3 py-2 font-body text-sm"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-maroon text-white px-4 py-2 rounded font-body text-sm hover:bg-maroon-dark transition-colors"
              >
                Mark
              </button>
            </form>
            {formMessage && (
              <p className="font-body text-sm text-ink/60 mt-3">{formMessage}</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              Defaulter List (below 75%)
            </h2>
            {defaulters.length === 0 ? (
              <p className="font-body text-sm text-ink/50">No defaulters found.</p>
            ) : (
              <table className="w-full text-left font-body text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-ink/50">
                    <th className="pb-2">Roll Number</th>
                    <th className="pb-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {defaulters.map((d) => (
                    <tr key={d._id || d.rollNumber} className="border-b border-ink/5">
                      <td className="py-2 text-ink">{d.rollNumber}</td>
                      <td className="py-2 text-maroon font-medium">{d.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ---------------- STUDENT VIEW ---------------- */}
      {!isFacultyOrAdmin && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 mb-8">
            <p className="font-body text-sm text-ink/50 mb-1">Overall Attendance</p>
            <p className="font-display text-4xl font-semibold text-role-student">
              {myPercentage?.percentage}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">
              History
            </h2>
            {myRecords.length === 0 ? (
              <p className="font-body text-sm text-ink/50">No records yet.</p>
            ) : (
              <table className="w-full text-left font-body text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-ink/50">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myRecords.map((r) => (
                    <tr key={r._id} className="border-b border-ink/5">
                      <td className="py-2 text-ink">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className={`py-2 font-medium capitalize ${
                        r.status === "present" ? "text-role-faculty" : "text-maroon"
                      }`}>
                        {r.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Attendance;