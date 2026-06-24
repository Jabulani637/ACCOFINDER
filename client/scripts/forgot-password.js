/**
 * forgot-password.js
 *
 * Two-step password reset flow (localStorage-based):
 *  Step 1 – Verify email exists in accofinder_accounts[]
 *  Step 2 – Set a new password, update the account record, redirect to login
 */

/* Redirect to home if already logged in */
requireGuest();

/* ── DOM refs ────────────────────────────────────────────────── */
const step1El       = document.getElementById('step1');
const step2El       = document.getElementById('step2');
const emailForm     = document.getElementById('emailForm');
const resetForm     = document.getElementById('resetForm');
const resetEmailEl  = document.getElementById('resetEmail');
const newPassEl     = document.getElementById('newPassword');
const confirmPassEl = document.getElementById('confirmPassword');
const matchHint     = document.getElementById('matchHint');
const step2Sub      = document.getElementById('step2Sub');
const strengthBar   = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');
const emailBtn      = document.getElementById('emailBtn');
const resetBtn      = document.getElementById('resetBtn');
const errorBanner1  = document.getElementById('errorBanner1');
const errorBanner2  = document.getElementById('errorBanner2');
const emailFieldGroup = document.getElementById('emailFieldGroup');
const emailSentMessage = document.getElementById('emailSentMessage');

/* Holds the verified email between steps */
let verifiedEmail = '';
let resetToken = '';

/* ── Helpers ─────────────────────────────────────────────────── */
function showError(bannerEl, msg) {
  bannerEl.textContent = msg;
  bannerEl.style.display = 'block';
  bannerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => { bannerEl.style.display = 'none'; }, 5000);
}

function getAccounts() {
  try { return JSON.parse(localStorage.getItem('accofinder_accounts') || '[]'); }
  catch { return []; }
}

/* ── Password Strength ───────────────────────────────────────── */
function measureStrength(pw) {
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

const STRENGTH_META = [
  { label: '',          color: 'transparent',    width: '0%'   },
  { label: 'Very weak', color: '#E8453C',        width: '20%'  },
  { label: 'Weak',      color: '#F5A623',        width: '40%'  },
  { label: 'Fair',      color: '#F5C623',        width: '60%'  },
  { label: 'Strong',    color: '#1D9E75',        width: '80%'  },
  { label: 'Very strong', color: '#0d6b50',      width: '100%' },
];

newPassEl?.addEventListener('input', () => {
  const score = measureStrength(newPassEl.value);
  const meta  = STRENGTH_META[score];
  strengthBar.style.width = meta.width;
  strengthBar.style.background = meta.color;
  strengthLabel.textContent = meta.label;
  strengthLabel.style.color  = meta.color;
  checkMatch();
});

confirmPassEl?.addEventListener('input', checkMatch);

function checkMatch() {
  const ok = newPassEl.value === confirmPassEl.value;
  matchHint.style.display = confirmPassEl.value.length > 0 && !ok ? 'block' : 'none';
  return ok;
}

/* ── Show / Hide Password Toggles ────────────────────────────── */


function wireEye(btnId, inputEl, iconEl) {
  document.getElementById(btnId)?.addEventListener('click', () => {
    const showing = inputEl.type === 'text';
    inputEl.type = showing ? 'password' : 'text';

    const iconSpan = document.getElementById(iconEl);
    if (!iconSpan) return;

    iconSpan.textContent = showing ? 'visibility_off' : 'visibility';
  });
}


wireEye('toggleNew',     newPassEl,     'eyeIconNew');
wireEye('toggleConfirm', confirmPassEl, 'eyeIconConfirm');

/* ── STEP 1: Verify Email & Send Link ────────────────────────── */
emailForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = resetEmailEl.value.trim().toLowerCase();

  if (!email) {
    showError(errorBanner1, 'Please enter your email address.');
    return;
  }

  const accounts = getAccounts();
  const match    = accounts.find(u => u.email === email);

  if (!match) {
    showError(errorBanner1, 'No account found with that email address. Please check and try again, or register a new account.');
    return;
  }

  /* Generate a secure-looking token and save it to localStorage */
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes
  
  const resetData = { email, token, expiry };
  localStorage.setItem('accofinder_reset', JSON.stringify(resetData));

  /* Construct the reset link */
  const resetLink = `${window.location.origin}${window.location.pathname}?token=${token}`;

  /* Call Python backend to send email */
  emailBtn.textContent = 'Sending email...';
  emailBtn.disabled = true;

  try {
    const response = await fetch('http://127.0.0.1:8000/api/send-reset-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, reset_link: resetLink })
    });

    if (!response.ok) throw new Error('Failed to send email');

    /* Show success message to user */
    emailFieldGroup.style.display = 'none';
    emailBtn.style.display = 'none';
    emailSentMessage.style.display = 'block';
  } catch (err) {
    console.error(err);
    showError(errorBanner1, 'Failed to send the reset email. Ensure the backend server is running.');
    emailBtn.textContent = 'Send Reset Link';
    emailBtn.disabled = false;
  }
});

/* ── Check URL for Token on Load ─────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');

  if (urlToken) {
    try {
      const resetData = JSON.parse(localStorage.getItem('accofinder_reset'));
      if (resetData && resetData.token === urlToken) {
        if (Date.now() > resetData.expiry) {
          showError(errorBanner1, 'This reset link has expired. Please request a new one.');
          return;
        }

        // Token valid! Show Step 2
        verifiedEmail = resetData.email;
        step1El.style.display  = 'none';
        step2El.style.display  = '';
        step2Sub.textContent = `Setting a new password for ${verifiedEmail}`;
        newPassEl.focus();
      } else {
        showError(errorBanner1, 'Invalid reset link.');
      }
    } catch {
      showError(errorBanner1, 'Invalid reset link.');
    }
  }
});

/* ── STEP 2: Reset Password ──────────────────────────────────── */
resetForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const newPw     = newPassEl.value;
  const confirmPw = confirmPassEl.value;

  if (newPw.length < 6) {
    showError(errorBanner2, 'Password must be at least 6 characters.');
    return;
  }

  if (newPw !== confirmPw) {
    showError(errorBanner2, 'Passwords do not match. Please re-enter them.');
    confirmPassEl.focus();
    return;
  }

  /* Update the account record */
  const accounts = getAccounts();
  const idx = accounts.findIndex(u => u.email === verifiedEmail);
  if (idx === -1) {
    showError(errorBanner2, 'Something went wrong. Please start again.');
    return;
  }

  accounts[idx].password = newPw;
  localStorage.setItem('accofinder_accounts', JSON.stringify(accounts));
  localStorage.removeItem('accofinder_reset'); // clear the token

  /* Success animation then redirect */
  resetBtn.textContent = 'Password updated! Redirecting…';
  resetBtn.disabled    = true;

  setTimeout(() => {
    window.location.href = 'login.html?reset=1';
  }, 1000);
});
