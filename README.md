# AppointEd – Student‑Teacher Appointment System

🎓 **Project Objective**  
AppointEd streamlines academic scheduling by letting students search teachers, book appointments, and send contextual messages online. Teachers can approve or cancel requests, and admins handle staff onboarding. Built with Firebase for secure auth, real‑time data, and cloud hosting.

---

## 🧠 System Overview

### 1. **Admin**
- Add / update / delete teacher records (name, department, subjects)
- Approve or reject student registrations
- View platform logs and metrics

### 2. **Teacher**
- Secure login / logout
- Manage personal appointment slots
- Approve or cancel student bookings
- View incoming messages and history

### 3. **Student**
- Self‑registration and login
- Search teachers by name, department, or subject
- Book or cancel appointments
- Send messages detailing purpose and timing

All critical actions are logged and time‑stamped for auditability.

---

## 📁 Project Structure

```

📦 appointed
├── public/
│   ├── index.html          # Landing & login
│   ├── dashboard.html      # Role‑based SPA shell
│   └── assets/             # Icons, images, favicon
├── src/
│   ├── auth/
│   │   └── firebase-auth.js     # Auth logic (sign‑up / sign‑in / role guard)
│   ├── modules/
│   │   ├── admin.js             # Admin CRUD & approvals
│   │   ├── teacher.js           # Slot & message handling
│   │   └── student.js           # Search & booking flow
│   ├── utils/
│   │   └── logger.js            # Central logging helper
│   ├── styles/
│   │   └── main.css             # Responsive Tailwind‑like styles
│   └── firebase.js              # App config & Firestore refs
├── tests/
│   └── test-cases.md            # Manual & scripted tests
├── README.md
└── docs/
├── lld.md                   # Low‑Level Design document
├── architecture.md          # System architecture & wireframes
└── optimization.md          # Code & infra optimizations

```

---

## 🛠️ Tech Stack

- **HTML5** – Semantic UI structure  
- **CSS3** – Responsive styling (mobile‑first with media queries)  
- **JavaScript (ES6+)** – Modular front‑end logic  
- **Firebase**  
  - Authentication (email/password)  
  - Firestore (NoSQL real‑time DB)  
  - Cloud Functions (optional server‑side logging)  
  - Hosting & CI/CD  
