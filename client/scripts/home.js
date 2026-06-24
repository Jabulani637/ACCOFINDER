/**
 * home.js – full interactivity for the AccoFinder home page.
 *
 * Features:
 *  - Auth guard + user greeting / avatar
 *  - Role-based UI (admin sees approval strip)
 *  - Dynamic card rendering from LISTINGS data
 *  - Filter pills (category filtering)
 *  - Tab bar switching (Home / Profile / Alerts)
 *  - Card actions: Apply (modal), View (modal), Share, Save (localStorage)
 *  - Admin: Approve / Reject listing actions
 *  - Create-bar: open post modal
 *  - Logout
 */

/* ── Guard ──────────────────────────────────────────────────── */
requireAuth();

/* ── Session ────────────────────────────────────────────────── */
const user = getSession();

/* ── Helpers ────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function getSavedListings() {
  try { return JSON.parse(localStorage.getItem('accofinder_saved') || '[]'); }
  catch { return []; }
}
function toggleSave(id) {
  const saved = getSavedListings();
  const idx = saved.indexOf(id);
  if (idx === -1) { saved.push(id); }
  else { saved.splice(idx, 1); }
  localStorage.setItem('accofinder_saved', JSON.stringify(saved));
  return idx === -1; // true = now saved
}

function getApprovedListings() {
  try { return JSON.parse(localStorage.getItem('accofinder_approved') || '{}'); }
  catch { return {}; }
}
function setApprovalState(id, state) { // state: 'approved' | 'rejected' | null
  const data = getApprovedListings();
  if (state === null) delete data[id];
  else data[id] = state;
  localStorage.setItem('accofinder_approved', JSON.stringify(data));
}

/* ── User Greeting & Avatar ─────────────────────────────────── */
if (user) {
  const greetingEl = document.getElementById('userGreeting');
  if (greetingEl) greetingEl.textContent = user.firstName || user.email.split('@')[0];

  const avatarEl = document.getElementById('userAvatar');
  if (avatarEl) {
    const initials = `${(user.firstName || '?')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase();
    avatarEl.textContent = initials;
  }

  // Also populate profile panel
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileRole = document.getElementById('profileRole');
  const profileCity = document.getElementById('profileCity');
  const profileInitials = document.getElementById('profileInitials');

  if (profileName) profileName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  if (profileEmail) profileEmail.textContent = user.email;
  if (profileRole) profileRole.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';
  if (profileCity) profileCity.textContent = user.city || '—';
  if (profileInitials) {
    profileInitials.textContent = `${(user.firstName || '?')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase();
  }
  // second role display in info card
  const profileRole2 = document.getElementById('profileRole2');
  if (profileRole2) profileRole2.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';
}

/* ── Icon helper (Material Symbols Rounded) ─────────────────── */
const AMENITY_ICON_NAMES = {
  wifi: 'wifi',
  calendar: 'event',
  location: 'location_on',
  lock: 'lock',
  meals: 'restaurant',
  laundry: 'local_laundry_service',
  parking: 'local_parking',
};

function iconSpan(iconName, ariaLabel) {
  const safeLabel = (ariaLabel || iconName || '').toString().replace(/"/g, '"');
  return `<span class="material-symbols-rounded" aria-label="${safeLabel}" role="img">${iconName}</span>`;
}

/* ── Card Renderer ───────────────────────────────────────────── */
function buildCard(listing, savedSet, approvedMap, isAdmin) {
  const saved = savedSet.has(listing.id);
  const approvalState = approvedMap[listing.id]; // 'approved' | 'rejected' | undefined
  const showApproval = isAdmin && listing.adminPending && !approvalState;

  const amenitiesHTML = listing.amenities.map(a =>
    `<div class="amenity">${iconSpan(AMENITY_ICON_NAMES[a.icon] || 'location_on', a.label)}<span>${a.label}</span></div>`
  ).join('');

  const viewsStr = listing.views ? ` · ${listing.views} view${listing.views !== 1 ? 's' : ''} today` : '';
  const appsStr = listing.applications ? `${listing.applications} applications` : '';

  const approvalHTML = showApproval ? `
    <div class="approval-strip" data-id="${listing.id}">
      <div class="approval-label">
        ${iconSpan('star', 'Admin review pending')}
        Admin review pending
      </div>
      <div class="approval-btns">
        <button class="approve-btn tick" data-approve="${listing.id}">
          ${iconSpan('check_circle', 'Approve')}
          Approve
        </button>
        <button class="approve-btn cross" data-reject="${listing.id}">
          ${iconSpan('cancel', 'Reject')}
          Reject
        </button>
      </div>
    </div>` : '';

  const approvedBadge = approvalState === 'approved'
    ? `<div class="admin-stamp stamp-approved">✓ Approved by admin</div>`
    : approvalState === 'rejected'
    ? `<div class="admin-stamp stamp-rejected">✗ Rejected by admin</div>`
    : '';

  const verifiedBadge = listing.verified
    ? `<span class="verified-badge">
        ${iconSpan('verified', 'Verified')}
        Verified</span>`
    : '';

  const saveIconName = saved ? 'bookmark' : 'bookmark_border';

  return `
  <article class="card" data-id="${listing.id}" data-categories="${listing.categories.join(' ')}">
    <div class="card-header">
      <div class="card-meta">
        <div class="prop-avatar" style="${listing.avatarStyle}">${listing.initial}</div>
        <div>
          <div class="prop-name">${listing.name}</div>
          <div class="prop-sub">
            <span>${listing.postedAgo} · ${listing.location}</span>
            ${verifiedBadge}
          </div>
        </div>
      </div>
      <button class="more-btn" aria-label="More options" data-more="${listing.id}">
        ${iconSpan('more_horiz', 'More options')}
      </button>
    </div>

    <div class="card-desc">
      <span class="card-desc-text">${listing.description.slice(0, 120)}</span>
      <span class="card-desc-full" style="display:none">${listing.description}</span>
      ${listing.description.length > 120 ? `<span class="see-more" data-expand="${listing.id}">See more</span>` : ''}
    </div>

    <div class="card-tags">
      <span class="tag price">${listing.price}</span>
      <span class="tag type">${listing.type}</span>
      <span class="tag dist">${listing.distance}</span>
      <span class="tag rooms">${listing.rooms}</span>
    </div>

    <div class="card-photos">
      <div class="main-photo">
        <div class="photo-img" style="background:${listing.photoGradient}; font-size:52px;">${listing.photoEmoji}</div>
      </div>
      <div class="side-photos">
        <div class="side-photo">
          <div class="photo-img" style="background:${listing.photoSide1Bg}; font-size:28px;">${listing.photoSide1Emoji}</div>
        </div>
        <div class="side-photo">
          <div class="photo-img" style="background:${listing.photoSide2Bg}; font-size:22px;">${listing.photoSide2Emoji}</div>
          <div class="photo-count-overlay">+${listing.photoExtra}</div>
        </div>
      </div>
    </div>

    <div class="amenities">${amenitiesHTML}</div>

    ${approvalHTML}
    ${approvedBadge}

    <div class="card-stats">
      <div class="reaction-faces">
        <div class="reaction-face" style="background:#E7F0FD; font-size:10px;">👍</div>
        <div class="reaction-face" style="background:#E1F5EE; font-size:10px;">❤️</div>
        <div class="reaction-face" style="background:#FFF3E0; font-size:10px;">🔥</div>
        <span class="react-count">${listing.interested} interested</span>
      </div>
      <div class="stat-right">${appsStr}${viewsStr}</div>
    </div>

    <div class="card-actions">
      <button class="card-action apply-btn" data-apply="${listing.id}" title="Apply for this accommodation">
        ${iconSpan('edit_document', 'Apply')}
        Apply
      </button>
      <button class="card-action view-btn" data-view="${listing.id}" title="View full listing">
        ${iconSpan('visibility', 'View listing details')}
        View
      </button>
      <button class="card-action share-btn" data-share="${listing.id}" title="Share this listing">
        ${iconSpan('share', 'Share listing')}
        Share
      </button>
      <button class="card-action save-btn ${saved ? 'saved' : ''}" data-save="${listing.id}" title="${saved ? 'Unsave' : 'Save'}">
        ${iconSpan(saveIconName, saved ? 'Unsave' : 'Save')}
        ${saved ? 'Saved' : 'Save'}
      </button>
    </div>
  </article>`;
}

/* ── Initial Render ──────────────────────────────────────────── */
const feedContainer = document.getElementById('feedCards');
const isAdmin = user?.role === 'admin';

function renderCards(category = 'all') {
  if (!feedContainer) return;
  const savedSet = new Set(getSavedListings());
  const approvedMap = getApprovedListings();
  const filtered = LISTINGS.filter(l => l.categories.includes(category));

  if (filtered.length === 0) {
    feedContainer.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🏠</div>
      <div class="empty-title">No listings found</div>
      <div class="empty-sub">Try a different filter category.</div>
    </div>`;
    return;
  }

  feedContainer.innerHTML = filtered.map(l => buildCard(l, savedSet, approvedMap, isAdmin)).join('');
}

renderCards();

/* ── Filter Pills ────────────────────────────────────────────── */
const filterStrip = document.querySelector('.filter-strip');
if (filterStrip) {
  filterStrip.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    $$('.filter-pill', filterStrip).forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    renderCards(pill.dataset.category || 'all');
  });
}

/* ── Tab Switching ───────────────────────────────────────────── */
const tabBar = document.querySelector('.tab-bar');
const panels = {
  home:    document.getElementById('panelHome'),
  alerts:  document.getElementById('panelAlerts'),
};
if (tabBar) {
  tabBar.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;

    // Profile and Alerts are now separate pages
    if (tab.dataset.panel === 'profile') {
      window.location.href = 'profile.html';
      return;
    }
    if (tab.dataset.panel === 'alerts') {
      window.location.href = 'noticeboard.html';
      return;
    }

    $$('.tab', tabBar).forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const target = tab.dataset.panel;
    Object.entries(panels).forEach(([key, el]) => {
      if (!el) return;
      el.style.display = key === target ? '' : 'none';
    });
  });
}


/* ── Card Interactions (delegated) ───────────────────────────── */
document.addEventListener('click', (e) => {

  /* Apply */
  const applyBtn = e.target.closest('[data-apply]');
  if (applyBtn) {
    const id = applyBtn.dataset.apply;
    const listing = LISTINGS.find(l => l.id === id);
    if (!listing) return;
    const titleEl = document.getElementById('applyModalTitle');
    const subEl   = document.getElementById('applyModalSub');
    const hiddenId = document.getElementById('applyListingId');
    if (titleEl) titleEl.textContent = `Apply – ${listing.name}`;
    if (subEl)   subEl.textContent   = `${listing.type} · ${listing.price} · ${listing.location}`;
    if (hiddenId) hiddenId.value     = id;
    // Pre-fill applicant info
    const nameField = document.getElementById('applyName');
    const emailField = document.getElementById('applyEmail');
    if (nameField && user) nameField.value = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (emailField && user) emailField.value = user.email || '';
    openModal('applyModal');
    return;
  }

  /* View */
  const viewBtn = e.target.closest('[data-view]');
  if (viewBtn) {
    const id = viewBtn.dataset.view;
    const listing = LISTINGS.find(l => l.id === id);
    if (!listing) return;
    const nameEl  = document.getElementById('viewModalName');
    const bodyEl  = document.getElementById('viewModalBody');
    if (nameEl) nameEl.textContent = listing.name;
    if (bodyEl) bodyEl.innerHTML = `
      <div class="view-photo" style="background:${listing.photoGradient}; font-size:72px; height:160px; display:flex; align-items:center; justify-content:center; border-radius:12px; margin-bottom:16px;">${listing.photoEmoji}</div>
      <div class="view-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
        <span class="tag price">${listing.price}</span>
        <span class="tag type">${listing.type}</span>
        <span class="tag dist">${listing.distance}</span>
        <span class="tag rooms">${listing.rooms}</span>
        ${listing.verified ? '<span class="tag" style="background:var(--teal-light);color:var(--teal-dark);">✓ Verified</span>' : ''}
      </div>
      <p style="font-size:14px;line-height:1.6;color:var(--text-sec);margin-bottom:16px;">${listing.description}</p>
      <div class="amenities" style="padding:0;margin-bottom:16px;">${listing.amenities.map(a => `<div class="amenity">${iconSpan(AMENITY_ICON_NAMES[a.icon] || 'location_on', a.label)}<span>${a.label}</span></div>`).join('')}</div>
      <div style="font-size:13px;color:var(--text-sec);">📍 ${listing.location} &nbsp;·&nbsp; Posted ${listing.postedAgo}</div>
    `;
    openModal('viewModal');
    return;
  }

  /* Share */
  const shareBtn = e.target.closest('[data-share]');
  if (shareBtn) {
    const id = shareBtn.dataset.share;
    const listing = LISTINGS.find(l => l.id === id);
    if (!listing) return;
    const shareData = {
      title: `AccoFinder – ${listing.name}`,
      text: `${listing.type} in ${listing.location} for ${listing.price}. ${listing.description.slice(0, 80)}…`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
        .then(() => showToast('Link copied to clipboard!'))
        .catch(() => showToast('Could not copy link.'));
    }
    return;
  }

  /* Save / Unsave */
  const saveBtn = e.target.closest('[data-save]');
  if (saveBtn) {
    const id = saveBtn.dataset.save;
    const nowSaved = toggleSave(id);
    saveBtn.classList.toggle('saved', nowSaved);

    const iconEl = saveBtn.querySelector('.material-symbols-rounded');
    if (iconEl) iconEl.textContent = nowSaved ? 'bookmark' : 'bookmark_border';

    const labelNode = [...saveBtn.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0);
    if (labelNode) labelNode.textContent = nowSaved ? 'Saved' : 'Save';

    // Fallback: update last text node if above didn't work
    const lastTextNode = [...saveBtn.childNodes].reverse().find(n => n.nodeType === Node.TEXT_NODE);
    if (lastTextNode) lastTextNode.textContent = ` ${nowSaved ? 'Saved' : 'Save'}`;

    showToast(nowSaved ? 'Listing saved!' : 'Listing removed from saved.');
    return;
  }

  /* See more (expand description) */
  const seeMore = e.target.closest('[data-expand]');
  if (seeMore) {
    const card = seeMore.closest('.card');
    if (!card) return;
    const short = card.querySelector('.card-desc-text');
    const full  = card.querySelector('.card-desc-full');
    if (short && full) {
      short.style.display = 'none';
      full.style.display = 'inline';
      seeMore.remove();
    }
    return;
  }

  /* Admin: Approve */
  const approveBtn = e.target.closest('[data-approve]');
  if (approveBtn) {
    const id = approveBtn.dataset.approve;
    setApprovalState(id, 'approved');
    rerenderCard(id);
    showToast('Listing approved ✓');
    return;
  }

  /* Admin: Reject */
  const rejectBtn = e.target.closest('[data-reject]');
  if (rejectBtn) {
    const id = rejectBtn.dataset.reject;
    setApprovalState(id, 'rejected');
    rerenderCard(id);
    showToast('Listing rejected ✗');
    return;
  }
});

function rerenderCard(id) {
  const existing = document.querySelector(`.card[data-id="${id}"]`);
  if (!existing) return;
  const listing = LISTINGS.find(l => l.id === id);
  if (!listing) return;
  const savedSet = new Set(getSavedListings());
  const approvedMap = getApprovedListings();
  const tmp = document.createElement('div');
  tmp.innerHTML = buildCard(listing, savedSet, approvedMap, isAdmin);
  existing.replaceWith(tmp.firstElementChild);
}

/* ── Apply Form Submit ───────────────────────────────────────── */
const applyForm = document.getElementById('applyForm');
if (applyForm) {
  applyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id      = document.getElementById('applyListingId')?.value;
    const name    = document.getElementById('applyName')?.value.trim();
    const email   = document.getElementById('applyEmail')?.value.trim();
    const message = document.getElementById('applyMessage')?.value.trim();

    // Store application in localStorage
    const apps = JSON.parse(localStorage.getItem('accofinder_applications') || '[]');
    apps.push({ listingId: id, name, email, message, appliedAt: new Date().toISOString() });
    localStorage.setItem('accofinder_applications', JSON.stringify(apps));

    closeModal('applyModal');
    applyForm.reset();
    showToast('Application submitted! The landlord will contact you soon. 🎉');
  });
}

/* ── Create Bar Modal ────────────────────────────────────────── */
const createInput = document.querySelector('.create-input');
if (createInput) {
  createInput.addEventListener('click', () => openModal('postModal'));
}

const postForm = document.getElementById('postForm');
if (postForm) {
  postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    closeModal('postModal');
    postForm.reset();
    showToast('Your post has been submitted for review.');
  });
}

$$('.create-action-btn').forEach(btn => {
  btn.addEventListener('click', () => openModal('postModal'));
});

/* ── Logout ──────────────────────────────────────────────────── */
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  clearSession();
  window.location.href = 'login.html';
});

/* ── Toast Notification ──────────────────────────────────────── */
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

/* ── Notification Badge ──────────────────────────────────────── */
const notifBadge = document.querySelector('.icon-btn[aria-label="Notifications"] .badge');
const tabDot = document.querySelector('.tab-dot');
const NOTIF_COUNT = 3;
if (notifBadge) notifBadge.textContent = NOTIF_COUNT;
if (tabDot) tabDot.textContent = NOTIF_COUNT;

/* ── Profile Panel Extra Buttons ────────────────────────────── */
document.getElementById('profileLogoutBtn')?.addEventListener('click', () => {
  clearSession();
  window.location.href = 'login.html';
});

document.getElementById('viewSavedBtn')?.addEventListener('click', () => {
  const saved = getSavedListings();
  if (saved.length === 0) {
    showToast('You have no saved listings yet. Click Save on any listing!');
    return;
  }
  const names = saved.map(id => {
    const l = LISTINGS.find(x => x.id === id);
    return l ? `• ${l.name} – ${l.price}` : null;
  }).filter(Boolean).join('\n');
  alert(`Your saved listings:\n\n${names}`);
});

document.getElementById('viewApplicationsBtn')?.addEventListener('click', () => {
  const apps = JSON.parse(localStorage.getItem('accofinder_applications') || '[]');
  if (apps.length === 0) {
    showToast('No applications submitted yet. Apply to a listing first!');
    return;
  }
  const lines = apps.map(a => {
    const l = LISTINGS.find(x => x.id === a.listingId);
    return `• ${l ? l.name : a.listingId} — Applied ${new Date(a.appliedAt).toLocaleDateString()}`;
  }).join('\n');
  alert(`Your applications:\n\n${lines}`);
});

/* ── Alerts – Mark All Read ──────────────────────────────────── */
document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
  $$('.alert-item.unread').forEach(el => {
    el.classList.remove('unread');
    el.querySelector('.alert-dot')?.remove();
  });
  const badge = document.querySelector('.icon-btn[aria-label="Notifications"] .badge');
  const dot   = document.querySelector('.tab-dot');
  if (badge) badge.style.display = 'none';
  if (dot)   dot.style.display = 'none';
  showToast('All notifications marked as read.');
});

/* ── Search nav button ───────────────────────────────────────── */
document.getElementById('searchNavBtn')?.addEventListener('click', () => {
  showToast('Search coming soon!');
});

/* ── Explore map button ──────────────────────────────────────── */
document.getElementById('exploreMapBtn')?.addEventListener('click', () => {
  showToast('Map view coming soon!');
});

