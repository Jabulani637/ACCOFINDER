/**
 * register.js – handles sign-up form, stores user in localStorage,
 *               then redirects to login.html
 */

// Redirect to home if already logged in
requireGuest();

const form               = document.getElementById('registerForm');
const passwordEl         = document.getElementById('password');
const confirmPasswordEl  = document.getElementById('confirmPassword');
const passwordHint       = document.getElementById('passwordHint');
const submitBtn          = document.getElementById('submitBtn');
const errorBanner        = document.getElementById('errorBanner');

/* ── Live password-match check ──────────────────────────────── */
function checkPasswords() {
  const ok = passwordEl.value === confirmPasswordEl.value;
  passwordHint.style.display = ok ? 'none' : 'block';
  return ok;
}
passwordEl?.addEventListener('input', checkPasswords);
confirmPasswordEl?.addEventListener('input', checkPasswords);

/* ── Form submit ────────────────────────────────────────────── */
form?.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!checkPasswords()) {
    confirmPasswordEl.focus();
    return;
  }

  const email     = document.getElementById('email').value.trim().toLowerCase();
  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const role      = document.getElementById('role').value;
  const gender    = document.getElementById('gender').value;
  const city      = document.getElementById('city').value;
  const phone     = document.getElementById('phone').value.trim();
  const password  = passwordEl.value;

  // Check if email already registered
  const existing = JSON.parse(localStorage.getItem('accofinder_accounts') || '[]');
  if (existing.find(u => u.email === email)) {
    showError('An account with this email already exists. Please log in.');
    return;
  }

  // Save the new account
  const user = { firstName, lastName, email, password, role, gender, city, phone };
  existing.push(user);
  localStorage.setItem('accofinder_accounts', JSON.stringify(existing));

  // Show success state then redirect to login
  submitBtn.textContent = 'Account created! Redirecting…';
  submitBtn.disabled = true;
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
});

function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.style.display = 'block';
  setTimeout(() => { errorBanner.style.display = 'none'; }, 4000);
}
