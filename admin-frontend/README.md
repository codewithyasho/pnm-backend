# People Network Management LLP - Admin Dashboard

Professional, responsive admin and manager portal built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**, interfacing with the **FastAPI** backend and **SQLite** database.

---

## 🚀 Features

- **Executive KPI Dashboard**: Live metrics tracking Total Leads, Pending Inquiries, Completed Inquiries, Unique Corporate Clients, and Resolution Rate.
- **Client Enquiries Table & Card View**:
  - Full desktop table view with sortable columns, search, and direct action buttons.
  - Responsive mobile card view with touch-friendly status switches, call, and email shortcuts.
- **Instant Status Management**:
  - Update enquiry status (`pending` <-> `completed`) in real-time with one click via `PATCH /admin/update/status/{id}`.
- **Deep Enquiry Inspection**:
  - Full detail modal showcasing client contact details, team size, primary interest, and complete requirement specifications.
- **Companies Directory**:
  - Browse all distinct corporate client organizations (`GET /admin/list/companies`), track inquiry counts, and filter leads per company.
- **Contacts Hub**:
  - Direct access to distinct phone numbers (`GET /admin/list/numbers`), corporate emails (`GET /admin/list/emails`), and client names (`GET /admin/list/names`) with one-click copy and bulk copy for marketing or communication.
- **Live Search & Multi-parameter Filters**:
  - Real-time client-side and backend filtering (`GET /admin/filter`).
  - Search across names, emails, phones, companies, and requirement text.
- **Data Export**:
  - Export filtered enquiry sets directly to CSV with one click.
- **Security & Configuration**:
  - Configurable Admin API Key (`x-api-key: 123` by default) and Backend URL.
  - Live API connection health indicator with ping verification.

> **Note**: As requested, the user-facing form submission endpoint (`POST /admin/user/submit`) has been deliberately excluded from the admin dashboard and is reserved for user-facing applications.

---

## 🛠️ Quick Start

### 1. Start the FastAPI Backend
Ensure Python dependencies are installed and run:
```bash
# In the project root (or backend folder):
.\venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
```
Backend runs on `http://127.0.0.1:8000` (Swagger docs available at `http://127.0.0.1:8000/docs`).

### 2. Start the Admin Dashboard Frontend
```bash
cd admin-frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173/`.

### 3. Production Build
```bash
cd admin-frontend
npm run build
```
Built assets are generated in `admin-frontend/dist`.
