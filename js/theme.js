(function () {
  const btn = document.getElementById('bgColorBtn');
  if (!btn) return;

  const colors = ['#f5ead9', '#e3f0e1', '#e1edf8', '#f8e1e8', '#fff3c4', '#e8e0f5'];
  let index = 0;

  btn.addEventListener('click', function () {
    index = (index + 1) % colors.length;
    document.body.style.backgroundColor = colors[index];
   
  });
})();
