# FCM / Ramadan Push Setup

This document explains the minimal steps to enable Firebase Cloud Messaging (FCM) push notifications, register device tokens from the frontend, and run the scheduler that sends Maghrib (Iftar) notifications.

## Backend

1. Copy `backend/.env.example` to `backend/.env` and fill values (database URL, Firebase service account, Cloudinary keys).

2. If you changed the Prisma schema, push/generate the client:

    cd backend
    npx prisma db push
    npx prisma generate

3. Install and start the backend:

    npm install
    npm run dev

4. Start the scheduler (separate process). Example:

    node backend/scripts/scheduler.ts

Notes:
- For `FIREBASE_SERVICE_ACCOUNT_PATH` provide the filesystem path to the service account JSON file. Alternatively set `FIREBASE_SERVICE_ACCOUNT_BASE64` to the base64-encoded JSON and the server will decode it.
- If you run into Prisma client generation errors on Windows (`EPERM` when renaming query engine), close any running node processes that might lock files, then retry `npx prisma generate`.

## Frontend

1. Copy `frontend/.env.example` to `frontend/.env` and fill your Firebase web config and the `VITE_FCM_VAPID_KEY` (public key used by the web push protocol).

2. Start the frontend dev server:

    cd frontend
    npm install
    npm run dev

3. The app registers `firebase-messaging-sw.js` and will request notification permission on load. Allow notifications and verify the token is registered in the backend (in the `FcmToken` table).

## Testing a push

You can send a test notification from a small Node script that uses the Firebase Admin SDK (server-side). Example snippet:

    // quick-test-send.js (run on server where admin SDK is initialized)
    const admin = require('firebase-admin');

    const message = {
      notification: { title: 'Iftar — It\'s time!', body: 'Time for Maghrib and Iftar.' },
      token: '<SOME_DEVICE_TOKEN>',
    };

    admin.messaging().send(message)
      .then(res => console.log('Sent:', res))
      .catch(err => console.error('Error sending:', err));

Or let the `backend/scripts/scheduler.ts` run and it will send multicast pushes to all stored tokens at the computed Maghrib time.

## Troubleshooting

- If notifications don't appear in the browser: ensure `firebase-messaging-sw.js` is available at `https://<host>/firebase-messaging-sw.js` (Vite serves `public/`).
- Ensure your `VITE_FCM_VAPID_KEY` is the public key from the Cloud Messaging credentials for your Firebase project.
- Check backend logs for failed `sendMulticast` responses — invalid/expired tokens will be removed by the scheduler.

## Security

- Protect any admin-only `GET /api/fcm/list` or delete endpoints behind authentication.
- Rotate service account keys if they are compromised.
