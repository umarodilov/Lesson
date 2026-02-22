import React from "react";
import Topbar from "../components/Topbar";

export default function AdminPanel() {
  return (
    <>
      <Topbar />
      <main className="container py-4">
        <div className="glass p-4">
          <div className="small text-secondary">Admin Panel</div>
          <div className="h4 m-0" style={{ fontWeight: 900 }}>
            Идоракунии дарсҳо
          </div>

          <div className="mt-3 text-secondary">
            Қадами навбатӣ: CRUD (сохтан/тағйир/ҳазф) барои Lessons + Preview.
          </div>
        </div>
      </main>
    </>
  );
}