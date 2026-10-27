import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const emptyForm = { title: "", description: "", dueDate: "", maxMarks: 100 };

export default function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setAssignments(await api("/assignments"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onCreate = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/assignments", {
        method: "POST",
        body: { ...form, maxMarks: Number(form.maxMarks) },
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this assignment and all its submissions?")) return;
    try {
      await api(`/assignments/${id}`, { method: "DELETE" });
      setAssignments((list) => list.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1>Teacher dashboard</h1>
      {error && <p className="alert">{error}</p>}

      <form className="card" onSubmit={onCreate}>
        <h2>New assignment</h2>
        <label>
          Title
          <input name="title" value={form.title} onChange={onChange} required maxLength={120} />
        </label>
        <label>
          Description
          <textarea name="description" rows={3} value={form.description} onChange={onChange} maxLength={2000} />
        </label>
        <div className="row">
          <label>
            Due date
            <input name="dueDate" type="datetime-local" value={form.dueDate} onChange={onChange} required />
          </label>
          <label>
            Max marks
            <input name="maxMarks" type="number" min={1} max={1000} value={form.maxMarks} onChange={onChange} required />
          </label>
        </div>
        <button className="btn" disabled={busy}>
          {busy ? "Creating..." : "Create assignment"}
        </button>
      </form>

      <h2>Your assignments</h2>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : assignments.length === 0 ? (
        <p className="muted">No assignments yet. Create your first one above.</p>
      ) : (
        <div className="list">
          {assignments.map((a) => (
            <div className="card item" key={a._id}>
              <div>
                <h3>{a.title}</h3>
                <p className="muted">
                  Due {new Date(a.dueDate).toLocaleString()} &middot; {a.maxMarks} marks
                </p>
                <p>
                  {a.submissionCount} submitted, {a.gradedCount} graded
                </p>
              </div>
              <div className="actions">
                <Link className="btn" to={`/teacher/assignments/${a._id}`}>
                  View &amp; grade
                </Link>
                <button className="btn btn-danger" onClick={() => onDelete(a._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
