// ============================================================
// DEPARTMENTS PAGE (Admin only)
// ============================================================
// Lists all departments and provides a form to create a new one,
// plus a delete action per row. Follows the exact same pattern as
// Students.jsx — fetch on mount, re-fetch after any mutation.

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getAllDepartments, createDepartment, deleteDepartment } from "../services/departmentService";
import { Building2, PlusCircle, Trash2 } from "lucide-react";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ name: "", code: "" });
  const [formMessage, setFormMessage] = useState("");

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data.departments);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormMessage("");
    try {
      await createDepartment(formData.name, formData.code);
      setFormMessage("Department created successfully.");
      setFormData({ name: "", code: "" });
      fetchDepartments();
    } catch (err) {
      setFormMessage(err.response?.data?.message || "Failed to create department.");
    }
  };

  // Delete asks for confirmation first — a destructive action like
  // this should never fire from a single accidental click.
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department? This cannot be undone.")) return;
    try {
      await deleteDepartment(id);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete department.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg border border-ink/10 p-6 h-40 animate-pulse mb-8"></div>
        <div className="bg-white rounded-lg border border-ink/10 p-6 h-40 animate-pulse"></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">
        Departments
      </h1>

      {error && (
        <div className="bg-maroon/10 text-maroon p-4 rounded font-body border border-maroon/20 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <PlusCircle className="text-maroon" size={20} strokeWidth={1.75} />
          <h2 className="font-display text-lg font-semibold text-ink">Add Department</h2>
        </div>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-body text-ink/60 mb-1">Name</label>
            <input
              type="text"
              placeholder="Computer Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
            />
          </div>
          <div>
            <label className="block text-sm font-body text-ink/60 mb-1">Code</label>
            <input
              type="text"
              placeholder="CSE"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              className="border border-ink/15 rounded px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-maroon/40"
            />
          </div>
          <button
            type="submit"
            className="bg-maroon text-white px-4 py-2 rounded font-body text-sm hover:bg-maroon-dark hover:scale-[1.02] transition-all"
          >
            Create
          </button>
        </form>
        {formMessage && (
          <p className="font-body text-sm text-ink/60 mt-3">{formMessage}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-ink/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="text-maroon" size={20} strokeWidth={1.75} />
          <h2 className="font-display text-lg font-semibold text-ink">
            All Departments ({departments.length})
          </h2>
        </div>
        {departments.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-body text-sm text-ink/40">No departments yet.</p>
          </div>
        ) : (
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-ink/50">
                <th className="pb-2">Name</th>
                <th className="pb-2">Code</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d._id} className="border-b border-ink/5 hover:bg-paper/50 transition-colors">
                  <td className="py-2 text-ink">{d.name}</td>
                  <td className="py-2 text-ink">{d.code}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDelete(d._id)}
                      className="text-maroon/60 hover:text-maroon transition-colors"
                    >
                      <Trash2 size={16} strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Departments;