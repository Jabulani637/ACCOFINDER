/**
 * login.js – handles sign-in form, validates credentials from localStorage,
 *            creates session, then redirects to home.html
 */

// Redirect to home if already logged in
requireGuest();

const form        = document.getElementById('loginForm');
const submitBtn   = document.getElementById('submitBtn');
const errorBanner = document.getElementById('errorBanner');

form?.addEventListener('submit', (e) => {
  e.preventDefault();

  const email    = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  const accounts = JSON.parse(localStorage.getItem('accofinder_accounts') || '[]');
  const user     = accounts.find(u => u.email === email && u.password === password);

  if (!user) {
    showError('Incorrect email or password. Please try again.');
    return;
  }

  // Save session (omit password from session)
  const { password: _pw, ...sessionUser } = user;
  saveSession(sessionUser);

  // Show success then redirect
  submitBtn.textContent = 'Signing in…';
  submitBtn.disabled = true;
  setTimeout(() => {
    window.location.href = 'home.html';
  }, 800);
});

function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.style.display = 'block';
  setTimeout(() => { errorBanner.style.display = 'none'; }, 4000);
}
