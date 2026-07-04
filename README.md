# PrepFlow — Modern Full-Stack Coding & Interview Preparation Suite

PrepFlow is an interactive, modern platform designed for software engineers preparing for technical interviews. It provides a coding workspace, mock interview tools, streak tracking, and data-driven performance analytics.

---

## 📽️ Demo Video
To see the system features and user experience in action, check out the walkthrough below:

<video src="demo.mp4" width="100%" autoplay loop muted controls></video>

*(If you are viewing this on GitHub, the video will autoplay above. You can find the demo video file `demo.mp4` in the root of this repository.)*

---

## 🌟 Key Features

*   **GitHub-Style Contribution Heatmap**: Visual daily activity tracker that logs user submissions and tracks continuous coding streaks.
*   **Dual-Pane Coding Playground**: An interactive workspace containing problem descriptions, constraints, and sample I/O on the left, paired with a syntax-highlighted code editor on the right.
*   **Mock Interview Simulator**: Integrated assessments to test algorithmic knowledge, track timing, score results, and record performance history.
*   **Progress Analytics**: Visual charts breaking down user statistics by topic, difficulty level (Easy/Medium/Hard), and problem categories.
*   **Persistence & Profiles**: Complete user authentication, dashboard summaries, badges, profile custom settings, and dynamic light/dark mode toggling.

---

## 🛠️ Technology Stack

### **Frontend**
*   **React.js 18** (TypeScript, Vite)
*   **Context API** for state management and theme configurations
*   **Vanilla CSS3** for clean layouts, responsive grids, and transitions
*   **Lucide React** for modern iconography

### **Backend & Database**
*   **Node.js & Express** (TypeScript)
*   **PostgreSQL** for relational data persistence
*   **Prisma ORM** for schema definition, migrations, and database queries
*   **JWT & bcryptjs** for secure authentication and token refreshment

---

## 📂 Project Directory Structure

```text
prepflow/
├── backend/
│   ├── prisma/             # Prisma Schema, Migrations, and Seeds
│   ├── src/
│   │   ├── controllers/    # API Logic Handlers
│   │   ├── routes/         # Express Route Configurations
│   │   ├── middlewares/    # Auth Token Validation Middlewares
│   │   └── app.ts          # Server Entrypoint
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Heatmaps & Visual Components
│   │   ├── layouts/        # Layout Structures (App/Auth)
│   │   ├── pages/          # Solving Workspace, Dashboard, Sheets, Settings
│   │   ├── services/       # Axios API integrations
│   │   └── main.tsx        # React Application Root
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16+)
*   [PostgreSQL](https://www.postgresql.org/) (or a cloud provider like Neon)

---

### 2. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables:
    *   Create a `.env` file in the `backend/` folder.
    *   Copy the values from `.env.example` and fill in your database connection string and JWT secrets.
    ```env
    PORT=5000
    DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>?sslmode=require"
    JWT_SECRET="your_jwt_secret_here"
    JWT_REFRESH_SECRET="your_refresh_secret_here"
    ```
4.  Run Prisma Migrations to set up your PostgreSQL database schema:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  Seed the database with the curriculum (injects the complete set of 641 verified coding problems):
    ```bash
    npx prisma db seed
    ```
6.  Start the development server:
    ```bash
    npm run dev
    ```
    The backend server will run on `http://localhost:5000`.

---

### 3. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` in your browser to view the application.

---

## 📸 Screenshots

### 1. User Authentication & Secure Login
![Login](screenshots/login.png)

### 2. Developer Dashboard & Streak Grid
![Dashboard](screenshots/dashboard.png)

### 3. Problems Directory & Live Preview
![Problems Catalog](screenshots/problems.png)

### 4. Interactive Coding Workspace
![Coding Workspace](screenshots/workspace.png)

### 5. Progress Analytics & Performance Metrics
![Analytics](screenshots/analytics.png)

---

## 📄 License
This project is licensed under the MIT License.
