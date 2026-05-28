# Staffton Super Admin Portal

A robust, modern Admin Panel built with React, Vite, Redux Toolkit, and Tailwind CSS. This dashboard acts as the command center for the **Staffton** hiring platform, enabling super administrators to manage organizations, job postings, recruitment pipelines, candidates, system entities, and user roles.

---

## 📖 Table of Contents

- [Features Overview](#-features-overview)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Installation](#local-installation)
  - [Environment Variables](#environment-variables)
- [Routing & Security](#-routing--security)
- [State Management & API integration](#-state-management--api-integration)
- [Deployment](#-deployment)
- [Development Guidelines](#%EF%B8%8F-development-guidelines)

---

## 🌟 Features Overview

The Staffton Super Admin project consists of several core feature modules:

1. **Admin Dashboard (`src/pages/AdminDashboard.jsx`)**
   - High-level analytics, operational stats, overview cards, and active pipeline trends.
2. **Organization Management (`src/pages/OrganizationManagement.jsx` & `src/pages/OrganizationDetails.jsx`)**
   - Manage business accounts registered on Staffton.
   - Filter and approve/reject pending registrations.
   - Resend team member invitations.
   - Edit organization detail cards, view domains, active jobs, and team members.
3. **Job & Recruitment Pipeline (`src/pages/JobsManagement.jsx`, `src/pages/JobDetails.jsx` & `src/pages/JobPipeline.jsx`)**
   - Review active, draft, and closed jobs.
   - Post new jobs via the multi-step `PostJobWizard`.
   - Visualize and advance candidates through recruitment stages (Applied, Screened, Interview, Offered, Hired) inside the Kanban-style pipeline.
4. **Candidate Directory (`src/pages/CandidateManagement.jsx`)**
   - View, search, and manage candidate profile databases, specializations, resumes, and status details.
5. **Entity Management (`src/pages/EntityManagement.jsx`)**
   - Manage lookup tables and taxonomy domains (e.g., job categories, specific candidate tags, onboarding criteria).
6. **User & Access Management (`src/pages/UserManagement.jsx`)**
   - Manage administrative staff accounts and grant/revoke permissions.
7. **System Settings (`src/pages/Settings.jsx`)**
   - Configure profile preferences, notification setups, and administrative credentials.

---

## 🛠️ Tech Stack

This project is built using modern frontend technologies:

*   **Core Framework:** [React v18.2](https://react.dev/)
*   **Build Tooling:** [Vite v5](https://vitejs.dev/) with SWC compiler (`@vitejs/plugin-react-swc`)
*   **Styling:** 
    *   [Tailwind CSS v4](https://tailwindcss.com/) for fast, utility-driven layouts.
    *   **CSS Modules (`*.module.css`)** for component-level, scoped custom styling.
*   **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) (`@reduxjs/toolkit` and `react-redux`) for managing global authentication, cache, and organizational actions.
*   **Routing:** [React Router DOM v6](https://reactrouter.com/) for declarative client-side routing.
*   **API Client:** [Axios](https://axios-http.com/) with request/response interceptors for token insertion, error handling, and automatically normalizing email inputs.
*   **Icons:** [Lucide React](https://lucide.dev/) for high-quality SVG vector icons.
*   **Notifications:** [React Hot Toast](https://react-hot-toast.com/) for responsive UI alerts and notifications.

---

## 📂 System Architecture

The project directory follows a modular, feature-oriented structure inside `src/`:

```
staffton-admin/
├── public/                 # Static assets, favicon, and netlify routing redirects
├── src/
│   ├── app/                # Application store initialization, routes, and providers
│   │   ├── providers.jsx   # Global Redux & Router provider wrapper
│   │   ├── rootReducer.js  # Redux store root reducer aggregation
│   │   ├── routes.jsx      # Application page route declarations
│   │   └── store.js        # Redux store configuration
│   ├── assets/             # Global visual assets (images, logos, SVGs)
│   ├── components/         # Reusable presentation and utility components
│   │   ├── Button/         # Shared theme button components
│   │   ├── Header/         # Dashboard global header navigation
│   │   ├── Modal/          # Common overlay modal boxes
│   │   ├── Pagination/     # Reusable list pagination controllers
│   │   ├── Sidebar/        # Global Admin navigation sidebar menu
│   │   ├── Skeleton/       # UI loading placeholder blocks
│   │   └── ProtectedRoute.jsx # Route authentication guard
│   ├── context/            # React Context API configurations
│   ├── features/           # Slices, state, and wizards grouped by feature
│   │   ├── auth/           # Login slices and credential state
│   │   └── organization/   # Job creation wizard and organization state
│   ├── hooks/              # Custom reusable React hooks
│   ├── layouts/            # Page layouts wrapping nested routes
│   │   ├── AdminLayout.jsx # Layout containing Sidebar + Header + Content Area
│   │   ├── AuthLayout.jsx  # Layout for login and guest pages
│   │   └── MainLayout.jsx  # Basic default wrapper
│   ├── pages/              # Primary page views (each with its CSS module counterpart)
│   │   ├── AdminDashboard.jsx
│   │   ├── CandidateManagement.jsx
│   │   ├── EntityManagement.jsx
│   │   ├── JobDetails.jsx
│   │   ├── JobPipeline.jsx
│   │   ├── JobsManagement.jsx
│   │   ├── Login.jsx
│   │   ├── OnboardingAccept.jsx
│   │   ├── OrganizationDetails.jsx
│   │   ├── OrganizationManagement.jsx
│   │   └── UserManagement.jsx
│   ├── services/           # Axios client configurations and API services
│   │   ├── apiClient.js    # Base Axios setup with authorization & email formatting
│   │   ├── endpoints.js    # API route registry configurations
│   │   ├── auth.service.js # Authentication network requests
│   │   ├── admin.service.js
│   │   ├── job.service.js
│   │   ├── candidate.service.js
│   │   └── organization.service.js
│   ├── styles/             # Global custom themes and style variables
│   ├── utils/              # Pure utility functions and helper methods
│   ├── App.jsx             # Root layout container
│   ├── index.css           # Global CSS styles and Tailwind configurations
│   └── main.jsx            # React root application entry point
├── .env.example            # Sample configuration file for environment parameters
├── index.html              # HTML shell template
├── netlify.toml            # Deployment configurations for Netlify hosting
├── package.json            # Script definitions, settings, and npm dependency registry
└── vite.config.js          # Vite development and compilation preferences
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following software installed locally:
*   [Node.js](https://nodejs.org/) (version 18 or above recommended)
*   [npm](https://www.npmjs.com/) (packaged automatically with Node.js)

### Local Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/<your-org>/staffton-admin.git
    cd staffton-admin
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Prepare Environment Variables:**
    Duplicate the example environment file and name it `.env`:
    ```bash
    cp .env.example .env
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    This launches the local development server (typically at `http://localhost:5173`).

5.  **Build Code for Production:**
    ```bash
    npm run build
    ```
    This compiles optimization-ready assets into the static `dist/` directory.

---

## 🔑 Environment Variables

The application requires specific environment variables to communicate with the REST API. 

*   `VITE_API_BASE_URL`: The fully qualified path to the REST API root (must include `/api/v1`).
    *   **Development default:** `https://api-staffton.onrender.com/api/v1`
    *   **Production:** Change to your live production API gateway URL.

---

## 🔒 Routing & Security

All route declarations reside in [routes.jsx](file:///c:/Users/ATM/Desktop/company/staffton-admin/src/app/routes.jsx).

*   **Public/Guest Routes:** Routes under `/auth/*` (such as `/auth/login` and `/auth/onboarding`) are accessible to unauthenticated guests and are wrapped in the [AuthLayout](file:///c:/Users/ATM/Desktop/company/staffton-admin/src/layouts/AuthLayout.jsx).
*   **Protected Routes:** Core administration paths (e.g., `/organizations`, `/jobs`, `/candidates`, `/pipeline`) are nested under `/` and wrapped inside the [ProtectedRoute](file:///c:/Users/ATM/Desktop/company/staffton-admin/src/components/ProtectedRoute.jsx) component. 
*   **Authorization Guard:**
    *   The `ProtectedRoute` checks `localStorage` for a valid user token.
    *   If no token exists, the user is automatically redirected to the login interface.

---

## 🔄 State Management & API integration

### Network Layer Configuration

All server interaction is brokered by the customized Axios instance in [apiClient.js](file:///c:/Users/ATM/Desktop/company/staffton-admin/src/services/apiClient.js):

1.  **Request Interceptor:**
    *   Extracts the token from `localStorage` and appends it to the outgoing HTTP headers: `Authorization: Bearer <token>`.
    *   Automatically formats and normalizes all payload keys containing the keyword `email` to lowercase.
2.  **Response Interceptor:**
    *   Intercepts HTTP `401 Unauthorized` responses. If a session expires or a token is invalidated, it automatically clears `localStorage` credentials and redirects the page to `/auth/login?expired=true`.

### Redux Slices

Global states, such as user authentication context and organization actions, are maintained via Redux. Redux stores are configured under `src/app/store.js` and aggregate slices defined inside the `src/features/` folders.

---

## 🌐 Deployment

The application is configured to deploy seamlessly to cloud providers (e.g., **Netlify**).

*   **Build Settings:**
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `dist`
*   **Routing Fallbacks:**
    *   Since this is a Single Page Application (SPA) with client-side routing, any direct URL path refresh must resolve back to `index.html`. This is managed via the redirects configuration in [netlify.toml](file:///c:/Users/ATM/Desktop/company/staffton-admin/netlify.toml) and `public/_redirects`.

---

## ✍️ Development Guidelines

To maintain clean and standardized code, please adhere to the following project guidelines:

1.  **CSS Class Selection:**
    Prefer Tailwind utility classes for basic structural positioning, borders, spacing, and flexbox adjustments. Use **CSS Modules** (`*.module.css`) for high-fidelity animations, complex gradients, or hover structures to keep JSX layouts clean.
2.  **Naming Conventions:**
    *   Use **PascalCase** for component files and React folders (e.g., `OrganizationDetails.jsx`, `PostJobWizard/`).
    *   Use **camelCase** for service files, utilities, and helper scripts (e.g., `apiClient.js`, `auth.service.js`).
3.  **Authentication & User Session Management:**
    Do not modify user credential keys (`token`, `role`, `auth_user`) in `localStorage` directly outside the React Redux flows or [auth.service.js](file:///c:/Users/ATM/Desktop/company/staffton-admin/src/services/auth.service.js) without verifying state synchronizations.
4.  **Handling Errors:**
    Use `react-hot-toast` to notify users of failed requests rather than relying on silent console errors or native alerts. Always check axios error structures safely.
