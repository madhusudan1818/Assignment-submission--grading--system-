import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "teacher" ? "/teacher" : "/student");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card auth-card" onSubmit={onSubmit}>
      <h1>Log in</h1>
      {error && <p className="alert">{error}</p>}
      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={onChange} required autoFocus />
      </label>
      <label>
        Password
        <input name="password" type="password" value={form.password} onChange={onChange} required />
      </label>
      <button className="btn" disabled={busy}>
        {busy ? "Logging in..." : "Log in"}
      </button>
      <p className="muted">
        No account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}
