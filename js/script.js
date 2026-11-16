/* Shared helpers and local forms. Page-specific scripts own authentication,
   menu search, and API requests to avoid duplicate event handlers. */
(function () {
  'use strict';
  window.showToast = function (message) {
    let stack = document.getElementById('toastStack');
    if (!stack) {
      stack = document.createElement('div'); stack.id = 'toastStack';
      stack.className = 'toast-stack'; stack.setAttribute('aria-live', 'polite');
      document.body.append(stack);
    }
    while (stack.children.length >= 2) stack.firstElementChild.remove();
    const toast = document.createElement('div'); toast.className = 'cs-toast';
    const text = document.createElement('span'); text.textContent = message;
    const close = document.createElement('button'); close.type = 'button';
    close.className = 'cs-toast-close'; close.textContent = '×';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.addEventListener('click', () => toast.remove());
    toast.append(text, close); stack.append(toast);
    setTimeout(() => toast.remove(), 5000);
  };
  window.setButtonLoading = function (button, busy) {
    if (!button) return;
    if (busy) button.dataset.idleLabel = button.textContent;
    button.disabled = busy; button.setAttribute('aria-busy', String(busy));
    button.textContent = busy ? 'Sending…' : (button.dataset.idleLabel || 'Send Message');
  };
  function feedback(form, message, success) {
    let box = form.querySelector('.js-success');
    if (!box) { box = document.createElement('div'); box.setAttribute('role', 'status'); form.append(box); }
    box.className = 'js-success alert mt-3 mb-0 alert-' + (success ? 'success' : 'danger');
    box.textContent = message;
  }
  function readList(key) {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(value)) throw new Error('Unexpected stored data');
    return value;
  }
  // Only validated forms emit this event. Save before resetting so storage
  // failures preserve the user's input and never claim a successful request.
  document.addEventListener('form:valid', event => {
    const form = event.target;
    const reservation = form.getAttribute('aria-label') === 'Reservation form';
    if (!reservation && form.id !== 'subscribeForm') return;
    try {
      if (reservation) {
        const field = id => form.querySelector('#' + id).value.trim();
        const items = readList('copperSpoonReservations');
        items.push({id: Date.now().toString(36), name: field('fullName'), email: field('email').toLowerCase(), phone: field('phone'), date: field('date'), time: field('time'), guests: field('guests'), seating: form.querySelector('input[name="seating"]:checked')?.id || 'indoor', requests: field('requests')});
        localStorage.setItem('copperSpoonReservations', JSON.stringify(items));
      } else {
        const email = form.querySelector('#subEmail').value.trim().toLowerCase();
        const name = form.querySelector('#subName').value.trim();
        const items = readList('copperSpoonSubscribers');
        if (!items.some(person => person && person.email === email)) items.push({name, email});
        localStorage.setItem('copperSpoonSubscribers', JSON.stringify(items));
      }
      form.reset();
      form.querySelectorAll('.is-valid, .is-invalid').forEach(field => {
        field.classList.remove('is-valid', 'is-invalid'); field.setAttribute('aria-invalid', 'false');
      });
      const message = reservation ? 'Request saved on this device. Sign in with the same email to view it on your profile. This is a demo, not a confirmed booking.' : 'Subscription preference saved on this device. No emails are sent in this demo.';
      feedback(form, message, true);
      form.dispatchEvent(new CustomEvent('form:sent', {bubbles: true}));
    } catch {
      feedback(form, 'Could not save your details. Browser storage may be full, disabled, or contain invalid data. Your input has been kept so you can try again.', false);
    }
  });
  // hidden removes closed answers from the accessibility tree; aria-controls
  // and aria-expanded describe each question's relationship with its answer.
  const faqItems = [...document.querySelectorAll('.faq-item')];
  function expand(item, open) {
    item.querySelector('.faq-question').setAttribute('aria-expanded', String(open));
    item.querySelector('.faq-answer').hidden = !open;
    const icon = item.querySelector('.faq-icon'); if (icon) icon.textContent = open ? '−' : '+';
  }
  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer'); answer.id = 'faq-answer-' + index;
    question.setAttribute('aria-controls', answer.id); expand(item, false);
    question.addEventListener('click', () => expand(item, question.getAttribute('aria-expanded') !== 'true'));
  });
  document.getElementById('faqSearch')?.addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase(); let matches = 0;
    faqItems.forEach(item => {
      const match = item.textContent.toLowerCase().includes(query);
      item.hidden = !match; if (match) matches++; expand(item, !!query && match);
    });
    document.getElementById('faqSearchStatus').textContent = query ? matches + ' matching questions.' : '';
  });
  document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const text = button.closest('.copy-row').querySelector('.copy-text').textContent.trim();
      try { await navigator.clipboard.writeText(text); window.showToast('Copied to clipboard.'); }
      catch { window.showToast('Please select the text and copy it manually.'); }
    });
  });
})();
