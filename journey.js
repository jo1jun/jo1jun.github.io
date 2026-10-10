(function () {
  'use strict';
  const root = document.getElementById('tab-journey');
  if (!root) return;
  const buttons = Array.from(root.querySelectorAll('[data-journey-target]'));
  const panels = Array.from(root.querySelectorAll('.journey-detail'));

  function selectLayer(button) {
    buttons.forEach(function (item) {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.id !== button.dataset.journeyTarget;
    });
  }

  buttons.forEach(function (button, index) {
    button.addEventListener('click', function () { selectLayer(button); });
    button.addEventListener('keydown', function (event) {
      let next;
      if (event.key === 'ArrowDown') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
      selectLayer(buttons[next]);
    });
  });
})();
