import React, { useEffect, useState } from "react";
import AdminTopbar from "../../components/AdminTopbar";
import { apiAdminStats } from "../../api/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, lessons: 0, cards: 0 });
  const [err, setErr] = useState("");

  useEffect(() => {
    apiAdminStats().then(setStats).catch(e => setErr(e.message));
  }, []);

  return (
    <>
      <AdminTopbar />
      <main className="container py-4">
        {err && <div className="alert alert-danger rounded-4">{err}</div>}

        <div className="row g-3">
          <div className="col-lg-8">
            <div className="glass p-4">
              <div className="small text-secondary">Admin Dashboard</div>
              <div className="h4 m-0" style={{ fontWeight: 900 }}>Идоракунии платформа</div>

              <div className="row g-3 mt-2">
                <div className="col-md-4">
                  <div className="kpi">
                    <div className="n">{stats.lessons}</div>
                    <div className="t">Lessons</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="kpi">
                    <div className="n">{stats.users}</div>
                    <div className="t">Users</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="kpi">
                    <div className="n">{stats.cards}</div>
                    <div className="t">Flashcards</div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info rounded-4 mt-3 mb-0">
                Барои сохтани дарсҳо → Admin → Lessons.
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="glass p-4 h-100">
              <div className="h6 m-0" style={{ fontWeight: 900 }}>Қоида</div>
              <ol className="small text-secondary mt-2 mb-0">
                <li>Сохтани Lesson</li>
                <li>Vocab (RU/TJ) пур кардан</li>
                <li>Publish = true</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}