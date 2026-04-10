# Spec: Reframe Beyond the Wallet Around Consent-Led Alternative Credit

## Problem
The current frontend renders a generic vendor dashboard, but the product brief is stronger than that. Beyond the Wallet should feel like an AI-powered finance product for informal workers and vendors who lack formal credit history. The first interaction should establish what the product does, collect a phone number, obtain explicit consent to analyze MoMo activity, and then translate that data into a trust score and actionable financial guidance.

## Requirements
- The frontend must present Beyond the Wallet as an AI-driven alternative credit and savings product, not just a raw dashboard.
- The UI must use a shadcn-style component system and feel intentional, modern, and product-focused.
- The primary journey must begin with a phone number input and a consent request flow before showing financial insights.
- The backend must support a prototype consent flow where a phone number can request access, receive an OTP-style approval code, and verify that approval before financial data is shown.
- The frontend must clearly separate these states:
  - pre-consent onboarding
  - approval pending
  - approved insights
  - failure or expired approval
- The approved experience must explain the trust score, show recent MoMo behavior, and make room for future AI recommendations and savings automation.
- The product copy and layout must reflect the informal finance use case in West Africa.

## Acceptance Criteria
- A new visitor lands on a product page that explains the problem and positions Beyond the Wallet as an AI finance tool for informal workers.
- A visitor can submit a telephone number and create a consent request.
- The system returns a prototype approval path that simulates sending an OTP to the contact and allows verification in the UI.
- The dashboard only appears after approval is verified.
- The approved screen shows:
  - trust score
  - rationale
  - suggested loan limit
  - recent transactions
  - at least one savings or improvement recommendation
- The repo includes a new spec, plan, and task list for this redesign.
