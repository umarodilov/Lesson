import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { apiLogin } from "../api/api";
import { saveAuth } from "../auth/auth";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const data = await apiLogin({ email, password });

      // save token + user in localStorage
      saveAuth(data.token, data.user);

      // redirect by role
      if (data.user?.role === "admin") nav("/admin");
      else nav("/app");
    } catch (e) {
      setErr(e.message || "Хато шуд");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar />
      <main className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-5">
            <div className="glass p-4">
              <div className="h4 m-0" style={{ fontWeight: 900 }}>
                Даромад
              </div>
              <div className="small text-secondary mt-1">
                Ба ҳисоби худ дароед
              </div>

              <form className="mt-3" onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Email</label>
                  <input
                    className="form-control rounded-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Password</label>
                  <input
                    type="password"
                    className="form-control rounded-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    autoComplete="current-password"
                    required
                  />
                </div>

                {err && (
                  <div className="alert alert-danger rounded-4 py-2">
                    {err}
                  </div>
                )}

                <button
                  disabled={loading}
                  className="btn btn-primary w-100 rounded-4"
                  style={{ fontWeight: 900 }}
                >
                  {loading ? "..." : "Даромад"}
                </button>

                <div className="small text-secondary mt-3">
                  Аккаунт надорӣ? <Link to="/register">Регистрация</Link>
                </div>

                <div className="small text-secondary mt-2">
                  Аккаунт тест: <b>user@test.com</b> / <b>user1234</b>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}