/* Hydration Tools — shared behaviors: theme toggle + footer year */
(function () {
  'use strict';
  var b = document.getElementById('themeToggle');
  if (b) {
    b.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('ph-theme', next); } catch (e) {}
    });
  }
  var y = document.getElementById('year');
  if (y) { y.textContent = new Date().getFullYear(); }
})();
