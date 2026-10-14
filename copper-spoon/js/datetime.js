// ===== TASK 5 — Current date and time =====
// Uses the Date object and refreshes every second.
// Output example: "October 9, 2026, 10:45:12 AM"
(function () {
  const el = document.getElementById('datetime');
  if (!el) return;

  function update() {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    el.textContent = date + ', ' + time;
  }

  update();
  setInterval(update, 1000);
})();
