(function () {
  'use strict';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;
  const passwordMessage = 'Use at least 8 characters with uppercase, lowercase, a number and a symbol.';

  // Count digits separately so punctuation-only strings cannot pass as phone numbers.
  function validPhone(value) {
    const digits = value.replace(/\D/g, '');
    return /^\+?[\d ()-]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
  }

  function fieldError(field, form) {
    const value = field.value.trim();
    const label = field.dataset.label || field.labels?.[0]?.textContent.trim() || field.name || 'This field';
    if (field.type === 'checkbox') return field.dataset.required !== undefined && !field.checked ? 'Please confirm that you agree to save this demo account on your device.' : '';
    if (field.dataset.required !== undefined && !value) return label + ' is required.';
    if (!value) return '';
    if (field.dataset.email !== undefined && !emailPattern.test(value)) return 'Enter a valid email address, such as name@example.com.';
    if (field.dataset.phone !== undefined && !validPhone(value)) return 'Enter 10–15 digits. You may include +, spaces, parentheses or hyphens.';
    if (field.dataset.strong !== undefined && !passwordPattern.test(field.value)) return passwordMessage;
    if (field.dataset.minlength && value.length < Number(field.dataset.minlength)) return label + ' must be at least ' + field.dataset.minlength + ' characters.';
    if (field.dataset.match && form.querySelector(field.dataset.match)?.value !== field.value) return 'Passwords do not match.';
    // Local midnight avoids UTC date shifts for guests in other time zones.
    if (field.dataset.future !== undefined) {
      const chosen = new Date(value + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(chosen.getTime()) || chosen < today) return 'Choose today or a future date.';
    }
    if (field.id === 'time') {
      const date = form.querySelector('#date')?.value;
      if (date && new Date(date + 'T' + value) <= new Date()) return 'Choose a time in the future.';
    }
    return '';
  }

  function showFieldError(field, message) {
    const errorId = field.id + 'Error';
    let feedback = document.getElementById(errorId);
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.id = errorId;
      feedback.className = 'invalid-feedback js-error';
      const parent = field.closest('.input-group')?.parentElement || field.parentElement;
      parent.append(feedback);
    }
    feedback.textContent = message;
    feedback.hidden = !message;
    feedback.style.display = message ? 'block' : 'none';
    field.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    const describedBy = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    describedBy.add(errorId);
    field.setAttribute('aria-describedby', [...describedBy].join(' '));
    return !message;
  }

  // Login reuses these same rules without enabling browser-native validation.
  window.CopperValidation = { emailPattern, passwordPattern, passwordMessage, validPhone, showFieldError };
  document.querySelectorAll('form.needs-validation').forEach(function (form) {
    const fields = [...form.querySelectorAll('input, textarea, select')].filter(field => !['radio', 'submit', 'button', 'hidden'].includes(field.type));
    const validate = field => showFieldError(field, fieldError(field, form));
    fields.forEach(function (field) {
      field.addEventListener('blur', () => validate(field));
      field.addEventListener('change', () => validate(field));
      field.addEventListener('input', function () {
        if (field.classList.contains('is-invalid')) validate(field);
        fields.filter(other => other.dataset.match && form.querySelector(other.dataset.match) === field).forEach(other => {
          if (other.value) validate(other);
        });
      });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      let firstInvalid = null;
      fields.forEach(field => { if (!validate(field) && !firstInvalid) firstInvalid = field; });
      if (firstInvalid) { firstInvalid.focus(); return; }
      // Only validated data reaches the registration, reservation and API handlers.
      form.dispatchEvent(new CustomEvent('form:valid', { bubbles: true }));
    });
    form.addEventListener('reset', function () {
      fields.forEach(field => { field.classList.remove('is-valid', 'is-invalid'); field.removeAttribute('aria-invalid'); });
      form.querySelectorAll('.js-error').forEach(error => { error.hidden = true; error.style.display = 'none'; });
    });
  });
})();
