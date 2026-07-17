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

// ============================================================
// ATTENDANCE PAGE
// ============================================================
// Shows different content depending on role:
// - Faculty/Admin: a form to mark attendance + the defaulter list
// - Student: their own attendance history + percentage, read-only
//
// VISUAL POLISH: icon-in-circle stat card for the student's overall
// percentage, icons on section headers, skeleton loading, and a
// friendlier empty state for the history table.

// ============================================================
// ATTENDANCE PAGE
// ============================================================
// Shows different content depending on role:
// - Faculty/Admin: a form to mark attendance + the defaulter list
// - Student: their own attendance history + percentage, read-only,
//   with a donut chart visualizing Present vs Absent split.

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
import { CalendarCheck, AlertTriangle, ClipboardList } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const isFacultyOrAdmin = user.role === "admin" || user.role === "faculty";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myRecords, setMyRecords] = useState([]);
  const [myPercentage, setMyPercentage] = useState(null);

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
        <div className="bg-white rounded-lg border border-ink/10 p-6 h-32 animate-pulse mb-6">
          <div className="h-4 bg-ink/10 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-ink/10 rounded w-2/3"></div>
        </div>
        <div className="bg-white rounded-lg border border-ink/10 p-6 h-48 animate-pulse"></div>
      </DashboardLayout>
    );
  }

  // Build chart data from the raw percentage numbers — derive present
  // and absent COUNTS (not just the percentage) since a donut chart
  // needs two comparable slice values, not a single percentage figure.
  const chartData = myPercentage
    ? [
        { name: "Present", value: myPercentage.present },
        { name: "Absent", value: myPercentage.totalClasses - myPercentage.present },
      ]
    : [];

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

      {isFacultyOrAdmin && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheck className="text-maroon" size={20} strokeWidth={1.75} />
              <h2 className="font-display text-lg font-semibold text-ink">
                Mark Attendance
              </h2>
            </div>
            <form onSubmit={handleMarkAttendance} className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-body text-ink/60 mb-1">Student ID</label>
                <input
                  type="text"
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  required
                  className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
                />
              </div>
              <div>
                <label className="block text-sm font-body text-ink/60 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
                />
              </div>
              <div>
                <label className="block text-sm font-body text-ink/60 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-maroon text-white px-4 py-2 rounded font-body text-sm hover:bg-maroon-dark hover:scale-[1.02] transition-all"
              >
                Mark
              </button>
            </form>
            {formMessage && (
              <p className="font-body text-sm text-ink/60 mt-3">{formMessage}</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-maroon" size={20} strokeWidth={1.75} />
              <h2 className="font-display text-lg font-semibold text-ink">
                Defaulter List (below 75%)
              </h2>
            </div>
            {defaulters.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-body text-sm text-ink/40">
                  No defaulters — everyone's attendance is on track.
                </p>
              </div>
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

      {!isFacultyOrAdmin && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Stat card */}
            <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-role-student/10 flex items-center justify-center shrink-0">
                <CalendarCheck className="text-role-student" size={26} strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-body text-sm text-ink/50">Overall Attendance</p>
                <p className="font-display text-4xl font-semibold text-role-student">
                  {myPercentage?.percentage}%
                </p>
              </div>
            </div>

            {/* Donut chart: Present vs Absent, giving a visual sense of
                the split rather than a single number alone */}
            <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
              <p className="font-body text-sm text-ink/50 mb-2">Present vs Absent</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    <Cell fill="#3D6B5C" />
                    <Cell fill="#8C2F39" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontFamily: "Inter", fontSize: 13, borderRadius: 8, border: "1px solid #1B233320" }}
                  />
                  <Legend wrapperStyle={{ fontFamily: "Inter", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="text-role-student" size={20} strokeWidth={1.75} />
              <h2 className="font-display text-lg font-semibold text-ink">History</h2>
            </div>
            {myRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-body text-sm text-ink/40">No records yet.</p>
              </div>
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
                      <td
                        className={`py-2 font-medium capitalize ${
                          r.status === "present" ? "text-role-faculty" : "text-maroon"
                        }`}
                      >
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