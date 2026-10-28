# Subscription Tracker API

A REST API built with Node.js and Express for managing subscriptions, authenticating users, and sending email reminders before subscription renewals.

## Features

- User registration and sign-in.
- JWT-based authentication.
- Subscription creation and management.
- MongoDB Atlas integration using Mongoose.
- Email reminders for upcoming renewals.
- Workflow integration for scheduling reminder tasks.

## Tech Stack

- **Runtime:** Node.js
- **Backend:** Express.js
- **Database:** MongoDB Atlas and Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **API testing:** Postman
- **Email:** SMTP
- **Deployment:** Render
- **Workflow scheduling:** Upstash/QStash configuration (where enabled)

## Project Structure

```text
subscription-tracker/
├── config/
│   ├── env.js
│   └── upstash.js
├── controllers/
│   ├── subscription.controller.js
│   └── workflow.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── subscriptions.routes.js
│   └── workflow.routes.js
├── utils/
├── app.js
├── package.json
├── .env.example
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB Atlas database
- Postman for API testing
- SMTP credentials for email reminders

### 1. Clone the repository

```bash
git clone https://github.com/seraphena/subscription-tracker.git
cd subscription-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file named `.env.development.local` in the project root. Use `.env.example` as a reference.

Configure the required variables:

```ini
PORT=5500
NODE_ENV=development
SERVER_URL=http://localhost:5500

DB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d

QSTASH_DEV=true

EMAIL_USER=your_smtp_username
EMAIL_PASSWORD=your_smtp_password
```

Replace the placeholder values with your own credentials. Never commit real passwords, tokens, or secrets to GitHub.

### 4. Start the server

Development mode:

```bash
npm run dev
```

Standard start command:

```bash
npm start
```

The local API uses port `5500` when `PORT=5500` is configured.

## API Endpoints

The API is organized under the `/api/v1` prefix.

### Authentication

Base path: `/api/v1/auth`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/sign-up` | Register a user |
| POST | `/sign-in` | Sign in |
| POST | `/sign-out` | Sign out |

### Users

Base path: `/api/v1/users`

User routes are available through this router. Consult the corresponding route file for the exact methods and parameters.

### Subscriptions

Base path: `/api/v1/subscriptions`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Retrieve subscriptions |
| POST | `/` | Create a subscription |
| GET | `/:id` | Retrieve a subscription by ID |
| PUT | `/:id` | Update a subscription |
| DELETE | `/:id` | Delete a subscription |
| GET | `/user/:id` | Retrieve subscriptions for a user |
| GET | `/:id/cancel` | Cancel a subscription |
| GET | `/upcoming-renewals` | Retrieve upcoming renewals |

Some endpoints may require authentication. Check the route middleware and controller implementation for the required authorization and request format.

### Workflows

Workflow routes are defined in the workflow router. Check `routes/workflow.routes.js` and `controllers/workflow.controller.js` for the exact public endpoint and supported HTTP method.

## Testing with Postman

1. Start the server.
2. Register a user using the sign-up endpoint.
3. Sign in and obtain the authentication token.
4. Include the token as a Bearer Token when testing protected endpoints.
5. Create a subscription and test the relevant retrieval and update endpoints.
6. For reminder workflows, configure the required email and scheduling credentials, then inspect the server logs and email test inbox.

Example local base URL:

```text
http://localhost:5500/api/v1
```

## Deployment

This application is intended to be deployed as a Node.js Web Service on Render.

Before deployment:

- Configure all required production environment variables in Render.
- Use a valid MongoDB Atlas connection string and allow the deployed service to connect to the database.
- Set the production server URL to the deployed Render URL.
- Configure production email and workflow credentials.
- Verify that the server listens on the port supplied by Render.
- Test authentication, subscription operations, and renewal reminders against the deployed API.

Never store production credentials in this repository.

## Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | HTTP server port |
| `NODE_ENV` | Runtime environment |
| `SERVER_URL` | Base URL of the application |
| `DB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used for JWT signing |
| `JWT_EXPIRES_IN` | JWT expiration duration |
| `QSTASH_DEV` | Development-mode setting for workflow scheduling |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASSWORD` | SMTP password |

Additional variables may be required by the production workflow configuration. Check `config/upstash.js` before deploying.

## Security

- Keep `.env.development.local` and other secret-bearing files out of Git.
- Use a strong, unique JWT secret.
- Use secure credentials for MongoDB and SMTP.
- Do not expose database credentials or authentication tokens in logs, screenshots, or public documentation.

## License

Add a license before redistributing this project if you intend to make it available for reuse.
