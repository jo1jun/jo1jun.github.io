(() => {
  const button = document.getElementById('copy-email');
  const status = document.getElementById('email-status');
  const fallback = document.getElementById('email-fallback');
  let resetTimer;

  // Decoded only on interaction: deters simple address scrapers, not determined bots.
  const encodedAddress = 'am8xanVuQHBvc3RlY2guYWMua3I=';
  button.hidden = false;

  button.addEventListener('click', async () => {
    clearTimeout(resetTimer);
    fallback.hidden = true;
    fallback.value = '';
    const address = atob(encodedAddress);

    try {
      await navigator.clipboard.writeText(address);
      status.textContent = 'Email copied';
      resetTimer = setTimeout(() => { status.textContent = ''; }, 3000);
    } catch {
      // Stay on this page and allow manual copying if clipboard access is blocked.
      status.textContent = 'Select and copy';
      fallback.value = address;
      fallback.hidden = false;
      fallback.focus();
      fallback.select();
    }
  });

  fallback.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    fallback.hidden = true;
    fallback.value = '';
    status.textContent = '';
    button.focus();
  });
})();
