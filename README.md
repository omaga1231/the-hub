# The Hub — Academic Collaboration Platform

A full-stack web application for students to connect around courses, share study resources, and build study communities across colleges.

> **Project status:** This repository contains application code and deployment documentation. Running the application requires a configured Firebase project. Deployment and end-to-end functionality have not been independently verified as part of this documentation update.

## What the application does

The codebase includes interfaces and API functionality for:

- Browsing colleges and courses and viewing course details
- Sharing course ratings, reviews, and study resources
- Creating and participating in course-specific study circles
- Discussion posts and real-time messaging using WebSockets
- Account sign-in and registration with Firebase Authentication
- Administrative tools for managing course and college information

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Wouter, TanStack Query |
| Backend | Node.js, Express, TypeScript, WebSockets |
| Data and validation | Firebase Firestore, Zod, shared TypeScript schemas |
| Authentication | Firebase Authentication and Firebase Admin SDK |

## Repository structure

```text
client/          React frontend and application pages
server/          Express API, authentication, storage, and WebSocket handling
shared/          Shared data models and validation schemas
scripts/         Data migration and development scripts
ADMIN_GUIDE.md   Administration workflows
FIREBASE_SETUP.md  Firebase configuration instructions
DEPLOYMENT.md    Deployment options and environment setup
```

## Running locally

**Requirements:** Node.js 18+ and a Firebase project configured for the application's authentication and data features.

1. Clone this repository.
2. Run `npm install`.
3. Configure the required Firebase client and server environment variables, following the existing [Firebase setup guide](FIREBASE_SETUP.md). **Never commit service-account private keys or local `.env` files.**
4. Run `npm run dev` to start the development application.

Other available scripts:

```bash
npm run check   # TypeScript check
npm run build   # Build the frontend and backend
npm run start   # Start the production build
```

For deployment information, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Technical areas demonstrated

- Component-based frontend development with TypeScript
- REST API routes, request validation, and authentication middleware
- Database-backed data models and study-community workflows
- Client-server integration and real-time communication

## Development notes

The repository includes earlier Replit-specific configuration and deployment documentation. Some setup instructions depend on project-specific services and should be reviewed before public deployment.

This README summarizes functionality visible in the source code and existing project documentation; it is not a claim that all features have been tested in production.
