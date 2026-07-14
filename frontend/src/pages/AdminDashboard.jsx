// ============================================================
// ADMIN DASHBOARD
// ============================================================
// College-wide summary — total students, departments, average
// attendance across everyone, and a grade distribution breakdown.
// Unlike StudentDashboard, this needs only ONE API call (no
// "resolve my own ID first" step, since Admin isn't looking up
// their own data — they're looking at everyone's aggregated data).

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getAdminDashboard } from "../services/dashboardService";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getAdminDashboard();
        setSummary(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <p className="font-body text-ink/50">Loading dashboard...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-maroon/10 text-maroon p-4 rounded font-body border border-maroon/20">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        College Overview
      </h1>

      {/* Top row: 3 summary stat cards, same visual pattern as StudentDashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <p className="font-body text-sm text-ink/50 mb-1">Total Students</p>
          <p className="font-display text-3xl font-semibold text-role-admin">
            {summary.totalStudents}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <p className="font-body text-sm text-ink/50 mb-1">Total Departments</p>
          <p className="font-display text-3xl font-semibold text-role-admin">
            {summary.totalDepartments}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <p className="font-body text-sm text-ink/50 mb-1">Avg. Attendance</p>
          <p className="font-display text-3xl font-semibold text-role-admin">
            {summary.averageAttendancePercentage}%
          </p>
        </div>
      </div>

      {/* Department-wise breakdown table */}
      <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 mb-8">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">
          Students by Department
        </h2>
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-ink/50">
              <th className="pb-2">Department</th>
              <th className="pb-2">Students</th>
            </tr>
          </thead>
          <tbody>
            {summary.departmentWiseCount.map((dept) => (
              <tr key={dept.departmentName} className="border-b border-ink/5">
                <td className="py-2 text-ink">{dept.departmentName}</td>
                <td className="py-2 text-ink">{dept.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grade distribution table */}
      <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">
          Grade Distribution
        </h2>
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-ink/50">
              <th className="pb-2">Grade</th>
              <th className="pb-2">Count</th>
            </tr>
          </thead>
          <tbody>
            {summary.gradeDistribution.map((g) => (
              <tr key={g.grade} className="border-b border-ink/5">
                <td className="py-2 text-ink">{g.grade}</td>
                <td className="py-2 text-ink">{g.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;