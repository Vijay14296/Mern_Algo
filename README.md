link: https://www.loom.com/share/df683eee66f94bb6be3d800bd5715953?sid=7ac8b7c3-7f59-4666-a0c4-002ed462a8bb
# Online Judge Platform

A full-featured **Online Judge platform** built using a microservices architecture, designed for coding practice, automated problem evaluation, gamification, and AI-powered feedback. This project demonstrates advanced full-stack development, cloud deployment, and real-time code execution.

---

## Table of Contents

* [Features](#features)
* [Project Structure](#project-structure)
* [Technologies](#technologies)
* [Setup & Installation](#setup--installation)
* [Usage](#usage)
* [Multi-Cloud Deployment](#multi-cloud-deployment)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* User authentication & role-based access (admin/user)
* CRUD operations for problems
* Code submission and automated evaluation with **real verdicts**
* Hidden & visible test cases for judging
* Gamification: XP, badges, streaks using **Redis + BullMQ**
* AI-powered feedback using **Google Gemini**
* Dockerized services for consistent development and deployment
* Supports **Python, Java, and C++** with starter code templates

---

## Project Structure

```
root/
│
├─ frontend/                 # React + Vite + Tailwind CSS
│   ├─ src/components
│   ├─ src/pages
│   ├─ src/context
│   └─ ...
│
├─ backend/                  # Node.js + Express + MongoDB
│   ├─ controllers
│   ├─ models
│   ├─ routes
│   ├─ services
│   └─ ...
│
├─ redis-worker/             # Gamification worker using Redis + BullMQ
│
├─ code-executer-service/    # Dockerized microservice for code compilation & execution
```

---

## Technologies

* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express.js, MongoDB, Mongoose
* **Microservices:** Docker, Python runtime, Node.js for orchestration
* **Gamification:** Redis, BullMQ
* **AI Feedback:** Google Gemini API integration
* **Deployment:** Multi-cloud (AWS, Vercel, Render, or similar)

---

## Setup & Installation

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Redis Worker

```bash
cd redis-worker
npm install
node worker.js
```

### Code Executor Service

```bash
cd code-executer-service
docker build -t code-executor .
docker run -p 8000:8000 code-executor
```

**Environment variables:**
Create `.env` files in each service with required keys for MongoDB, Redis, and API keys.

---

## Usage

1. Register as a user or login as admin
2. Admin can **create, edit, or delete problems**
3. Users can **solve problems** using the code editor with starter code
4. Submissions are evaluated against **visible and hidden test cases**
5. Gamification rewards XP, badges, and streaks in real-time
6. AI feedback provides code suggestions and debugging help

---

## Multi-Cloud Deployment

* **Frontend:** Hosted on Vercel
* **Backend API:** Hosted on Render or AWS EC2
* **Code Executor Service:** Dockerized container deployed on AWS ECS / EC2
* **Redis Worker:** Deployed on cloud VM or container service
* **MongoDB:** Hosted on MongoDB Atlas

All services communicate securely via API endpoints and WebSockets for real-time updates. This ensures **scalability** and **modular deployment** across different cloud providers.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes and commit
4. Push to your branch and create a Pull Request

---

## License

This project is licensed under the MIT License.
