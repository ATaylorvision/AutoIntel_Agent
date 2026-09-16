import { auth } from './firebase.ts';

/**
 * fetch() that proves who you are.
 *
 * Attaches the signed-in user's Firebase ID token as a Bearer token. The server
 * verifies that token against Firebase, so identity cannot be faked by editing
 * a query string or request body.
 *
 * Use this for every call to an endpoint that should be restricted. Plain
 * fetch() is fine for genuinely public endpoints such as the missed-call audit.
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You need to be signed in to do that.');
  }

  // Firebase refreshes this automatically when it is close to expiring.
  const token = await user.getIdToken();

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, { ...init, headers });
}
