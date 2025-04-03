document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('form, table');
    fadeElements.forEach(el => el.classList.add('fade-in'));
  });
  