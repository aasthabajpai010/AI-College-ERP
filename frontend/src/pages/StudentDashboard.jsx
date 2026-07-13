// ============================================================
// STUDENT DASHBOARD
// ============================================================
// The student's own landing page after login. Fetches data in TWO
// sequential steps:
// 1. getMyProfile() — find out which Student document belongs to
//    this logged-in user (we only have their User id from the JWT,
//    not their Student id, until this call resolves).
// 2. getStudentDashboard(studentId) — use that Student id to fetch
//    the actual attendance %, CGPA, and subject count.

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getMyProfile } from "../services/studentService";
import { getStudentDashboard } from "../services/dashboardService";

const StudentDashboard = () => {
  // Separate state for the summary data itself, loading state, and
  // any error message — this is the standard three-state pattern
  // for any component that fetches async data.
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect with an empty dependency array [] means "run this
  // once, right after the component first renders" — exactly what
  // we want for an initial data fetch.
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Step 1: resolve our own Student _id
        const profileData = await getMyProfile();
        const studentId = profileData.student._id;

        // Step 2: fetch the actual dashboard numbers using that ID
        const dashboardData = await getStudentDashboard(studentId);
        setSummary(dashboardData);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []); // empty array = run once on mount, not on every re-render

  // ------------------------------------------------------------
  // Render states: loading, error, or the actual data — only one
  // of these three ever shows at a time.
  // ------------------------------------------------------------
  if (loading) {
    return (
      <DashboardLayout>
        <p className="font-body text-ink/50">Loading your dashboard...</p>
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
        My Dashboard
      </h1>

      {/* grid with 3 equal columns on medium+ screens, stacking on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance card */}
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <p className="font-body text-sm text-ink/50 mb-1">Attendance</p>
          <p className="font-display text-3xl font-semibold text-role-student">
            {summary.attendancePercentage}%
          </p>
        </div>

        {/* CGPA card */}
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <p className="font-body text-sm text-ink/50 mb-1">CGPA</p>
          <p className="font-display text-3xl font-semibold text-role-student">
            {summary.cgpa}
          </p>
        </div>

        {/* Total subjects card */}
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <p className="font-body text-sm text-ink/50 mb-1">Subjects</p>
          <p className="font-display text-3xl font-semibold text-role-student">
            {summary.totalSubjects}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;