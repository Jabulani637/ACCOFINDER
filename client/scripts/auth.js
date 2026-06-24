const API_URL = "http://127.0.0.1:8000";
// Change to your Render URL once deployed:
// const API_URL = "https://accofinder-api.onrender.com";

function saveSession(data) {
  localStorage.setItem("token", data.access_token);
  const u = data.user;
  const session = {
    id:        u.id,
    firstName: u.first_name,
    lastName:  u.last_name,
    email:     u.email,
    phone:     u.phone,
    role:      u.role,
    gender:    u.gender,
    city:      u.city,
  };
  localStorage.setItem("user", JSON.stringify(session));
}

function getSession() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

function getUser()  { return getSession(); }
function getToken() { return localStorage.getItem("token"); }

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "login.html";
  }
}
