# GradeBook - Assignment Submission & Grading System

A MERN-stack web app where teachers post assignments and grade submissions, and students submit their work and see marks and feedback.

**Live demo:** _add your Vercel link here_  
**API:** _add your Render link here_

## Features

- Register / log in as a **student** or **teacher** (JWT authentication, bcrypt-hashed passwords)
- **Teacher:** create and delete assignments (title, description, due date, max marks), see how many students submitted, open each submission, give marks and feedback
- **Student:** see all assignments, submit a text answer and/or a link (GitHub, Google Drive...), resubmit before the deadline, see marks and feedback once graded
- Role-based access control on both the API and the React routes
- Validation: marks cannot exceed the maximum, no submissions after the deadline, no edits after grading, one submission per student per assignment

## Tech stack

| Layer    | Tools                                             |
| -------- | ------------------------------------------------- |
| Frontend | React 18, React Router 6, Vite, hooks + context   |
| Backend  | Node.js, Express, JWT, bcryptjs, CORS             |
| Database | MongoDB (Atlas) with Mongoose                     |

## Project structure

```
assignment-grading-system/
  server/   Express API (models, routes, middleware)
  client/   React app (pages, components, auth context)
```

## Run locally

Prerequisites: Node.js 18+ and a MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works, or a local MongoDB).

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<any long random string>
CLIENT_URL=http://localhost:5173
```

Start it:

```bash
npm run dev     # or: npm start
```

You should see `MongoDB connected` and `API running on port 5000`.

### 2. Frontend

In a second terminal:

```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm run dev
```

Open http://localhost:5173.

### 3. Try it

1. Register a **teacher** account and create an assignment.
2. Log out, register a **student** account, and submit work.
3. Log back in as the teacher, open the assignment, and grade the submission.
4. Log in as the student again to see the marks and feedback.

## API overview

| Method | Endpoint                          | Who      | Purpose                              |
| ------ | --------------------------------- | -------- | ------------------------------------ |
| POST   | `/api/auth/register`              | public   | Create an account                    |
| POST   | `/api/auth/login`                 | public   | Log in, returns a JWT                |
| GET    | `/api/auth/me`                    | any user | Current user                         |
| GET    | `/api/assignments`                | any user | Teacher: own list. Student: all      |
| POST   | `/api/assignments`                | teacher  | Create assignment                    |
| DELETE | `/api/assignments/:id`            | teacher  | Delete assignment and its submissions |
| GET    | `/api/assignments/:id/submissions`| teacher  | List submissions for an assignment   |
| POST   | `/api/submissions`                | student  | Submit or resubmit                   |
| PUT    | `/api/submissions/:id/grade`      | teacher  | Give marks and feedback              |

Send the token as `Authorization: Bearer <token>`.

## Deployment (free tier)

### Database - MongoDB Atlas
1. Create a free cluster and a database user.
2. Under **Network Access**, allow `0.0.0.0/0` (needed for Render's changing IPs).
3. Copy the connection string and put your password and a database name (e.g. `assignment-grading`) into it.

### Backend - Render
1. New **Web Service** from your GitHub repo.
2. Root Directory: `server`, Build Command: `npm install`, Start Command: `npm start`.
3. Environment variables: `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (set it after the frontend is live; no trailing slash).
4. After deploy, open the Render URL; it should return `{"status":"ok",...}`. The free tier sleeps when idle, so the first request can take about 50 seconds.

### Frontend - Vercel
1. Import the same repo, set Root Directory to `client` (Vite is auto-detected).
2. Environment variable: `VITE_API_URL` = your Render URL (no trailing slash).
3. Deploy. `vercel.json` already rewrites all routes to `index.html` so page refreshes work.
4. Go back to Render and set `CLIENT_URL` to the Vercel URL, then redeploy the backend.

## Notes

- Submissions take a text answer and/or a link rather than file uploads, because free hosts have ephemeral disks where uploaded files would disappear.
- Anyone can pick the "teacher" role when registering. That keeps the demo simple; for real use, restrict teacher sign-up (invite code or admin approval).
