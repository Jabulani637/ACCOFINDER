// Lightweight UX validation for login page.
(() => {
  const form = document.getElementById('loginForm');
  const emailEl = document.getElementById('email');
  const passwordEl = document.getElementById('password');

  form?.addEventListener('submit', (e) => {
    if (emailEl && !emailEl.value) {
      e.preventDefault();
      emailEl.focus();
      return;
    }
    if (passwordEl && !passwordEl.value) {
      e.preventDefault();
      passwordEl.focus();
      return;
    }
  });
})();

