# Real-Time Bus Tracking System

This project implements a real-time bus tracking system that provides live location updates for buses, accessible through a web interface for public users, drivers, and administrators. It leverages GPS integration and WebSocket communication for instant data exchange, aiming to improve public transportation efficiency and user experience.

## ✨ Features

*   **Real-Time Bus Tracking:** Live display of bus locations on an interactive map.
*   **Driver Dashboard:** Allows authenticated and approved drivers to share their current GPS location, speed, and heading.
*   **Public Map View:** Provides an intuitive interface for public users to view active buses and track specific routes without authentication.
*   **Admin Panel:** Secure interface for administrators to manage driver approvals and monitor system status.
*   **Secure Authentication:** User authentication and role-based authorization using Firebase.
*   **WebSocket Communication:** Instantaneous updates for bus movements across all connected clients.
*   **Responsive Design:** Optimized for seamless experience across various devices (desktop and mobile).

## 🛠️ Tech Stack

**Frontend:**
*   **React.js** (with Vite)
*   **TailwindCSS** & **ShadCN UI**
*   **React Leaflet** (for map visualization)
*   **Socket.IO Client**
*   **Firebase Client SDK** (Authentication)

**Backend:**
*   **Node.js** & **Express.js**
*   **Socket.IO Server**
*   **Firebase Admin SDK** (Firestore, Authentication)
*   **RESTful API**

**Database:**
*   **Firebase Firestore**

## 🚀 Getting Started

To set up and run the project locally, follow these general steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ITworkshop.git
    cd ITworkshop
    ```

2.  **Backend Setup:**
    *   Navigate to the `backend/` directory.
    *   Install dependencies: `npm install`
    *   Create a `.env` file from `backend/env.example`.
    *   Configure Firebase Admin SDK.
    *   Start the backend server: `npm run dev`

3.  **Frontend Setup:**
    *   Navigate to the `frontend/` directory.
    *   Install dependencies: `npm install`
    *   Create a `.env.local` file from `frontend/env.example`.
    *   Configure Firebase client-side SDK.
    *   Start the frontend development server: `npm run dev`

## 💡 Usage

*   **Public Map:** Access `http://localhost:5173/map` to view active buses in real-time.
*   **Driver Dashboard:** Log in as a driver at `http://localhost:5173/login`, then navigate to `/driver` to share location.
*   **Admin Panel:** Log in as an approved administrator at `http://localhost:5173/login`, then navigate to `/admin` to manage drivers.