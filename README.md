# Abd Madarsa Management

Role-based madarsa, school, and university management app with React, Node.js, and MySQL.

## Local Development

```powershell
npm.cmd install
npm.cmd run db:setup
npm.cmd run server
npm.cmd run dev -- --host 127.0.0.1
```

Frontend: `http://127.0.0.1:5173`
Backend: `http://localhost:3001`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) to build and test in GitHub Actions, publish the frontend to GitHub Pages, and run the backend and MySQL in the cloud. No local backend is required.
