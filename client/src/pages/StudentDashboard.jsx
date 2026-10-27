import { useEffect, useState } from "react";
import { api } from "../api";

function SubmitForm({ assignment, onDone }) {
  const sub = assignment.submission;
  const [answer, setAnswer] = useState(sub?.answer || "");
  const [link, setLink] = useState(sub?.link || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/submissions", {
        method: "POST",
        body: { assignmentId: assignment._id, answer, link },
      });
      await onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <p className="alert">{error}</p>}
      <label>
        Your answer
        <textarea rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={10000} />
      </label>
      <label>
        Link to your work (GitHub, Google Drive, etc.) - optional
        <input type="url" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? "Submitting..." : sub ? "Resubmit" : "Submit"}
      </button>
    </form>
  );
}

function Status({ assignment }) {
  const sub = assignment.submission;
  if (!sub) return <span className="badge badge-warn">Not submitted</span>;
  if (sub.marks !== null && sub.marks !== undefined) {
    return (
      <span className="badge badge-ok">
        {sub.marks}/{assignment.maxMarks}
      </span>
    );
  }
  return <span className="badge">Submitted - awaiting grade</span>;
}

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const load = async () => {
    try {
      setAssignments(await api("/assignments"));
      setOpenId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <h1>My assignments</h1>
      {error && <p className="alert">{error}</p>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : assignments.length === 0 ? (
        <p className="muted">No assignments have been posted yet.</p>
      ) : (
        <div className="list">
          {assignments.map((a) => {
            const sub = a.submission;
            const graded = sub && sub.marks !== null && sub.marks !== undefined;
            const overdue = new Date() > new Date(a.dueDate);
            const canSubmit = !overdue && !graded;
            return (
              <div className="card" key={a._id}>
                <div className="between">
                  <h3>{a.title}</h3>
                  <Status assignment={a} />
                </div>
                <p className="muted">
                  By {a.teacher?.name || "teacher"} &middot; Due {new Date(a.dueDate).toLocaleString()}
                  {overdue && " (closed)"} &middot; {a.maxMarks} marks
                </p>
                {a.description && <p>{a.description}</p>}

                {graded && (
                  <div className="feedback">
                    <strong>Feedback:</strong> {sub.feedback || "No written feedback."}
                  </div>
                )}

                {canSubmit &&
                  (openId === a._id ? (
                    <SubmitForm assignment={a} onDone={load} />
                  ) : (
                    <button className="btn" onClick={() => setOpenId(a._id)}>
                      {sub ? "Edit submission" : "Submit work"}
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
