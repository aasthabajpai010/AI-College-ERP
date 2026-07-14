// ============================================================
// NOTICES PAGE
// ============================================================
// Shows the full notice list (with AI-generated summaries) and,
// for Faculty/Admin, a form to post a new one. Uses useSocket to
// prepend newly-created notices to the list in real time, without
// needing a page refresh or re-fetch.

import { useState, useEffect, useContext, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { AuthContext } from "../context/AuthContext";
import { getAllNotices, createNotice } from "../services/noticeService";
import useSocket from "../hooks/useSocket";

const Notices = () => {
  const { user } = useContext(AuthContext);
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

  // useCallback keeps this function reference stable across re-renders —
  // useSocket's useEffect depends on this function, so without
  // useCallback, a new function reference on every render would cause
  // the socket to disconnect and reconnect constantly.
  const handleNewNotice = useCallback((notice) => {
    // Prepend the new notice to the top of the list — this is what
    // makes it appear INSTANTLY without waiting for a re-fetch.
    setNotices((prev) => [notice, ...prev]);
  }, []);

  useSocket(handleNewNotice);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setFormMessage("");
    try {
      await createNotice(formData.title, formData.content);
      setFormMessage("Notice posted successfully.");
      setFormData({ title: "", content: "" });
      // NOTE: we don't manually add it to the list here — the
      // Socket.IO event (handleNewNotice above) does that for us,
      // for EVERY connected client including the one who posted it.
    } catch (err) {
      setFormMessage(err.response?.data?.message || "Failed to post notice.");
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
        Notices
      </h1>

      {error && (
        <div className="bg-maroon/10 text-maroon p-4 rounded font-body border border-maroon/20 mb-6">
          {error}
        </div>
      )}

      {isFacultyOrAdmin && (
        <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 mb-8">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">
            Post a Notice
          </h2>
          <form onSubmit={handleCreateNotice} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full border border-ink/15 rounded px-3 py-2 font-body text-sm"
            />
            <textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={3}
              className="w-full border border-ink/15 rounded px-3 py-2 font-body text-sm"
            />
            <button
              type="submit"
              className="bg-maroon text-white px-4 py-2 rounded font-body text-sm hover:bg-maroon-dark transition-colors"
            >
              Post Notice
            </button>
          </form>
          {formMessage && (
            <p className="font-body text-sm text-ink/60 mt-3">{formMessage}</p>
          )}
        </div>
      )}

      {/* Notice list — newest first, since backend sorts this way
          and new real-time notices are prepended client-side too */}
      <div className="space-y-4">
        {notices.length === 0 ? (
          <p className="font-body text-sm text-ink/50">No notices yet.</p>
        ) : (
          notices.map((n) => (
            <div
              key={n._id}
              className="bg-white rounded-lg shadow-sm border border-ink/10 p-6"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display text-lg font-semibold text-ink">
                  {n.title}
                </h3>
                <span className="font-body text-xs text-ink/40">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* AI summary, shown as a highlighted callout if present */}
              {n.summary && (
                <div className="bg-role-student/10 border border-role-student/20 rounded px-3 py-2 mb-3">
                  <p className="font-body text-xs text-role-student font-medium mb-1">
                    AI Summary
                  </p>
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