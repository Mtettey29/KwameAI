# Plan: Elevate Login and Dashboard Into a Production-Ready Finance Experience

## Design
- Introduce dedicated `auth-page` and `dashboard-with-collapsible-sidebar` UI components in the shadcn-style component tree.
- Keep the Firebase login flow on its own surface and move consent plus insights into a finance workspace shell.
- Add persisted theme state so users can switch between light and dark modes without losing context.
- Use stronger typography, gradient surfaces, and dashboard hierarchy inspired by modern fintech product patterns while keeping the copy specific to Beyond the Wallet.
- Shift the palette toward a black, blue, and white system so the product feels closer to a social-finance operating console than a warm demo dashboard.
- Make each sidebar destination render a real section instead of only changing active styles.
- Replace decorative but non-functional controls with working UI such as a real notifications panel.

## Non-Goals
- Replacing the current backend scoring model.
- Adding a full design token pipeline beyond the current Tailwind/shadcn-style setup.
- Implementing bespoke illustrations or brand photography in this iteration.

## Verification
- Frontend build passes.
- Login flow still renders reCAPTCHA and OTP entry.
- Authenticated users land in the dashboard shell.
- Consent and trust workflows still function from inside the new dashboard.
