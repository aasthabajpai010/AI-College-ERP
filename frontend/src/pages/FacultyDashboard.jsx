// ============================================================
// FACULTY DASHBOARD
// ============================================================
// Faculty doesn't have a dedicated backend aggregation endpoint —
// their role is more action-oriented (marking attendance, entering
// results) than data-viewing. So this page reuses the admin
// dashboard endpoint for a quick college-wide snapshot, and adds
// prominent quick-action links to the tasks faculty actually do.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getAdminDashboard } from "../services/dashboardService";

const FacultyDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Faculty is authorized for this endpoint too (backend RBAC
        // allows "admin", "faculty" on /api/dashboard/admin) — we're
        // just reusing the same summary data here.
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
        Faculty Dashboard
      </h1>

      {/* Quick action cards — these are links, not just data display,
          since Faculty's main job here is DOING things (marking
          attendance, entering results) rather than just viewing. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/attendance"
          className="bg-role-faculty/10 border border-role-faculty/30 rounded-lg p-6 hover:bg-role-faculty/20 transition-colors"
        >
          <p className="font-display text-lg font-semibold text-role-faculty">
            Mark Attendance
          </p>
          <p className="font-body text-sm text-ink/50 mt-1">
            Record today's attendance for your students
          </p>
        </Link>

        <Link
          to="/results"
          className="bg-role-faculty/10 border border-role-faculty/30 rounded-lg p-6 hover:bg-role-faculty/20 transition-colors"
        >
          <p className="font-display text-lg font-semibold text-role-faculty">
            Enter Results
          </p>
          <p className="font-body text-sm text-ink/50 mt-1">
            Add marks and generate grades for a subject
          </p>
        </Link>
      </div>

      {/* Same college-wide snapshot cards as Admin sees, giving
          Faculty useful context without full admin controls. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <p className="font-body text-sm text-ink/50 mb-1">Total Students</p>
          <p className="font-display text-3xl font-semibold text-role-faculty">
            {summary.totalStudents}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <p className="font-body text-sm text-ink/50 mb-1">Avg. Attendance</p>
          <p className="font-display text-3xl font-semibold text-role-faculty">
            {summary.averageAttendancePercentage}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <p className="font-body text-sm text-ink/50 mb-1">Departments</p>
          <p className="font-display text-3xl font-semibold text-role-faculty">
            {summary.totalDepartments}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;