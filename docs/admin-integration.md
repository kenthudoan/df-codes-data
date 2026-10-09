# Giftcode Admin Dashboard — integration plan

This branch stages the advanced GitHub-authenticated giftcode admin dashboard for `kenthudoan/df-codes-data`.

## Safety rules

- Preserve existing `codes.json`, `expired.json`, and refresh workflows on `main`.
- Require GitHub sign-in, an explicit administrator allowlist, and repository write permission.
- Perform mutations through reviewed Pull Requests rather than editing `main` directly.
- Run validation against the actual feed format before proposing any update.
- Keep OAuth tokens server-side. Never embed secrets in GitHub Pages or client JavaScript.
- Treat `safe` as community verification, not proof of availability for every account.
- Do not assign fabricated expiration dates or publish users' redemption history.

## Status

This is an initial **connection/write verification commit**, not the deployed admin dashboard. The application source still needs to be integrated and reviewed, followed by live OAuth, Cloudflare Worker, and end-to-end PR-flow tests. Do not merge as a completed implementation.
