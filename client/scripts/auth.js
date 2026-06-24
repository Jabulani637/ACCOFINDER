/**
 * auth.js – shared authentication helpers (localStorage-based)
 * Include this on every protected page via:  <script src="scripts/auth.js"></script>
 */

const AUTH_KEY = 'accofinder_user';

/** Save a user session */
function saveSession(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

/** Get the current logged-in user (or null) */
function getSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

/** Clear the session (logout) */
function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

/** Guard: call on protected pages – redirects to login if not logged in */
function requireAuth() {
  if (!getSession()) {
    window.location.replace('login.html');
  }
}

/** Guard: call on auth pages – redirects to home if already logged in */
function requireGuest() {
  if (getSession()) {
    window.location.replace('home.html');
  }
}
