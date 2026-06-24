/** profile.js – profile page logic */

requireAuth();

const user = getSession();

const $ = (sel, ctx = document) => ctx.querySelector(sel);

// User greeting
if (user) {
  $('#userGreeting') && ($('#userGreeting').textContent = user.firstName || (user.email || '').split('@')[0]);

  const profileName = $('#profileName');
  const profileEmail = $('#profileEmail');
  const profileRole = $('#profileRole');
  const profileCity = $('#profileCity');
  const profileInitials = $('#profileInitials');
  const profileRole2 = $('#profileRole2');

  if (profileName) profileName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  if (profileEmail) profileEmail.textContent = user.email;
  if (profileRole) profileRole.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';
  if (profileRole2) profileRole2.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';
  if (profileCity) profileCity.textContent = user.city || '—';
  if (profileInitials) {
    const initials = `${(user.firstName || '?')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase();
    profileInitials.textContent = initials;
  }
}

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

function getSavedListings() {
  try { return JSON.parse(localStorage.getItem('accofinder_saved') || '[]'); }
  catch { return []; }
}

// Logout
$('#logoutBtn')?.addEventListener('click', () => {
  clearSession();
  window.location.href = 'login.html';
});

$('#profileLogoutBtn')?.addEventListener('click', () => {
  clearSession();
  window.location.href = 'login.html';
});

// Saved listings button
$('#viewSavedBtn')?.addEventListener('click', () => {
  const saved = getSavedListings();
  if (saved.length === 0) {
    showToast('You have no saved listings yet. Click Save on any listing!');
    return;
  }

  // LISTINGS is defined on home page via scripts/listings.js.
  // If it is not available here, fall back to IDs.
  const listings = window.LISTINGS || [];
  const names = saved
    .map(id => {
      const l = listings.find(x => x.id === id);
      return l ? `• ${l.name} – ${l.price}` : null;
    })
    .filter(Boolean)
    .join('\n');

  // Fix: remove intrusive alert dialogs on profile page.
  // Details are shown as a toast (custom modal can be added later).
  showToast(`Your saved listings are ready. (${saved.length})`);
});

// Applications
$('#viewApplicationsBtn')?.addEventListener('click', () => {
  const apps = JSON.parse(localStorage.getItem('accofinder_applications') || '[]');
  if (apps.length === 0) {
    showToast('No applications submitted yet. Apply to a listing first!');
    return;
  }

  // Fix: remove intrusive alert dialogs on profile page.
  // If LISTINGS is present, we could render the full list later in a modal.
  showToast(`Your applications are ready. (${apps.length})`);
});

// Keep search button non-breaking
$('#searchNavBtn')?.addEventListener('click', () => {
  showToast('Search coming soon!');
});

