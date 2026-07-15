# Student Academic Manager

A full-stack web application built with **React**, **Express**, and **MongoDB** to help university students organize their academic life. The application allows users to manage courses, track grades, review professors, and keep important academic events in a calendar.

This project was originally developed as part of a university team project. This repository contains my personal version, including additional improvements and refactoring.

## Features

### User Authentication
- Create a new account.
- Log in securely to access your personal information.

### Course Management
- Add and manage university courses.
- Store information such as course code, semester, credits, and lecturers.
- Track grades for projects, assignments, exams, and other assessments.

### Professor Reviews
- Browse the list of registered professors.
- View information about each professor.
- Write and read reviews to share experiences with other students.

### Academic Calendar
- Create events for specific dates.
- Keep track of exams, assignment deadlines, meetings, and other important academic activities.
- Events are stored in MongoDB, allowing them to persist between sessions.

## Tech Stack

- **Frontend:** React
- **Backend:** Express.js
- **Database:** MongoDB
- **HTTP Client:** Axios
- **Routing:** React Router
- **Package Manager:** pnpm

## Installation

### Backend

From the project root directory:

```bash
cd aplication/backend
pnpm install
pnpm dev
```

Keep this terminal running while using the application.

### Frontend

Open another terminal and run:

```bash
cd aplication/frontend
pnpm install
pnpm dev
```

After starting the development server, Vite will provide a local address similar to:

```text
http://localhost:5173
```

Open this address in your browser.

## Environment Variables

Before running the backend, create a `.env` file inside the `backend` folder using `.env.example` as a template.

Example:

```text
MONGO_URI=your_mongodb_connection_string
```

## Project Structure

```
aplication/
├── backend/        # Express API
└── frontend/       # React application
```


## License

This project was developed for educational purposes and is shared as part of my software development portfolio.