import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await register(form);
      navigate(user.role === "teacher" ? "/teacher" : "/student");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card auth-card" onSubmit={onSubmit}>
      <h1>Create an account</h1>
      {error && <p className="alert">{error}</p>}
      <label>
        Full name
        <input name="name" value={form.name} onChange={onChange} required autoFocus />
      </label>
      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={onChange} required />
      </label>
      <label>
        Password (min 6 characters)
        <input name="password" type="password" minLength={6} value={form.password} onChange={onChange} required />
      </label>
      <label>
        I am a
        <select name="role" value={form.role} onChange={onChange}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </label>
      <button className="btn" disabled={busy}>
        {busy ? "Creating..." : "Register"}
      </button>
      <p className="muted">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
