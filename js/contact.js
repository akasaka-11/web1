(function () {
  'use strict';
  const form = document.getElementById('contactForm');
  if (!form) return;
  const button = document.getElementById('contactSubmit');
  const feedback = document.getElementById('contactFeedback');
  const originalLabel = button.textContent;
  let sending = false;
  function showFeedback(type, message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-' + type + ' mb-0';
    alert.setAttribute('role', 'status');
    alert.textContent = message;
    feedback.replaceChildren(alert);
  }
  form.addEventListener('form:valid', async function () {
    if (sending) return;
    sending = true;
    const data = { name: form.elements.name.value.trim(), email: form.elements.email.value.trim(), message: form.elements.message.value.trim() };
    button.disabled = true;
    button.textContent = 'Sending demo message…';
    form.setAttribute('aria-busy', 'true');
    feedback.textContent = 'Contacting the demo service…';
    // The test API simulates success; no restaurant email is sent or persisted remotely.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Request failed');
      const result = await response.json();
      if (!result || result.id === undefined) throw new Error('Unexpected API response');
      form.reset();
      showFeedback('success', 'Thank you, ' + data.name + '. The demo service accepted your message (reference ' + result.id + '). No email was sent.');
    } catch {
      showFeedback('danger', 'The demo service could not be reached. Your message is still here; check your connection and try again.');
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.textContent = originalLabel;
      form.setAttribute('aria-busy', 'false');
    }
  });
})();
