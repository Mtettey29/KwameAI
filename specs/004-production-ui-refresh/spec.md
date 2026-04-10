# Spec: Elevate Login and Dashboard Into a Production-Ready Finance Experience

## Problem
The app now has the right product flow, but the visual execution still needs to feel like a polished finance product rather than an internal demo. The login and dashboard surfaces should look intentional, branded, and deployment-ready.

## Requirements
- The login page must use a dedicated product-auth layout instead of a plain form.
- The post-login experience must use a dashboard shell with navigation, strong hierarchy, and a light/dark theme toggle.
- The language in the UI must avoid calling the app a prototype.
- The design should preserve the existing Firebase login flow and wallet-consent workflow.
- The repo must capture the UI refresh in the spec trail.

## Acceptance Criteria
- The login page is visually distinct, branded, and production-oriented.
- The authenticated workspace uses a dashboard shell rather than a single stacked page.
- A light/dark toggle works across the main interface.
- The trust and consent flows still function after the redesign.
