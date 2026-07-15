// ============================================================
// RESULTS PAGE
// ============================================================
// Same role-branching pattern as Attendance.jsx:
// - Faculty/Admin: a form to add marks for a subject
// - Student: their own results list + CGPA, read-only

// ============================================================
// RESULTS PAGE
// ============================================================
// Same role-branching pattern as Attendance.jsx:
// - Faculty/Admin: a form to add marks for a subject
// - Student: their own results list + CGPA, read-only
//
// VISUAL POLISH: icon-in-circle CGPA card, icons on section headers,
// skeleton loading, and friendlier empty states.

import { useState, useEffect, useContext } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import { getMyProfile } from "../services/studentService";
import { addResult, getStudentResults, getCGPA } from "../services/resultService";
import { Award, PlusCircle, BookOpen } from "lucide-react";

const Results = () => {
  const { user } = useContext(AuthContext);
  const isFacultyOrAdmin = user.role === "admin" || user.role === "faculty";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [myResults, setMyResults] = useState([]);
  const [myCgpa, setMyCgpa] = useState(null);

  const [formData, setFormData] = useState({
    student: "",
    subject: "",
    semester: "",
    marksObtained: "",
    maxMarks: "100",
  });
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (isFacultyOrAdmin) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getMyProfile();
        const studentId = profile.student._id;

        const [results, cgpaData] = await Promise.all([
          getStudentResults(studentId),
          getCGPA(studentId),
        ]);

        setMyResults(results.results);
        setMyCgpa(cgpaData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load results data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isFacultyOrAdmin]);

  const handleAddResult = async (e) => {
    e.preventDefault();
    setFormMessage("");
    try {
      await addResult(
        formData.student,
        formData.subject,
        Number(formData.semester),
        Number(formData.marksObtained),
        Number(formData.maxMarks)
      );
      setFormMessage("Result added successfully.");
      setFormData({ student: "", subject: "", semester: "", marksObtained: "", maxMarks: "100" });
    } catch (err) {
      setFormMessage(err.response?.data?.message || "Failed to add result.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg border border-ink/10 p-6 h-48 animate-pulse"></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Results
      </h1>

      {error && (
        <div className="bg-maroon/10 text-maroon p-4 rounded font-body border border-maroon/20 mb-6">
          {error}
        </div>
      )}

      {isFacultyOrAdmin && (
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="text-maroon" size={20} strokeWidth={1.75} />
            <h2 className="font-display text-lg font-semibold text-ink">Add Result</h2>
          </div>
          <form onSubmit={handleAddResult} className="flex flex-wrap gap-4 items-end">
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
              <label className="block text-sm font-body text-ink/60 mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
              />
            </div>
            <div>
              <label className="block text-sm font-body text-ink/60 mb-1">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                required
                className="border border-ink/15 rounded px-3 py-2 font-body text-sm w-20 focus:outline-none focus:ring-2 focus:ring-maroon/40"
              />
            </div>
            <div>
              <label className="block text-sm font-body text-ink/60 mb-1">Marks Obtained</label>
              <input
                type="number"
                min="0"
                value={formData.marksObtained}
                onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                required
                className="border border-ink/15 rounded px-3 py-2 font-body text-sm w-24 focus:outline-none focus:ring-2 focus:ring-maroon/40"
              />
            </div>
            <div>
              <label className="block text-sm font-body text-ink/60 mb-1">Max Marks</label>
              <input
                type="number"
                min="1"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                required
                className="border border-ink/15 rounded px-3 py-2 font-body text-sm w-24 focus:outline-none focus:ring-2 focus:ring-maroon/40"
              />
            </div>
            <button
              type="submit"
              className="bg-maroon text-white px-4 py-2 rounded font-body text-sm hover:bg-maroon-dark hover:scale-[1.02] transition-all"
            >
              Add
            </button>
          </form>
          {formMessage && (
            <p className="font-body text-sm text-ink/60 mt-3">{formMessage}</p>
          )}
        </div>
      )}

      {!isFacultyOrAdmin && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 mb-8 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-role-student/10 flex items-center justify-center shrink-0">
              <Award className="text-role-student" size={26} strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-body text-sm text-ink/50">CGPA</p>
              <p className="font-display text-4xl font-semibold text-role-student">
                {myCgpa?.cgpa}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-role-student" size={20} strokeWidth={1.75} />
              <h2 className="font-display text-lg font-semibold text-ink">
                Subject-wise Marks
              </h2>
            </div>
            {myResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-body text-sm text-ink/40">No results yet.</p>
              </div>
            ) : (
              <table className="w-full text-left font-body text-sm">
                <thead>
                  <tr className="border-b border-ink/10 text-ink/50">
                    <th className="pb-2">Subject</th>
                    <th className="pb-2">Marks</th>
                    <th className="pb-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {myResults.map((r) => (
                    <tr key={r._id} className="border-b border-ink/5">
                      <td className="py-2 text-ink">{r.subject}</td>
                      <td className="py-2 text-ink">
                        {r.marksObtained}/{r.maxMarks}
                      </td>
                      <td className="py-2 text-maroon font-medium">{r.grade}</td>
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

export default Results;