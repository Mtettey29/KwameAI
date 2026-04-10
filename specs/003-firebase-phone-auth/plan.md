# Plan: Add Firebase Phone Authentication Before Consent

## Design
- Keep authentication and consent as separate stages:
  1. Firebase phone login
  2. MoMo consent request
  3. OTP approval for wallet access
  4. Trust workspace
- Add a small Firebase bootstrap module driven entirely by Vite environment variables.
- Use `RecaptchaVerifier` and `signInWithPhoneNumber` in the frontend login stage.
- Track the Firebase authenticated user locally in app state and only reveal the consent UI after sign-in.
- Preserve the current backend API because app login and wallet consent are separate concerns.

## Non-Goals
- Server-side Firebase Admin verification in this iteration.
- Replacing the existing prototype consent OTP with Hubtel yet.
- Full production auth persistence and route protection.

## Verification
- Frontend build succeeds with Firebase SDK installed.
- The app renders a clear missing-config state when Firebase env vars are absent.
- The authenticated UI path can advance into the existing consent flow after phone login.
