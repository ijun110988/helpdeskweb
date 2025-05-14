# IT Helpdesk System

A modern IT helpdesk system built with **Node.js Express (TypeScript)** and **React (TypeScript)**. The entire system is containerized using **Docker Compose** for easy setup and deployment.

## Features

- User Authentication (JWT)
- Ticket Management System
- Role-based Access Control
- Responsive Admin Dashboard
- Real-time Ticket Updates

## Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- MySQL
- JWT Authentication

**Frontend:**
- React
- TypeScript
- Redux Toolkit
- React Router
- Bootstrap

## Getting Started with Docker

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Start the application using Docker Compose**

   ```bash
   docker-compose up --build
   ```

3. Access the services:
   - **Frontend**: http://localhost:3000  
   - **Backend API**: http://localhost:5000  
   - **MySQL**: Accessible on port `3306` (e.g. via MySQL Workbench)

### Directory Structure

```
.
├── backend/     # Node.js + Express backend API
├── frontend/    # React frontend app
├── docker-compose.yml
└── README.md
```

### Environment Variables

Docker Compose is configured to automatically pass environment variables to the backend. If you're running the backend separately, create a `.env` file in the `backend` folder with:

```env
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=root
DB_NAME=helpdesk
```

## Development Tips

- To rebuild services after making changes:
  ```bash
  docker-compose up --build
  ```

- To stop all services:
  ```bash
  docker-compose down
  ```

- To run backend/frontend locally outside Docker:
  - Backend:  
    ```bash
    cd backend
    npm install
    npm run dev
    ```
  - Frontend:  
    ```bash
    cd frontend
    npm install
    yarn dev
    ```

---