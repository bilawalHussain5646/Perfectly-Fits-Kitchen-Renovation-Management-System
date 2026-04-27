# Invoice Management System

This project is a full-stack application for managing invoices, built with Python Flask (backend) and React (frontend). It features a secure login system, LG-themed UI with a sidebar dashboard, and database storage for invoices and images.

## Features

-   **Secure Authentication**: JWT-based login system.
-   **Dashboard UI**: LG-themed sidebar layout.
-   **Create Invoices**: Submit invoice details including an image upload.
-   **View Invoices**: List existing invoices with filtering by name and email.
-   **Image Preview**: Securely view invoice images (BLOBs) in a popup.
-   **Excel Export**: Download filtered invoice data as an Excel file.
-   **Dual Storage**: Images are stored in the database (BLOB) and also saved to the local file system (in `backend/uploads`).

## Prerequisites

-   Python 3.8+
-   Node.js 16+
-   MySQL Database

## Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # Linux/Mac:
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Database Configuration**:
    -   Update `backend/app.py` `SQLALCHEMY_DATABASE_URI` with your MySQL credentials.
    -   Make sure your MySQL server is running.

5.  **Initialize Database & Create Admin User**:
    -   Run the reset script to create tables and a default user:
        ```bash
        python reset_db.py
        ```
    -   **Default Login**:
        -   Username: `admin`
        -   Password: `password123`

6.  Run the backend server:
    ```bash
    python app.py
    ```
    The server will run on `http://localhost:5000`.

## Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Usage

1.  Open the frontend and log in with the default credentials (`admin` / `password123`).
2.  Use the sidebar to navigate (currently single-page dashboard).
3.  Add invoices via the form.
4.  View and filter invoices in the list.
5.  Click "View" to see the invoice image.
