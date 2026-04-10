# Spec: Add Firebase Phone Authentication Before Consent

## Problem
The prototype now has a consent-led MoMo flow, but it still assumes a user can directly begin the consent request. The product should first authenticate the person entering the app using their phone number, then allow the MoMo-access approval flow to begin.

## Requirements
- The frontend must support Firebase phone authentication as the primary login step.
- The authentication step must happen before a user can request MoMo consent approval.
- The implementation must use Firebase Web SDK phone auth patterns, including reCAPTCHA setup.
- The app must remain usable in development when Firebase environment variables are not configured by showing a clear configuration state instead of crashing.
- The existing consent flow must remain intact after authentication succeeds.

## Acceptance Criteria
- When Firebase is configured, a user can enter a phone number and request a login OTP.
- A user can enter the Firebase OTP and complete sign-in.
- After successful sign-in, the existing consent-led MoMo flow becomes available.
- When Firebase is not configured, the app shows a clear setup message instead of a broken auth flow.
- The repo includes spec, plan, and tasks files for this integration.
