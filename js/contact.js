/* contact.js — sends the contact form with fetch (POST) and shows the result
   without reloading the page. The result is handled by callback functions:
   sendMessage(data, onSuccess, onError). */
(function () {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  const submitButton = document.querySelector('#contactSubmit');
  const feedback = document.querySelector('#contactFeedback');

  // A free test API that accepts a POST and answers with the data plus an id
  const API_URL = 'https://jsonplaceholder.typicode.com/posts';

  // Sends the data, then calls onSuccess(result) or onError(error)
  function sendMessage(data, onSuccess, onError) {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(data)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Server answered ' + response.status);
        return response.json();
      })
      .then(onSuccess)
      .catch(onError);
  }

  function showFeedback(type, text) {
    feedback.innerHTML = '';
    const alert = document.createElement('div');
    alert.className = 'alert alert-' + type + ' mb-0 fade-in-alert';
    alert.setAttribute('role', 'alert');
    alert.textContent = text;
    feedback.append(alert);
  }

  function setSending(isSending) {
    submitButton.disabled = isSending;
    submitButton.textContent = isSending ? 'Sending...' : 'Send Message';
  }

  // Callback: runs when the server accepted the message
  function handleSuccess(result) {
    const name = form.elements.name.value.trim();
    setSending(false);
    form.reset();
    showFeedback('success', 'Thank you, ' + name + '! Your message was sent (reference #' + result.id + ').');
    window.playSound && window.playSound('success');
  }

  // Callback: runs when the request failed
  function handleError() {
    setSending(false);
    showFeedback('danger', 'Sorry, the message could not be sent. Check your connection and try again.');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();               // stay on the page

    // Browser validation (required, email, minlength) runs before this point;
    // checkValidity() is a safety net.
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim()
    };

    setSending(true);
    feedback.innerHTML = '';
    sendMessage(data, handleSuccess, handleError);
  });
})();
