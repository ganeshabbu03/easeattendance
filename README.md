# AttendEase - Employee Attendance System

AttendEase is a modern, full-stack employee attendance management system built with the PERN/MERN stack (PostgreSQL/MongoDB, Express, React, Node.js). It features a beautiful, animated UI and supports both Employee and Manager roles.

## Features

### 🌟 General
- **Modern UI**: Built with Shadcn UI, Tailwind CSS, and Framer Motion for smooth animations.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Dark/Light Mode**: Fully supported theme switching.

### 👨‍💼 Employee
- **Dashboard**: View daily status and recent activity.
- **Mark Attendance**: Check-in and check-out with real-time status updates (Present, Late, Half-day).
- **History**: View personal attendance history.
- **Profile**: View profile details.

### 👩‍💼 Manager
- **Dashboard**: Overview of team attendance, including present, absent, and late counts.
- **Employee Management**: View list of all employees.
- **Reports**: Export attendance data to CSV.
- **Calendar**: View team attendance on a calendar view.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion, Wouter (Routing), React Query.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **Authentication**: Passport.js (Local Strategy).

## Prerequisites

- **Node.js**: v18 or higher.
- **MongoDB**: A running MongoDB instance (local or cloud).

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ganeshabbu03/easeattendance.git
    cd easeattendance
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    - The application defaults to `mongodb://localhost:27017/animated-attendance`.
    - To use a different URI, set the `MONGODB_URI` environment variable.

## Running the Application

1.  **Seed the Database** (Optional but recommended for first run):
    This creates a default manager account (`sarah@company.com` / `password123`).
    ```bash
    npx tsx seed_user.ts
    ```

2.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    *Note: On Windows, if `npm run dev` fails, use `npx tsx server/index.ts`.*

3.  **Access the App**:
    Open [http://localhost:5000](http://localhost:5000) in your browser.

## Default Credentials

- **Manager**:
    - Email: `sarah@company.com`
    - Password: `password123`

- **Employee**:
    - You can register a new employee account via the "Create account" link on the login page.

## Project Structure

- `client/`: Frontend React application.
- `server/`: Backend Express server.
- `shared/`: Shared types and schemas (Zod).
- `check_user.ts` & `seed_user.ts`: Utility scripts for database management.

## License

MIT
