import React, { useEffect, useState } from "react";
import AdminTopbar from "../../components/AdminTopbar";
import { apiAdminUsers } from "../../api/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    apiAdminUsers().then(setUsers).catch(e => setErr(e.message));
  }, []);

  const filtered = users.filter(u => {
    const s = `${u.name || ""} ${u.email || ""} ${u.role || ""}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <>
      <AdminTopbar />
      <main className="container py-4">
        {err && <div className="alert alert-danger rounded-4">{err}</div>}

        <div className="glass p-4">
          <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
            <div>
              <div className="small text-secondary">Users</div>
              <div className="h4 m-0" style={{ fontWeight: 900 }}>Корбарон</div>
            </div>

            <input
              className="form-control rounded-4"
              style={{ maxWidth: 320 }}
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="table-responsive mt-3">
            <table className="table align-middle">
              <thead>
                <tr className="text-secondary">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td className="fw-bold">{u.name || "—"}</td>
                    <td className="text-secondary">{u.email}</td>
                    <td>
                      <span className={"badge rounded-pill px-3 py-2 " + (u.role === "admin" ? "bg-primary" : "bg-secondary")}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-secondary">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && <div className="text-secondary">Натиҷа нест.</div>}
        </div>
      </main>
    </>
  );
}