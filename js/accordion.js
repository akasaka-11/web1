// ===== TASK 2 — Accordion (FAQ) =====
// Answers are hidden by default (max-height: 0 in CSS).
// Click on a question -> open it, click again -> close it.
(function () {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  const ONE_AT_A_TIME = true; // set to false to let several answers stay open

  function closeItem(item) {
    item.classList.remove('open');
    item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    item.querySelector('.faq-answer').style.maxHeight = null;
  }

  function openItem(item) {
    const answer = item.querySelector('.faq-answer');
    item.classList.add('open');
    item.querySelector('.faq-question').setAttribute('aria-expanded', 'true');
    answer.style.maxHeight = answer.scrollHeight + 'px'; // smooth slide down
  }

  items.forEach(function (item) {
    item.querySelector('.faq-question').addEventListener('click', function () {
      const isOpen = item.classList.contains('open');
      if (ONE_AT_A_TIME) items.forEach(closeItem);
      if (!isOpen) openItem(item);
      else closeItem(item);
    });
  });
})();
