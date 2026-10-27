import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

function GradeForm({ submission, maxMarks, onSaved }) {
  const [marks, setMarks] = useState(submission.marks ?? "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const updated = await api(`/submissions/${submission._id}/grade`, {
        method: "PUT",
        body: { marks, feedback },
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="grade-form" onSubmit={save}>
      {error && <p className="alert">{error}</p>}
      <div className="row">
        <label>
          Marks (out of {maxMarks})
          <input type="number" min={0} max={maxMarks} step="any" value={marks} onChange={(e) => setMarks(e.target.value)} required />
        </label>
        <label className="grow">
          Feedback
          <input value={feedback} onChange={(e) => setFeedback(e.target.value)} maxLength={2000} />
        </label>
      </div>
      <button className="btn" disabled={busy}>
        {busy ? "Saving..." : submission.marks === null ? "Save grade" : "Update grade"}
      </button>
    </form>
  );
}

export default function Submissions() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/assignments/${id}/submissions`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [id]);

  const replace = (updated) =>
    setData((d) => ({
      ...d,
      submissions: d.submissions.map((s) => (s._id === updated._id ? { ...s, ...updated } : s)),
    }));

  if (error) return <p className="alert">{error}</p>;
  if (!data) return <p className="muted">Loading...</p>;

  const { assignment, submissions } = data;

  return (
    <>
      <Link to="/teacher">&larr; Back to dashboard</Link>
      <h1>{assignment.title}</h1>
      <p className="muted">
        Due {new Date(assignment.dueDate).toLocaleString()} &middot; {assignment.maxMarks} marks
      </p>
      {assignment.description && <p>{assignment.description}</p>}

      <h2>Submissions ({submissions.length})</h2>
      {submissions.length === 0 ? (
        <p className="muted">Nobody has submitted yet.</p>
      ) : (
        <div className="list">
          {submissions.map((s) => (
            <div className="card" key={s._id}>
              <div className="between">
                <h3>
                  {s.student?.name} <span className="muted">({s.student?.email})</span>
                </h3>
                {s.marks !== null ? (
                  <span className="badge badge-ok">
                    {s.marks}/{assignment.maxMarks}
                  </span>
                ) : (
                  <span className="badge badge-warn">Not graded</span>
                )}
              </div>
              <p className="muted">Submitted {new Date(s.submittedAt).toLocaleString()}</p>
              {s.answer && <p className="answer">{s.answer}</p>}
              {s.link && (
                <p>
                  <a href={s.link} target="_blank" rel="noopener noreferrer">
                    Open submitted link
                  </a>
                </p>
              )}
              <GradeForm submission={s} maxMarks={assignment.maxMarks} onSaved={replace} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
