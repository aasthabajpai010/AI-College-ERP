// ============================================================
// FACULTY DASHBOARD
// ============================================================
// Faculty doesn't have a dedicated backend aggregation endpoint —
// their role is more action-oriented (marking attendance, entering
// results) than data-viewing. So this page reuses the admin
// dashboard endpoint for a quick college-wide snapshot, and adds
// prominent quick-action links to the tasks faculty actually do.

// ============================================================
// FACULTY DASHBOARD
// ============================================================
// Faculty has no dedicated backend aggregation endpoint (their role
// is action-oriented — marking attendance, entering results — not
// data-viewing), so this page reuses the admin summary endpoint for
// a quick college-wide snapshot, and leads with two large clickable
// "action tiles" pointing to the tasks Faculty actually perform.
//
// VISUAL POLISH ADDED IN THIS VERSION:
// - Skeleton loading placeholders (see StudentDashboard.jsx for the
//   same pattern explained in detail).
// - Icons on both the action tiles and the stat cards below them.
// - Hover lift on every interactive card, consistent with the other
//   two dashboards, so all three roles feel like the same product.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getAdminDashboard } from "../services/dashboardService";
import {
  ClipboardCheck,
  GraduationCap,
  Users,
  TrendingUp,
  Building2,
} from "lucide-react";

const FacultyDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Faculty is authorized on this endpoint too (backend RBAC
        // allows both "admin" and "faculty" on /api/dashboard/admin) —
        // we're intentionally reusing the same aggregation rather than
        // building a separate faculty-only endpoint for this snapshot.
        const data = await getAdminDashboard();
        setSummary(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ------------------------------------------------------------
  // LOADING STATE — skeleton placeholders
  // ------------------------------------------------------------
  // Two wider boxes here (not three) since this loading state stands
  // in for the two action tiles that render first on this page —
  // matching the skeleton's shape to the real content keeps the
  // transition from loading → loaded feeling seamless.
  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-ink/10 p-6 h-24 animate-pulse"
            >
              <div className="h-4 bg-ink/10 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-ink/10 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  // ------------------------------------------------------------
  // ERROR STATE
  // ------------------------------------------------------------
  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-maroon/10 text-maroon p-4 rounded font-body border border-maroon/20">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  // ------------------------------------------------------------
  // MAIN RENDER
  // ------------------------------------------------------------
  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Faculty Dashboard
      </h1>

      {/* ------------------------------------------------------
          QUICK ACTION TILES
          These are <Link> elements, not just data cards — Faculty's
          main job on this page is DOING something (marking
          attendance, entering results), not just viewing numbers,
          so these are styled and sized to read as clearly clickable.
      ------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/attendance"
          className="bg-role-faculty/10 border border-role-faculty/30 rounded-lg p-6 hover:bg-role-faculty/20 hover:-translate-y-0.5 transition-all flex items-start gap-4"
        >
          <div className="w-11 h-11 rounded-full bg-role-faculty/20 flex items-center justify-center shrink-0">
            <ClipboardCheck className="text-role-faculty" size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-role-faculty">
              Mark Attendance
            </p>
            <p className="font-body text-sm text-ink/50 mt-1">
              Record today's attendance for your students
            </p>
          </div>
        </Link>

        <Link
          to="/results"
          className="bg-role-faculty/10 border border-role-faculty/30 rounded-lg p-6 hover:bg-role-faculty/20 hover:-translate-y-0.5 transition-all flex items-start gap-4"
        >
          <div className="w-11 h-11 rounded-full bg-role-faculty/20 flex items-center justify-center shrink-0">
            <GraduationCap className="text-role-faculty" size={20} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-role-faculty">
              Enter Results
            </p>
            <p className="font-body text-sm text-ink/50 mt-1">
              Add marks and generate grades for a subject
            </p>
          </div>
        </Link>
      </div>

      {/* ------------------------------------------------------
          COLLEGE-WIDE SNAPSHOT
          Same three-stat-card pattern as the other two dashboards,
          reusing the summary data fetched from the admin endpoint,
          tinted with role-faculty (deep green) instead of maroon or
          blue, so the color alone signals "this is Faculty's view".
      ------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="w-12 h-12 rounded-full bg-role-faculty/10 flex items-center justify-center shrink-0">
            <Users className="text-role-faculty" size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-body text-sm text-ink/50">Total Students</p>
            <p className="font-display text-3xl font-semibold text-ink">
              {summary.totalStudents}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="w-12 h-12 rounded-full bg-role-faculty/10 flex items-center justify-center shrink-0">
            <TrendingUp className="text-role-faculty" size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-body text-sm text-ink/50">Avg. Attendance</p>
            <p className="font-display text-3xl font-semibold text-ink">
              {summary.averageAttendancePercentage}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="w-12 h-12 rounded-full bg-role-faculty/10 flex items-center justify-center shrink-0">
            <Building2 className="text-role-faculty" size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-body text-sm text-ink/50">Departments</p>
            <p className="font-display text-3xl font-semibold text-ink">
              {summary.totalDepartments}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;