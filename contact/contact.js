(() => {
  const address = document.getElementById('email-address');
  const button = document.getElementById('copy-email');
  const status = document.getElementById('copy-status');

  // The address remains selectable even without JavaScript or clipboard access.
  button.hidden = false;
  address.addEventListener('click', () => address.select());
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(address.value);
      status.textContent = 'Email address copied.';
    } catch {
      address.focus();
      address.select();
      status.textContent = 'Please copy the selected email address.';
    }
  });
})();
