
(function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function getLabel(input) {
    return input.dataset.label || input.name || 'This field';
  }

  function getError(input, form) {
    const label = getLabel(input);

    if (input.type === 'checkbox') {
      return input.required && !input.checked ? 'You must accept this to continue.' : '';
    }

    const value = input.type === 'password' ? input.value : input.value.trim();

    if (input.required && value === '') return label + ' is required.';
    if (value === '') return ''; 
    if (input.type === 'email' && !EMAIL_RE.test(value)) {
      return 'Please enter a valid email (example: name@example.com).';
    }
    if (input.minLength > 0 && value.length < input.minLength) {
      return label + ' must be at least ' + input.minLength + ' characters.';
    }
    if (input.dataset.strong !== undefined && !(/[A-Za-z]/.test(value) && /\d/.test(value))) {
      return label + ' must contain at least one letter and one number.';
    }
    if (input.dataset.match) {
      const other = form.querySelector(input.dataset.match);
      if (other && other.value !== input.value) return 'Passwords do not match.';
    }
    if (input.dataset.future !== undefined) {
      const chosen = new Date(value + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) return 'Please choose today or a future date.';
    }
    return '';
  }

  function validateField(input, form) {
    const message = getError(input, form);
    const anchor = input.closest('.input-group, .form-check') || input;

    const old = anchor.nextElementSibling;
    if (old && old.classList.contains('js-error')) old.remove();
    input.classList.remove('is-valid', 'is-invalid');

    if (message) {
      input.classList.add('is-invalid');
      const div = document.createElement('div');
      div.className = 'invalid-feedback d-block js-error';
      div.textContent = message;
      anchor.insertAdjacentElement('afterend', div);
    } else if (input.value.trim() !== '' || input.checked) {
      input.classList.add('is-valid');
    }
    return message === '';
  }

  function showSuccess(form) {
    const old = form.querySelector('.js-success');
    if (old) old.remove();
    const alert = document.createElement('div');
    alert.className = 'alert alert-success js-success';
    alert.setAttribute('role', 'alert');
    alert.textContent = form.dataset.success || 'Form submitted successfully!';
    form.prepend(alert);
    setTimeout(function () { alert.remove(); }, 5000);
  }

  document.querySelectorAll('form.needs-validation').forEach(function (form) {
    const fields = Array.from(form.querySelectorAll('input, textarea')).filter(function (f) {
      return !['radio', 'submit', 'button'].includes(f.type);
    });

    fields.forEach(function (f) {
      f.addEventListener('blur', function () { validateField(f, form); });
      f.addEventListener('change', function () { validateField(f, form); });
      f.addEventListener('input', function () {
        if (f.classList.contains('is-invalid')) validateField(f, form);
        // if the password changes, re-check the confirmation field
        fields.forEach(function (other) {
          if (other.dataset.match && form.querySelector(other.dataset.match) === f && other.value !== '') {
            validateField(other, form);
          }
        });
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault(); 
      let firstBad = null;
      fields.forEach(function (f) {
        if (!validateField(f, form) && !firstBad) firstBad = f;
      });
      if (firstBad) { firstBad.focus(); return; }

      form.reset();
      fields.forEach(function (f) {
        f.classList.remove('is-valid', 'is-invalid');
        const anchor = f.closest('.input-group, .form-check') || f;
        const err = anchor.nextElementSibling;
        if (err && err.classList.contains('js-error')) err.remove();
      });
      showSuccess(form);
      form.dispatchEvent(new CustomEvent('form:valid', { bubbles: true }));
    });
  });
})();
