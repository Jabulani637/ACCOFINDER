/**
 * modal.js – lightweight modal manager for AccoFinder.
 * Provides openModal(id), closeModal(id), and a close-on-overlay-click handler.
 * Include this script before any page script that uses modals.
 */

/** Open a modal by its id */
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('modal--open');
  document.body.style.overflow = 'hidden';
}

/** Close a modal by its id */
function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('modal--open');
  document.body.style.overflow = '';
}

/** Close whichever modal is open when the backdrop is clicked */
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('modal--open');
    document.body.style.overflow = '';
  }
});

/** Close modal when any [data-close-modal] element is clicked */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-close-modal]');
  if (btn) {
    const target = btn.dataset.closeModal || btn.closest('.modal-overlay')?.id;
    if (target) closeModal(target);
  }
});
