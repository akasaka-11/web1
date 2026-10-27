/* rating.js — clickable 5-star rating.
   Stars are selected with querySelectorAll. Clicking one sets the rating,
   colours every star up to it, and updates the message below. Hovering
   previews the rating. */
(function () {
  const container = document.querySelector('#starRating');
  const message = document.querySelector('#ratingMessage');
  if (!container || !message) return;

  const stars = container.querySelectorAll('.star');

  // Object lookup: one thank-you message per rating
  const messages = {
    1: 'Sorry we missed the mark. Tell us more on the Contact page.',
    2: 'Thanks for the feedback. We will do better.',
    3: 'Good to know. We are working on making it great.',
    4: 'Glad you enjoyed it! See you again soon.',
    5: 'Wonderful! You just made our kitchen\u2019s day.'
  };

  // Colour stars 1..count by toggling a CSS class
  function paint(count, className) {
    stars.forEach(function (star) {
      star.classList.toggle(className, Number(star.dataset.value) <= count);
    });
  }

  function setRating(value) {
    container.setAttribute('data-rating', value);
    paint(value, 'selected');
    stars.forEach(function (star) {
      star.setAttribute('aria-checked', String(Number(star.dataset.value) === value));
    });
    message.textContent = 'You rated us ' + value + ' / 5. ' + messages[value];
  }

  stars.forEach(function (star) {
    const value = Number(star.dataset.value);

    star.addEventListener('click', function () {
      setRating(value);
      // Restart the pop animation: remove the class, force a reflow, add it again
      star.classList.remove('pop');
      void star.offsetWidth;
      star.classList.add('pop');
      window.playSound && window.playSound('add');
    });

    star.addEventListener('mouseenter', function () { paint(value, 'hover'); });
    star.addEventListener('mouseleave', function () { paint(0, 'hover'); });
    star.addEventListener('focus', function () { paint(value, 'hover'); });
    star.addEventListener('blur', function () { paint(0, 'hover'); });
  });
})();
