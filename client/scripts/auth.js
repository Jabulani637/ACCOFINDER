const API_URL = "http://127.0.0.1:8000";
// ↑ Change this to your Render URL once deployed e.g:
// const API_URL = "https://accofinder-api.onrender.com";

function saveSession(data) {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
}
function getToken() { return localStorage.getItem("token"); }
function getUser()  { const u = localStorage.getItem("user"); return u ? JSON.parse(u) : null; }
function logout()   { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "login.html"; }
function requireAuth() { if (!getToken()) window.location.href = "login.html"; }
