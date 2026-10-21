
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
