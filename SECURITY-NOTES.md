# Security changes, September 16 2026

What was found in the original build, and what changed. Keep this file. If
something in the app misbehaves around permissions, the cause is probably here.

## 1. Firestore was open to the entire internet

**Before.** Every rule in `firestore.rules` read `allow read, write: if true`.
The file defined `isOwner()` and `isAdmin()` helpers at the top and then never
used them, which looks like scaffolding that never got tightened.

Your Firebase project ID ships inside the public JavaScript bundle, by design.
So anyone who viewed source could connect straight to the database and read or
modify every shop, user, call record and audit, without touching the app at all.
They could also delete all of it.

**After.** Rules deny by default. The browser can now only:

- read `settings/app` (needed to render the site, including signed out)
- read its own `users/{uid}` document
- read the one shop its user record points at
- read that shop's calls, and update only the `handled` and `handledAt` fields

Everything else is denied to browsers. The server reaches the rest through the
Admin SDK, which bypasses rules by design.

## 2. Admin access was self-declared

**Before.** `checkAdminAuth()` read an email out of the query string, request
body, or an `x-admin-email` header, and compared it to an allow-list. The caller
simply stated who they were.

    GET /api/admin/shops?adminEmail=AleshaTaylor1@gmail.com

returned every shop to anybody. That admin address is also sitting in plaintext
in `.env.example` and in the old `firestore.rules`.

**After.** `requireAdmin()` reads a Firebase ID token from the `Authorization`
header and verifies it against Firebase. Tokens are signed by Google and cannot
be forged. Nine admin routes now use it.

On the client, `src/lib/authFetch.ts` attaches that token. Any call to a
protected endpoint must go through `authFetch` rather than plain `fetch`.

## 3. Signup let you hand yourself the admin role

**Before.** `/api/auth/complete-signup` took `uid` and `email` from the request
body, then set `role: 'admin'` if the email matched the allow-list. Posting an
admin email created an admin account.

**After.** Both come from the verified token. The body values are ignored.

## 4. A shared secret was hardcoded in source

**Before.** `server/routes.ts` fell back to the literal string
`autointel-shared-n8n-secret-key-2025` when the env var was missing. That would
have been committed to the repo.

**After.** Removed. If `N8N_SHARED_SECRET` is unset, `/api/intake/*` returns
503 and logs why, rather than accepting a publicly known value.

## 5. The server used the client SDK

**Before.** `server/firebaseAdmin.ts` used the browser `firebase` package, so
the backend was subject to the same rules as the browser. This is why the rules
had to be wide open for anything to work. `adminAuth.verifyIdToken()` was a stub
returning `null`.

**After.** Rewritten on `firebase-admin` with a service account, so rules can be
strict without breaking the server. `verifyIdToken` is real.

Initialization is lazy, on first use. `vite.config.ts` imports the API router so
the dev server can serve `/api`, which means a plain frontend build loads this
module too. Failing at import time would break `npm run build` on any machine
without credentials.

## Verified

Ran against the live server with no valid token:

| Request | Result |
|---|---|
| `GET /api/health` | 200 |
| `GET /api/admin/shops?adminEmail=<admin>` | 401 |
| `GET /api/admin/shops` with `x-admin-email` | 401 |
| `POST /api/admin/settings` with admin email in body | 401 |
| `GET /api/admin/shops` with a junk bearer token | 401 |
| `POST /api/intake/test` with the old hardcoded secret | 503 |
| `POST /api/auth/complete-signup` claiming an admin email | 401 |

Typecheck passes, production build succeeds.

## Still outstanding

- **Deploy the new Firestore rules.** Editing `firestore.rules` changes nothing
  until it is pushed. In the Firebase console go to Firestore, Rules, paste the
  file, Publish. **The app is still exposed until this is done.**
- **Rotate the n8n shared secret.** The old value was in source, so treat it as
  public. Generate a new one and set it in both places.
- **Audit existing data.** The database was open for as long as it was
  deployed. Worth a look for records you do not recognise.
- `@google/genai` is installed but never imported, and `GEMINI_API_KEY` is
  unused. Dead weight, harmless.
- The JS bundle is 1.3MB uncompressed, 318KB gzipped. Fine for now, worth
  code-splitting before it grows much more.
