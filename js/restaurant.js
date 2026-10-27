/* restaurant.js — "Are we open now?" button on the home page.
   Uses an object with a method to hold the opening hours and decide
   whether the restaurant is open, then writes the result into the page. */
(function () {
  const button = document.getElementById('openNowBtn');
  const output = document.getElementById('openNowResult');
  if (!button || !output) return;

  // Object with data (hours) and a method (statusAt)
  const restaurant = {
    name: 'The Copper Spoon',
    // getDay(): 0 = Sunday ... 6 = Saturday
    hours: {
      weekday: { opens: 11, closes: 22 },
      weekend: { opens: 10, closes: 23 }
    },

    hoursFor: function (date) {
      const day = date.getDay();
      return (day === 0 || day === 6) ? this.hours.weekend : this.hours.weekday;
    },

    statusAt: function (date) {
      const today = this.hoursFor(date);
      const hour = date.getHours() + date.getMinutes() / 60;
      return {
        open: hour >= today.opens && hour < today.closes,
        opens: today.opens,
        closes: today.closes
      };
    }
  };

  function pad(hour) {
    return String(hour).padStart(2, '0') + ':00';
  }

  button.addEventListener('click', function () {
    const now = new Date();
    const status = restaurant.statusAt(now);
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (status.open) {
      output.textContent = time + ' — Yes, we are open until ' + pad(status.closes) + '. Come on in!';
    } else {
      output.textContent = time + ' — Sorry, we are closed. Today we open ' +
        pad(status.opens) + ' – ' + pad(status.closes) + '.';
    }
    output.classList.toggle('text-success', status.open);
    output.classList.toggle('text-danger', !status.open);
    window.playSound && window.playSound('click');
  });
})();
