(() => {
  let selectedChannel = "email";
  let userEmail       = "";
  let verifiedCode    = "";

  const errorBanner   = document.getElementById("errorBanner");
  const successBanner = document.getElementById("successBanner");
  const dots = [document.getElementById("dot1"), document.getElementById("dot2"), document.getElementById("dot3")];

  function showError(msg)   { errorBanner.textContent = msg; errorBanner.style.display = "block"; successBanner.style.display = "none"; }
  function showSuccess(msg) { successBanner.textContent = msg; successBanner.style.display = "block"; errorBanner.style.display = "none"; }
  function clearBanners()   { errorBanner.style.display = "none"; successBanner.style.display = "none"; }
  function setLoading(btn, loading, label) { btn.disabled = loading; btn.textContent = loading ? "Please wait..." : label; }

  function goToStep(n) {
    document.querySelectorAll(".step").forEach((el, i) => el.classList.toggle("active", i + 1 === n));
    dots.forEach((d, i) => d.classList.toggle("done", i < n));
    clearBanners();
  }

  document.querySelectorAll(".channel-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".channel-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedChannel = btn.dataset.channel;
    });
  });

  const sendCodeBtn = document.getElementById("sendCodeBtn");
  sendCodeBtn.addEventListener("click", async () => {
    clearBanners();
    userEmail = document.getElementById("email").value.trim();
    if (!userEmail) return showError("Please enter your email address.");
    setLoading(sendCodeBtn, true, "Send code");
    try {
      const res  = await fetch(`${API_URL}/auth/request-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail, channel: selectedChannel }) });
      const data = await res.json();
      if (!res.ok) return showError(data.detail || "Failed to send code.");
      document.getElementById("otpSubtitle").textContent = selectedChannel === "email" ? `We sent a 6-digit code to ${userEmail}.` : `We sent a 6-digit SMS code to your phone number.`;
      goToStep(2);
      document.querySelectorAll(".otp-digit")[0].focus();
    } catch { showError("Could not connect to server."); }
    finally  { setLoading(sendCodeBtn, false, "Send code"); }
  });

  const otpDigits = Array.from(document.querySelectorAll(".otp-digit"));
  otpDigits.forEach((input, idx) => {
    input.addEventListener("input", (e) => { const val = e.target.value.replace(/\D/g, ""); e.target.value = val.slice(-1); if (val && idx < 5) otpDigits[idx + 1].focus(); });
    input.addEventListener("keydown", (e) => { if (e.key === "Backspace" && !input.value && idx > 0) otpDigits[idx - 1].focus(); });
    input.addEventListener("paste", (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
      if (pasted.length === 6) { otpDigits.forEach((d, i) => (d.value = pasted[i] || "")); otpDigits[5].focus(); e.preventDefault(); }
    });
  });

  const verifyBtn = document.getElementById("verifyBtn");
  verifyBtn.addEventListener("click", async () => {
    clearBanners();
    const code = otpDigits.map(d => d.value).join("");
    if (code.length < 6) return showError("Please enter all 6 digits.");
    setLoading(verifyBtn, true, "Verify code");
    try {
      const res  = await fetch(`${API_URL}/auth/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail, code, channel: selectedChannel }) });
      const data = await res.json();
      if (!res.ok) return showError(data.detail || "Invalid code.");
      verifiedCode = code;
      goToStep(3);
      document.getElementById("newPassword").focus();
    } catch { showError("Could not connect to server."); }
    finally  { setLoading(verifyBtn, false, "Verify code"); }
  });

  document.getElementById("resendLink").addEventListener("click", async () => {
    clearBanners();
    try {
      const res = await fetch(`${API_URL}/auth/request-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail, channel: selectedChannel }) });
      const data = await res.json();
      if (!res.ok) return showError(data.detail || "Failed to resend.");
      showSuccess("A new code has been sent.");
      otpDigits.forEach(d => (d.value = ""));
      otpDigits[0].focus();
    } catch { showError("Could not connect to server."); }
  });

  const newPassEl     = document.getElementById("newPassword");
  const confirmPassEl = document.getElementById("confirmPassword");
  const hintEl        = document.getElementById("passwordHint");
  const resetBtn      = document.getElementById("resetBtn");
  const checkPasswords = () => { const ok = newPassEl.value === confirmPassEl.value; hintEl.style.display = ok ? "none" : "block"; return ok; };
  newPassEl.addEventListener("input", checkPasswords);
  confirmPassEl.addEventListener("input", checkPasswords);

  resetBtn.addEventListener("click", async () => {
    clearBanners();
    if (!checkPasswords()) return confirmPassEl.focus();
    if (newPassEl.value.length < 6) return showError("Password must be at least 6 characters.");
    setLoading(resetBtn, true, "Reset password");
    try {
      const res  = await fetch(`${API_URL}/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail, code: verifiedCode, channel: selectedChannel, new_password: newPassEl.value }) });
      const data = await res.json();
      if (!res.ok) return showError(data.detail || "Reset failed. Please start over.");
      window.location.href = "login.html?reset=1";
    } catch { showError("Could not connect to server."); }
    finally  { setLoading(resetBtn, false, "Reset password"); }
  });
})();
