// ============================================================
// NOTICES PAGE
// ============================================================
// Shows the full notice list (with AI-generated summaries) and,
// for Faculty/Admin, a form to post a new one. Uses useSocket to
// prepend newly-created notices to the list in real time, without
// needing a page refresh or re-fetch.

// ============================================================
// NOTICES PAGE
// ============================================================
// Shows the full notice list (with AI-generated summaries) and,
// for Faculty/Admin, a form to post a new one. Real-time updates
// now come from NotificationContext (set up globally in App.jsx)
// instead of this page opening its own separate socket connection —
// this way the SAME real-time data also powers the Navbar's bell
// icon, no matter which page the user is on.

// ============================================================
// NOTICES PAGE
// ============================================================
// Shows the full notice list (with AI-generated summaries) and,
// for Faculty/Admin, a form to post a new one. Real-time updates
// come from NotificationContext (set up globally in App.jsx) so
// this page stays in sync with the Navbar's bell icon.
//
// VISUAL POLISH: icons on section headers, skeleton loading cards,
// a distinct "AI Summary" badge styling, and a friendlier empty state.

import { useState, useEffect, useContext } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import { NotificationContext } from "../context/NotificationContext";
import { getAllNotices, createNotice } from "../services/noticeService";
import { Megaphone, Sparkles, Bell } from "lucide-react";

const Notices = () => {
  const { user } = useContext(AuthContext);
  const { notifications } = useContext(NotificationContext);
  const isFacultyOrAdmin = user.role === "admin" || user.role === "faculty";

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ title: "", content: "" });
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await getAllNotices();
        setNotices(data.notices);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load notices");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      setNotices((prev) => {
        const newOnes = notifications.filter(
          (n) => !prev.some((p) => p._id === n._id)
        );
        return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
      });
    }
  }, [notifications]);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setFormMessage("");
    try {
      await createNotice(formData.title, formData.content);
      setFormMessage("Notice posted successfully.");
      setFormData({ title: "", content: "" });
    } catch (err) {
      setFormMessage(err.response?.data?.message || "Failed to post notice.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-ink/10 p-6 h-28 animate-pulse"
            >
              <div className="h-4 bg-ink/10 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-ink/10 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Notices
      </h1>

      {error && (
        <div className="bg-maroon/10 text-maroon p-4 rounded font-body border border-maroon/20 mb-6">
          {error}
        </div>
      )}

      {isFacultyOrAdmin && (
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="text-maroon" size={20} strokeWidth={1.75} />
            <h2 className="font-display text-lg font-semibold text-ink">
              Post a Notice
            </h2>
          </div>
          <form onSubmit={handleCreateNotice} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
            />
            <textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={3}
              className="w-full border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
            />
            <button
              type="submit"
              className="bg-maroon text-white px-4 py-2 rounded font-body text-sm hover:bg-maroon-dark hover:scale-[1.02] transition-all"
            >
              Post Notice
            </button>
          </form>
          {formMessage && (
            <p className="font-body text-sm text-ink/60 mt-3">{formMessage}</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="bg-white rounded-lg border border-ink/10 p-10 text-center">
            <Bell className="text-ink/20 mx-auto mb-3" size={32} strokeWidth={1.5} />
            <p className="font-body text-sm text-ink/40">No notices yet.</p>
          </div>
        ) : (
          notices.map((n) => (
            <div
              key={n._id}
              className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display text-lg font-semibold text-ink">
                  {n.title}
                </h3>
                <span className="font-body text-xs text-ink/40 shrink-0 ml-4">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>

              {n.summary && (
                <div className="bg-role-student/10 border border-role-student/20 rounded px-3 py-2 mb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="text-role-student" size={13} strokeWidth={2} />
                    <p className="font-body text-xs text-role-student font-medium">
                      AI Summary
                    </p>
                  </div>
                  <p className="font-body text-sm text-ink/80">{n.summary}</p>
                </div>
              )}

              <p className="font-body text-sm text-ink/60">{n.content}</p>
              <p className="font-body text-xs text-ink/40 mt-3">
                Posted by {n.postedBy?.name} ({n.postedBy?.role})
              </p>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notices;