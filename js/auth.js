(function () {
  'use strict';
  const USERS_KEY = 'copperSpoonUsers';
  const SESSION_KEY = 'copperSpoonSession';
  const $ = id => document.getElementById(id);

  // Storage can be edited or contain stale data; check shapes before array operations.
  function readUsers() {
    try {
      const value = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      return Array.isArray(value) ? value.filter(user => user && ['name', 'email', 'password'].every(key => typeof user[key] === 'string')) : [];
    } catch { return []; }
  }
  function readSession() {
    try {
      const value = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      return value && typeof value.email === 'string' ? value : null;
    } catch { return null; }
  }
  const activeUser = readUsers().find(user => user.email === readSession()?.email);
  document.querySelectorAll('.auth-link').forEach(element => { element.hidden = Boolean(activeUser); });
  document.querySelectorAll('.profile-link').forEach(element => { element.hidden = !activeUser; });

  function feedback(message) {
    const element = $('authFeedback');
    if (!element) return;
    element.className = message ? 'alert alert-danger mt-3' : '';
    element.textContent = message;
  }
  const registerForm = $('registerForm');
  if (registerForm) {
    registerForm.addEventListener('input', () => feedback(''));
    registerForm.addEventListener('form:valid', function () {
      try {
        const name = $('regName').value.trim();
        const email = $('regEmail').value.trim().toLowerCase();
        const password = $('password').value;
        const users = readUsers();
        if (users.some(user => user.email === email)) {
          feedback('An account with this email already exists. Please sign in.');
          $('regEmail').focus();
          return;
        }
        // Classroom simulation: real applications authenticate using a secure server.
        users.push({ name, email, password });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
        window.location.assign('profile.html');
      } catch {
        feedback('Unable to save the account. Check that browser storage is enabled, then try again.');
      }
    });
  }

  const loginForm = $('loginForm');
  if (loginForm) {
    loginForm.addEventListener('input', () => feedback(''));
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const validation = window.CopperValidation;
      const emailField = $('loginEmail');
      const passwordField = $('loginPassword');
      const email = emailField.value.trim().toLowerCase();
      const password = passwordField.value;
      const emailError = !email ? 'Email is required.' : !validation.emailPattern.test(email) ? 'Enter a valid email address.' : '';
      const passwordError = !password ? 'Password is required.' : !validation.passwordPattern.test(password) ? validation.passwordMessage : '';
      validation.showFieldError(emailField, emailError);
      validation.showFieldError(passwordField, passwordError);
      if (emailError || passwordError) { (emailError ? emailField : passwordField).focus(); return; }
      const user = readUsers().find(person => person.email === email && person.password === password);
      if (!user) {
        feedback('Incorrect email or password. Please try again, or create an account on this device.');
        return;
      }
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
        window.location.assign('profile.html');
      } catch { feedback('Unable to sign in. Please enable browser storage.'); }
    });
  }

  if (!$('profileName')) return;
  if (!activeUser) { window.location.replace('login.html'); return; }
  // Never interpret user-entered names or special requests as HTML.
  $('profileName').textContent = activeUser.name;
  $('profileEmail').textContent = activeUser.email;
  $('logoutBtn').addEventListener('click', function () {
    try {
      localStorage.removeItem(SESSION_KEY);
      window.location.assign('login.html');
    } catch {
      const message = document.createElement('p');
      message.className = 'text-danger';
      message.textContent = 'Unable to sign out. Please enable browser storage and try again.';
      $('logoutBtn').after(message);
    }
  });

  const list = $('myReservations');
  try {
    const saved = JSON.parse(localStorage.getItem('copperSpoonReservations') || '[]');
    const reservations = Array.isArray(saved) ? saved.filter(item => item && typeof item.email === 'string' && item.email.toLowerCase() === activeUser.email) : [];
    if (!reservations.length) return;
    list.replaceChildren();
    reservations.slice().reverse().forEach(function (reservation) {
      const item = document.createElement('li');
      item.className = 'list-group-item';
      const title = document.createElement('strong');
      title.textContent = reservation.date + (reservation.time ? ' at ' + reservation.time : '');
      const details = document.createElement('p');
      details.className = 'mb-1';
      details.textContent = reservation.guests + ' guests · ' + reservation.seating + ' seating';
      item.append(title, details);
      if (reservation.requests) {
        const requests = document.createElement('p');
        requests.className = 'small mb-1';
        requests.textContent = 'Special requests: ' + reservation.requests;
        item.append(requests);
      }
      const status = document.createElement('span');
      status.className = 'small text-muted';
      status.textContent = 'Saved on this device · demo request';
      item.append(status);
      list.append(item);
    });
  } catch { list.textContent = 'Saved requests could not be read. Your account is still available.'; }
})();
