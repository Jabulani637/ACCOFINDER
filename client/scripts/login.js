(() => {
  const form        = document.getElementById("loginForm");
  const emailEl     = document.getElementById("email");
  const passEl      = document.getElementById("password");
  const errorBanner = document.getElementById("errorBanner");
  const submitBtn   = document.getElementById("submitBtn");

  function showError(msg) { if (errorBanner) { errorBanner.textContent = msg; errorBanner.style.display = "block"; } }
  function hideError()    { if (errorBanner) errorBanner.style.display = "none"; }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: emailEl.value.trim(), password: passEl.value }),
      });
      const data = await res.json();
      if (!res.ok) return showError(data.detail || "Login failed.");

      saveSession(data);
      const role = data.user.role;
      window.location.href = role === "admin" ? "admin.html" : role === "owner" ? "dashboard.html" : "home.html";
    } catch {
      showError("Could not connect to server.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
    }
  });
})();
