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
//
// VISUAL POLISH ADDED IN THIS VERSION:
// - Skeleton loading state (pulsing gray boxes) instead of plain
//   "Loading..." text — this is what most polished dashboards show
//   while data is in flight, since it hints at the layout that's
//   about to appear rather than leaving a blank screen.
// - Icon-in-circle treatment on each stat card, using lucide-react
//   icons tinted with our role-student theme color.
// - A subtle hover lift (shadow + slight upward translate) on each
//   card, which is a small detail that makes a static page feel
//   more "alive" and responsive to the user's cursor.

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getMyProfile } from "../services/studentService";
import { getStudentDashboard } from "../services/dashboardService";
import { CalendarCheck, Award, BookOpen } from "lucide-react";

const StudentDashboard = () => {
  // Three-state pattern: the actual summary data, a loading flag,
  // and an error message — exactly one of these three drives what
  // gets rendered at any given moment.
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Empty dependency array [] means this effect runs exactly once,
  // right after the component first mounts — perfect for an initial
  // data fetch that shouldn't re-run on every re-render.
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Step 1: resolve our own Student _id via the ownership-based
        // /students/me endpoint (the JWT only tells us our User id).
        const profileData = await getMyProfile();
        const studentId = profileData.student._id;

        // Step 2: now that we have our Student _id, fetch the actual
        // dashboard numbers (attendance %, CGPA, subject count).
        const dashboardData = await getStudentDashboard(studentId);
        setSummary(dashboardData);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        // finally runs whether the try succeeded or the catch fired —
        // guarantees the loading spinner/skeleton always goes away.
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ------------------------------------------------------------
  // LOADING STATE — skeleton placeholders
  // ------------------------------------------------------------
  // Three gray boxes shaped like the real stat cards below, with
  // Tailwind's built-in `animate-pulse` class giving them a soft
  // fade in/out effect. This is purely cosmetic — it doesn't fetch
  // or compute anything — but it signals "content is coming" far
  // better than a plain loading sentence does.
  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-ink/10 p-6 h-24 animate-pulse"
            >
              <div className="h-3 bg-ink/10 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-ink/10 rounded w-1/3"></div>
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
  // Build the card data as an array we can .map() over, instead of
  // writing three nearly-identical JSX blocks by hand. Each entry
  // pairs a label + value with the lucide-react icon component to
  // render for that specific stat.
  // ------------------------------------------------------------
  const cards = [
    { label: "Attendance", value: `${summary.attendancePercentage}%`, icon: CalendarCheck },
    { label: "CGPA", value: summary.cgpa, icon: Award },
    { label: "Subjects", value: summary.totalSubjects, icon: BookOpen },
  ];

  // ------------------------------------------------------------
  // MAIN RENDER — actual dashboard content
  // ------------------------------------------------------------
  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        My Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ label, value, icon: Icon }) => (
          // Destructuring "icon" as "Icon" (capitalized) here is
          // required — JSX only treats a tag as a component if its
          // name starts with a capital letter; <icon /> would be
          // parsed as a literal HTML tag instead of our component.
          <div
            key={label}
            className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            {/* Icon in a soft-tinted circle — the circle's background
                uses our role-student color at 10% opacity, and the
                icon itself is the full-strength color, giving a
                gentle "badge" look rather than a harsh icon on white. */}
            <div className="w-12 h-12 rounded-full bg-role-student/10 flex items-center justify-center shrink-0">
              <Icon className="text-role-student" size={22} strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-body text-sm text-ink/50">{label}</p>
              <p className="font-display text-3xl font-semibold text-ink">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;