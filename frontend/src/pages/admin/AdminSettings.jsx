import React from "react";
import AdminTopbar from "../../components/AdminTopbar";

export default function AdminSettings() {
  return (
    <>
      <AdminTopbar />
      <main className="container py-4">
        <div className="glass p-4">
          <div className="small text-secondary">Settings</div>
          <div className="h4 m-0" style={{ fontWeight: 900 }}>Танзимот</div>

          <div className="row g-3 mt-2">
            <div className="col-lg-6">
              <div className="card-mini">
                <div className="fw-bold">API base</div>
                <div className="small text-secondary mt-1">
                  VITE_API_URL дар `.env` (frontend)
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card-mini">
                <div className="fw-bold">Security</div>
                <div className="small text-secondary mt-1">
                  JWT_SECRET дар `.env` (backend)
                </div>
              </div>
            </div>
          </div>

          <div className="alert alert-warning rounded-4 mt-3 mb-0">
            Тавсия: пароли admin-ро баъд иваз кун.
          </div>
        </div>
      </main>
    </>
  );
}