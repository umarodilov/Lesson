import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { apiRegister } from "../api/api";
import { saveAuth } from "../auth/auth";

export default function Register() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const data = await apiRegister({ name, email, password });

      // save token + user in localStorage
      saveAuth(data.token, data.user);

      // redirect by role (normally user)
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
                Регистрация
              </div>
              <div className="small text-secondary mt-1">
                Аккаунт соз ва оғоз кун
              </div>

              <form className="mt-3" onSubmit={submit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Ном</label>
                  <input
                    className="form-control rounded-4"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Умар"
                    autoComplete="name"
                    required
                  />
                </div>

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
                    placeholder="минимум 8 символ"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <div className="form-text">
                    Парол камаш 8 символ бошад.
                  </div>
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
                  {loading ? "..." : "Сохтан"}
                </button>

                <div className="small text-secondary mt-3">
                  Аллакай аккаунт дорӣ? <Link to="/login">Даромад</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}