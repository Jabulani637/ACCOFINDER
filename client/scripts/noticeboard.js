/**
 * noticeboard.js – independent noticeboard (alerts) page.
 */

requireAuth();

/* ── Helpers ─────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function showToast(msg, duration = 3000) {
  let toast = document.getElementById('toastMsg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastMsg';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('toast--show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('toast--show'), duration);
}

/* ── Session: greeting + avatar (reuse same logic as home/profile) ── */
const user = getSession();
if (user) {
  const greetingEl = $('#userGreeting');
  if (greetingEl) greetingEl.textContent = user.firstName || (user.email || '').split('@')[0];
}

/* ── Logout ─────────────────────────────────────────────────── */
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  clearSession();
  window.location.href = 'login.html';
});

/* ── Search non-breaking ────────────────────────────────────── */
document.getElementById('searchNavBtn')?.addEventListener('click', () => {
  showToast('Search coming soon!');
});

/* ── Mark all read ───────────────────────────────────────────── */
document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
  $$('.alert-item.unread').forEach(el => {
    el.classList.remove('unread');
    el.querySelector('.alert-dot')?.remove();
  });
  showToast('All notifications marked as read.');
});

