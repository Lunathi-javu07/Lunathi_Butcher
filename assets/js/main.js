document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const siteHeader = document.querySelector('.site-header');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && siteHeader && mainNav) {
    navToggle.addEventListener('click', () => {
      siteHeader.classList.toggle('nav-open');
    });

    // Close the menu after tapping a link, so it doesn't stay open,
    // when navigating to the next page on mobile.
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteHeader.classList.remove('nav-open');
      });
    });
  }

  const filterTabs = document.querySelectorAll('.filter-tab');
  const menuCards = document.querySelectorAll('.menu-card');

  if (filterTabs.length && menuCards.length) {
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;

        filterTabs.forEach((item) => item.classList.toggle('active', item === tab));

        menuCards.forEach((card) => {
          const tags = (card.dataset.tags || '').split(' ');
          const shouldShow = filter === 'all' || tags.includes(filter);
          card.classList.toggle('hidden', !shouldShow);
        });
      });
    });
  }

  const ratingButtons = document.querySelectorAll('.rating-btn');
  const ratingInput = document.getElementById('rating-value');

  if (ratingButtons.length && ratingInput) {
    ratingButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const value = button.dataset.value;
        ratingInput.value = value;
        ratingButtons.forEach((item) => item.classList.toggle('active', item === button));
      });
    });
  }

  const enquiryForm = document.getElementById('enquiry-form');
  const formNote = document.getElementById('form-note');
  const clearBtn = document.getElementById('clear-btn');

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';

      if (!name || !email) {
        formNote.textContent = 'Please complete your name and email before submitting.';
        formNote.style.color = '#a53030';
        return;
      }

      if (!email.includes('@') || !email.includes('.')) {
        formNote.textContent = 'Please enter a valid email address.';
        formNote.style.color = '#a53030';
        return;
      }

      formNote.textContent = 'Thank you! Your enquiry has been sent successfully.';
      formNote.style.color = '#1d7b41';
      enquiryForm.reset();
      if (ratingInput) ratingInput.value = '';
      ratingButtons.forEach((button) => button.classList.remove('active'));
    });
  }

  if (clearBtn && enquiryForm) {
    clearBtn.addEventListener('click', () => {
      enquiryForm.reset();
      if (ratingInput) ratingInput.value = '';
      ratingButtons.forEach((button) => button.classList.remove('active'));
      if (formNote) {
        formNote.textContent = '';
      }
    });
  }
});
 