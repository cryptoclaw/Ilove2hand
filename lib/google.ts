// lib/google.ts
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
// คุณเลือกวิธี A แล้ว => ใช้ GOOGLE_OAUTH_REDIRECT
const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT!;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  throw new Error('Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT');
}

export function getGoogleClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export function getGoogleAuthUrl(state: string) {
  const client = getGoogleClient();
  const scopes = ['openid', 'email', 'profile'];
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
    state,
  });
}
