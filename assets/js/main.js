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
  const STORAGE_KEY = 'lunathiEnquiries';

  const setFormNote = (message, isError = false) => {
    if (!formNote) return;
    formNote.textContent = message;
    formNote.style.color = isError ? '#a53030' : '#1d7b41';
  };

  const saveEnquiry = (enquiryData) => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const enquiryList = Array.isArray(existing) ? existing : [];
      enquiryList.push(enquiryData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiryList));
      return true;
    } catch (error) {
      console.error('Unable to save enquiry locally:', error);
      return false;
    }
  };

  if (enquiryForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');
    const messageInput = document.getElementById('message');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+()\s-]{7,20}$/;

    [nameInput, emailInput, mobileInput, messageInput].forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => {
        if (formNote && formNote.textContent) {
          formNote.textContent = '';
        }
      });
    });

    enquiryForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const mobile = mobileInput ? mobileInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';
      const chosenRating = ratingInput ? ratingInput.value : '';

      if (!name || !email) {
        setFormNote('Please complete your name and email before submitting.', true);
        return;
      }

      if (!emailPattern.test(email)) {
        setFormNote('Please enter a valid email address.', true);
        return;
      }

      if (mobile && !phonePattern.test(mobile)) {
        setFormNote('Please enter a valid mobile number.', true);
        return;
      }

      const enquiryData = {
        name,
        email,
        mobile: mobile || 'Not provided',
        message: message || 'No message provided',
        rating: chosenRating || 'Not rated',
        sentAt: new Date().toISOString()
      };

      const saved = saveEnquiry(enquiryData);

      if (!saved) {
        setFormNote('Your enquiry could not be saved in this browser. Please try again.', true);
        return;
      }

      setFormNote('Thank you! Your enquiry has been saved and marked as sent.', false);
      enquiryForm.reset();

      if (ratingInput) ratingInput.value = '';
      ratingButtons.forEach((button) => button.classList.remove('active'));

      console.log('Saved enquiry:', enquiryData);
    });
  }

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');
    const messageInput = document.getElementById('message');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+()\s-]{7,20}$/;

    const saveContactMessage = (contactData) => {
      try {
        const existing = JSON.parse(localStorage.getItem('lunathiEnquiries') || '[]');
        const enquiryList = Array.isArray(existing) ? existing : [];
        enquiryList.push(contactData);
        localStorage.setItem('lunathiEnquiries', JSON.stringify(enquiryList));
        return true;
      } catch (error) {
        console.error('Unable to save contact message locally:', error);
        return false;
      }
    };

    [nameInput, emailInput, mobileInput, messageInput].forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => {
        if (formNote && formNote.textContent) {
          formNote.textContent = '';
        }
      });
    });

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const mobile = mobileInput ? mobileInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email) {
        setFormNote('Please complete your name and email before submitting.', true);
        return;
      }

      if (!emailPattern.test(email)) {
        setFormNote('Please enter a valid email address.', true);
        return;
      }

      if (mobile && !phonePattern.test(mobile)) {
        setFormNote('Please enter a valid mobile number.', true);
        return;
      }

      const contactData = {
        name,
        email,
        mobile: mobile || 'Not provided',
        message: message || 'No message provided',
        type: 'contact',
        sentAt: new Date().toISOString()
      };

      if (!saveContactMessage(contactData)) {
        setFormNote('Your message could not be saved in this browser. Please try again.', true);
        return;
      }

      setFormNote('Thank you! Your message has been saved and sent successfully.', false);
      contactForm.reset();
      console.log('Saved contact message:', contactData);
    });
  }

  if (clearBtn && enquiryForm) {
    clearBtn.addEventListener('click', () => {
      enquiryForm.reset();
      if (ratingInput) ratingInput.value = '';
      ratingButtons.forEach((button) => button.classList.remove('active'));
      if (formNote) {
        formNote.textContent = '';
        formNote.style.color = '#1d7b41';
      }
    });
  }

  if (clearBtn && contactForm) {
    clearBtn.addEventListener('click', () => {
      contactForm.reset();
      if (formNote) {
        formNote.textContent = '';
        formNote.style.color = '#1d7b41';
      }
    });
  }
});
