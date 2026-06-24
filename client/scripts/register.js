(() => {
  const form        = document.getElementById("registerForm");
  const passEl      = document.getElementById("password");
  const confirmEl   = document.getElementById("confirmPassword");
  const hintEl      = document.getElementById("passwordHint");
  const errorBanner = document.getElementById("errorBanner");
  const submitBtn   = document.getElementById("submitBtn");

  function showError(msg) { if (errorBanner) { errorBanner.textContent = msg; errorBanner.style.display = "block"; } }
  function hideError()    { if (errorBanner) errorBanner.style.display = "none"; }
  const checkPasswords = () => { const ok = passEl.value === confirmEl.value; if (hintEl) hintEl.style.display = ok ? "none" : "block"; return ok; };

  passEl?.addEventListener("input", checkPasswords);
  confirmEl?.addEventListener("input", checkPasswords);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    if (!checkPasswords()) return confirmEl.focus();

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: document.getElementById("firstName").value.trim(),
          last_name:  document.getElementById("lastName").value.trim(),
          email:      document.getElementById("email").value.trim(),
          password:   passEl.value,
          phone:      document.getElementById("phone").value.trim(),
          role:       document.getElementById("role").value,
          gender:     document.getElementById("gender").value,
          city:       document.getElementById("city").value,
        }),
      });
      const data = await res.json();
      if (!res.ok) return showError(data.detail || "Registration failed.");

      saveSession(data);
      window.location.href = "home.html";
    } catch {
      showError("Could not connect to server. Is the backend running?");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });
})();
