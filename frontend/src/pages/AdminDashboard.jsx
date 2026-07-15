// ============================================================
// ADMIN DASHBOARD
// ============================================================
// College-wide summary — total students, departments, average
// attendance across everyone, and a grade distribution breakdown.
// Unlike StudentDashboard, this needs only ONE API call (no
// "resolve my own ID first" step, since Admin isn't looking up
// their own data — they're looking at everyone's aggregated data).

// ============================================================
// ADMIN DASHBOARD
// ============================================================
import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getAdminDashboard } from "../services/dashboardService";
import { Users, Building2, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Colors for the pie chart slices — pulled from our theme so charts
// don't introduce random colors that clash with the rest of the app.
const PIE_COLORS = ["#8C2F39", "#A8434E", "#6E2029", "#3D6B5C", "#2C5C8C"];

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
        {/* Skeleton loading state instead of plain text — three pulsing
            placeholder boxes that hint at the layout about to appear */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-ink/10 p-6 h-24 animate-pulse">
              <div className="h-3 bg-ink/10 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-ink/10 rounded w-1/3"></div>
            </div>
          ))}
        </div>
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

      {/* Stat cards now carry icons in a colored circle, and a subtle
          hover lift — this is what makes flat cards feel "alive". */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="w-12 h-12 rounded-full bg-role-admin/10 flex items-center justify-center shrink-0">
            <Users className="text-role-admin" size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-body text-sm text-ink/50">Total Students</p>
            <p className="font-display text-3xl font-semibold text-ink">
              {summary.totalStudents}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="w-12 h-12 rounded-full bg-role-admin/10 flex items-center justify-center shrink-0">
            <Building2 className="text-role-admin" size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-body text-sm text-ink/50">Departments</p>
            <p className="font-display text-3xl font-semibold text-ink">
              {summary.totalDepartments}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="w-12 h-12 rounded-full bg-role-admin/10 flex items-center justify-center shrink-0">
            <TrendingUp className="text-role-admin" size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-body text-sm text-ink/50">Avg. Attendance</p>
            <p className="font-display text-3xl font-semibold text-ink">
              {summary.averageAttendancePercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Two charts side by side, replacing the plain tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart: students per department */}
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">
            Students by Department
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={summary.departmentWiseCount}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B233310" />
              <XAxis
                dataKey="departmentName"
                tick={{ fontSize: 12, fontFamily: "Inter" }}
                stroke="#1B233340"
              />
              <YAxis tick={{ fontSize: 12, fontFamily: "Inter" }} stroke="#1B233340" allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontFamily: "Inter", fontSize: 13, borderRadius: 8, border: "1px solid #1B233320" }}
              />
              <Bar dataKey="count" fill="#8C2F39" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart: grade distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">
            Grade Distribution
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={summary.gradeDistribution}
                dataKey="count"
                nameKey="grade"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ grade, count }) => `${grade}: ${count}`}
              >
                {summary.gradeDistribution.map((entry, index) => (
                  <Cell key={entry.grade} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontFamily: "Inter", fontSize: 13, borderRadius: 8, border: "1px solid #1B233320" }}
              />
              <Legend wrapperStyle={{ fontFamily: "Inter", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;