/* ==========================================================================
   Lunathi's Butcher - main.js
   One script shared by every page. Each feature is a small function that
   only does something if the elements it needs exist on the current page.

   Contents
   1. Helpers
   2. Mobile navigation (hamburger)
   3. Dynamic content (date stamp, open/closed status, footer clock, year)
   4. Menu filter + search
   5. Gallery lightbox
   6. Rating buttons
   7. Form validation and form processing (contact + enquiry)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDynamicContent();
  initMenuFilterAndSearch();
  initLightbox();
  initRating();
  initForms();
});

/* --------------------------------------------------------------------------
   1. Helpers
   -------------------------------------------------------------------------- */

/** Business details used by the email (mailto) form processing. */
const BUSINESS_EMAIL = 'info@LunathiButcher.com';

/** Returns the current hour (0-23) in South Africa, whatever the visitor's own time zone. */
function hourInSouthAfrica() {
  return Number(
    new Date().toLocaleString('en-GB', { timeZone: 'Africa/Johannesburg', hour: 'numeric', hour12: false })
  ) % 24;
}

/* --------------------------------------------------------------------------
   2. Mobile navigation (hamburger)
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const siteHeader = document.querySelector('.site-header');
  const mainNav = document.querySelector('.main-nav');
  if (!navToggle || !siteHeader || !mainNav) return;

  const setOpen = (open) => {
    siteHeader.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open)); // helps screen readers
  };

  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.addEventListener('click', () => setOpen(!siteHeader.classList.contains('nav-open')));

  // Close the menu after a link is tapped, and when Escape is pressed.
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

/* --------------------------------------------------------------------------
   3. Dynamic content
   - Home page: today's date and an "open / closed now" badge
   - Every page: live date + time stamp and the current year in the footer
   -------------------------------------------------------------------------- */
function initDynamicContent() {
  // Today's date (home page only)
  const dateStamp = document.getElementById('datestamp');
  if (dateStamp) {
    dateStamp.textContent = new Date().toLocaleDateString('en-ZA', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // Open / closed badge: trading hours are 09:00 - 17:00, seven days a week.
  const openStatus = document.getElementById('open-status');
  if (openStatus) {
    const hour = hourInSouthAfrica();
    const isOpen = hour >= 9 && hour < 17;
    openStatus.textContent = isOpen ? 'We are open now (until 5 PM)' : 'We are closed now (open daily 9 AM - 5 PM)';
    openStatus.classList.toggle('is-open', isOpen);
    openStatus.classList.toggle('is-closed', !isOpen);
  }

  // Copyright year, always up to date
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Live footer date and time, refreshed every second
  const footerTime = document.getElementById('footer-datetime');
  if (footerTime) {
    const tick = () => {
      const now = new Date();
      footerTime.textContent =
        now.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) + ' | ' +
        now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }
}

/* --------------------------------------------------------------------------
   4. Menu filter + search
   A card is shown only if it matches BOTH the selected category tab and
   every word typed into the search box.
   -------------------------------------------------------------------------- */
function initMenuFilterAndSearch() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.menu-card');
  if (!tabs.length || !cards.length) return;

  const searchInput = document.getElementById('menu-search');
  const status = document.getElementById('menu-search-status');
  const noResults = document.getElementById('no-results');

  let activeFilter = 'all';
  let searchWords = [];

  const applyFilters = () => {
    let shown = 0;
    cards.forEach((card) => {
      const tags = (card.dataset.tags || '').split(' ');
      const text = (card.textContent + ' ' + tags.join(' ')).toLowerCase();
      const matchesTab = activeFilter === 'all' || tags.includes(activeFilter);
      const matchesSearch = searchWords.every((word) => text.includes(word));
      const visible = matchesTab && matchesSearch;
      card.classList.toggle('hidden', !visible);
      if (visible) shown++;
    });
    if (noResults) noResults.hidden = shown !== 0;
    if (status) status.textContent = 'Showing ' + shown + ' of ' + cards.length + ' items';
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      activeFilter = tab.dataset.filter;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchWords = searchInput.value.toLowerCase().split(/\s+/).filter(Boolean);
      applyFilters();
    });
  }
}

/* --------------------------------------------------------------------------
   5. Gallery lightbox
   Click any picture inside <main> to view it enlarged. Close with the X
   button, a click outside the picture, or Escape. Left/right arrow keys
   (or the arrow buttons) move between the pictures on the page.
   -------------------------------------------------------------------------- */
function initLightbox() {
  const images = Array.from(document.querySelectorAll('main img'));
  if (!images.length) return;

  // Build the lightbox once and add it to the page.
  const box = document.createElement('div');
  box.id = 'lightbox';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML =
    '<button type="button" class="lb-close" aria-label="Close image viewer">&times;</button>' +
    '<button type="button" class="lb-prev" aria-label="Previous image">&#10094;</button>' +
    '<figure><img src="" alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="lb-next" aria-label="Next image">&#10095;</button>';
  document.body.appendChild(box);

  const bigImg = box.querySelector('img');
  const caption = box.querySelector('figcaption');
  const closeBtn = box.querySelector('.lb-close');
  let current = 0;
  let opener = null; // remembers what had focus so we can give it back

  const show = (index) => {
    current = (index + images.length) % images.length; // wraps around at both ends
    bigImg.src = images[current].currentSrc || images[current].src;
    bigImg.alt = images[current].alt;
    caption.textContent = images[current].alt;
  };

  const open = (index) => {
    opener = document.activeElement;
    show(index);
    box.hidden = false;
    document.body.classList.add('lightbox-open'); // stops the page scrolling behind
    closeBtn.focus();
  };

  const close = () => {
    box.hidden = true;
    document.body.classList.remove('lightbox-open');
    if (opener && opener.focus) opener.focus();
  };

  images.forEach((img, i) => {
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.addEventListener('click', () => open(i));
    img.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(i); });
  });

  closeBtn.addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); show(current - 1); });
  box.querySelector('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); show(current + 1); });
  box.addEventListener('click', (e) => { if (e.target === box) close(); }); // click on the dark backdrop

  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
}

/* --------------------------------------------------------------------------
   6. Rating buttons (enquiry form): 1-5, stored in a hidden input
   -------------------------------------------------------------------------- */
function initRating() {
  const buttons = document.querySelectorAll('.rating-btn');
  const input = document.getElementById('rating-value');
  if (!buttons.length || !input) return;

  buttons.forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      input.value = button.dataset.value;
      buttons.forEach((b) => {
        const chosen = b === button;
        b.classList.toggle('selected', chosen); // "selected" is the class the CSS styles
        b.setAttribute('aria-pressed', String(chosen));
      });
    });
  });
}

/* --------------------------------------------------------------------------
   7. Form validation and processing
   Each form is described by a list of rules. On submit every field is
   checked, an error message appears under each field that is wrong, and
   the first wrong field receives focus. When everything is valid the
   message is saved, the visitor's email app opens with the message ready
   to send to the business, and a confirmation panel summarises it.
   -------------------------------------------------------------------------- */

// Patterns
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[A-Za-z][A-Za-z\s'’-]{1,}$/;          // letters, spaces, ' and -
const PHONE_RE = /^(\+27|0)[1-9][0-9]{8}$/;               // South African numbers

/** Each checker returns an error message, or '' when the value is fine. */
const CHECKS = {
  name: (v) => (NAME_RE.test(v) ? '' : 'Please use letters only (at least 2 characters).'),
  email: (v) => (EMAIL_RE.test(v) ? '' : 'Please enter a valid email address, e.g. name@example.com.'),
  phone: (v) => (PHONE_RE.test(v.replace(/[\s()-]/g, '')) ? '' : 'Please enter a valid South African number, e.g. 065 119 9400.'),
  message: (v) => (v.length >= 10 ? '' : 'Please write at least 10 characters.'),
  future: (v) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return new Date(v + 'T00:00:00') >= today ? '' : 'Please choose today or a later date.';
  }
};

/** The fields on each form. */
const FORMS = {
  'contact-form': {
    subject: 'Website contact message',
    fields: [
      { id: 'name', label: 'Your name', required: true, check: 'name' },
      { id: 'email', label: 'Email address', required: true, check: 'email' },
      { id: 'mobile', label: 'Mobile number', required: false, check: 'phone' },
      { id: 'contact-subject', label: 'Subject', required: true },
      { id: 'message', label: 'Your message', required: true, check: 'message' },
      { id: 'consent', label: 'Consent', required: true, checkbox: true }
    ]
  },
  'enquiry-form': {
    subject: 'Website enquiry',
    fields: [
      { id: 'name', label: 'Your name', required: true, check: 'name' },
      { id: 'email', label: 'Email address', required: true, check: 'email' },
      { id: 'mobile', label: 'Mobile number', required: false, check: 'phone' },
      { id: 'enquiry-type', label: 'Enquiry type', required: true },
      { id: 'needed-by', label: 'Date needed', required: false, check: 'future' },
      { id: 'message', label: 'Your message', required: true, check: 'message' },
      { id: 'consent', label: 'Consent', required: true, checkbox: true }
    ],
    radioGroups: [{ name: 'contact-method', label: 'Preferred contact method', required: true }]
  }
};

/** Shows (or clears) the error text under a field and marks it visually. */
function setFieldError(control, message) {
  const wrapper = control.closest('.field');
  if (!wrapper) return;
  let slot = wrapper.querySelector('.field-error');
  if (!slot) {
    slot = document.createElement('span');
    slot.className = 'field-error';
    slot.setAttribute('role', 'alert');
    wrapper.appendChild(slot);
  }
  slot.textContent = message;
  control.classList.toggle('invalid', message !== '');
  control.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
}

/** Validates one field definition and returns its error message. */
function validateField(form, def) {
  const control = form.querySelector('#' + def.id);
  if (!control) return '';
  if (def.checkbox) {
    return control.checked ? '' : 'Please tick the box so we may contact you about this message.';
  }
  const value = control.value.trim();
  if (def.required && value === '') {
    return def.id.endsWith('type') || def.id.endsWith('subject')
      ? 'Please choose an option.'
      : def.label + ' is required.';
  }
  if (value !== '' && def.check) return CHECKS[def.check](value);
  return '';
}

function initForms() {
  Object.keys(FORMS).forEach((formId) => {
    const form = document.getElementById(formId);
    if (form) setupForm(form, FORMS[formId]);
  });
}

function setupForm(form, config) {
  const note = form.querySelector('.form-note');
  const successPanel = document.getElementById('form-success');

  // Shows a message under the form; type is 'error' or 'ok'.
  const showNote = (text, type) => {
    if (!note) return;
    note.textContent = text;
    note.classList.toggle('visible', text !== '');
    note.classList.toggle('error', type === 'error');
  };

  // The date picker may not offer past dates.
  const dateInput = form.querySelector('#needed-by');
  if (dateInput) {
    const t = new Date();
    dateInput.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }

  // Live feedback: check a field when the visitor leaves it, and keep
  // re-checking while they fix a field that is already marked wrong.
  config.fields.forEach((def) => {
    const control = form.querySelector('#' + def.id);
    if (!control) return;
    control.addEventListener('blur', () => setFieldError(control, validateField(form, def)));
    const liveEvent = control.type === 'checkbox' || control.tagName === 'SELECT' ? 'change' : 'input';
    control.addEventListener(liveEvent, () => {
      if (control.classList.contains('invalid')) setFieldError(control, validateField(form, def));
    });
  });

  // Radio groups: clear the error as soon as one option is chosen.
  (config.radioGroups || []).forEach((group) => {
    form.querySelectorAll('input[name="' + group.name + '"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        const first = form.querySelector('input[name="' + group.name + '"]');
        setFieldError(first, '');
        first.closest('.field').classList.remove('invalid');
      });
    });
  });

  // Reset (the Clear button) wipes every error message.
  form.addEventListener('reset', () => {
    form.querySelectorAll('.field-error').forEach((s) => { s.textContent = ''; });
    form.querySelectorAll('.invalid').forEach((c) => c.classList.remove('invalid'));
    form.querySelectorAll('.rating-btn').forEach((b) => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); });
    const rating = form.querySelector('#rating-value');
    if (rating) rating.value = '';
    showNote('', 'ok');
  });
  const clearBtn = form.querySelector('#clear-btn');
  if (clearBtn) clearBtn.addEventListener('click', () => form.reset());

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // 1. Validate every field and remember the first one that is wrong.
    let firstBad = null;
    let badCount = 0;
    config.fields.forEach((def) => {
      const control = form.querySelector('#' + def.id);
      if (!control) return;
      const message = validateField(form, def);
      setFieldError(control, message);
      if (message) { badCount++; if (!firstBad) firstBad = control; }
    });

    (config.radioGroups || []).forEach((group) => {
      const radios = form.querySelectorAll('input[name="' + group.name + '"]');
      const chosen = form.querySelector('input[name="' + group.name + '"]:checked');
      const message = group.required && !chosen ? 'Please select ' + group.label.toLowerCase() + '.' : '';
      setFieldError(radios[0], message);
      radios[0].closest('.field').classList.toggle('invalid', message !== '');
      if (message) { badCount++; if (!firstBad) firstBad = radios[0]; }
    });

    if (firstBad) {
      showNote('Please fix the ' + badCount + ' highlighted field' + (badCount > 1 ? 's' : '') + ' below and try again.', 'error');
      firstBad.focus();
      return;
    }

    // 2. Collect the answers.
    const data = collectFormData(form);
    const reference = 'LB-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
    data.reference = reference;
    data.sentAt = new Date().toISOString();

    // 3. Keep a copy in this browser (a simple log of what was submitted).
    saveLocally(data);

    // 4. Build the email and hand it to the visitor's email app.
    const mailtoLink = buildMailto(config.subject, reference, data);
    window.location.href = mailtoLink;

    // 5. Show the confirmation panel with a summary of what was submitted.
    showNote('', 'ok');
    showConfirmation(form, successPanel, data, mailtoLink);
  });
}

/** Reads every answer on the form into a plain object with readable labels. */
function collectFormData(form) {
  const get = (id) => { const el = form.querySelector('#' + id); return el ? el.value.trim() : ''; };
  const data = {
    'Name': get('name'),
    'Email': get('email'),
    'Mobile': get('mobile') || 'Not provided'
  };
  if (form.querySelector('#contact-subject')) data['Subject'] = get('contact-subject');
  if (form.querySelector('#enquiry-type')) {
    data['Enquiry type'] = get('enquiry-type');
    const products = Array.from(form.querySelectorAll('input[name="products"]:checked')).map((c) => c.value);
    data['Products'] = products.length ? products.join(', ') : 'None selected';
    const method = form.querySelector('input[name="contact-method"]:checked');
    data['Preferred contact method'] = method ? method.value : '';
    data['Date needed'] = get('needed-by') || 'Not specified';
  }
  data['Message'] = get('message');
  const rating = form.querySelector('#rating-value');
  if (rating) data['Rating'] = rating.value ? rating.value + ' / 5' : 'Not rated';
  return data;
}

/** Saves the submission to localStorage (never stops the form if storage is blocked). */
function saveLocally(data) {
  try {
    const list = JSON.parse(localStorage.getItem('lunathiEnquiries') || '[]');
    list.push(data);
    localStorage.setItem('lunathiEnquiries', JSON.stringify(list));
  } catch (error) {
    console.warn('Could not save a local copy:', error);
  }
}

/** Builds a mailto: link with the subject and body filled in. */
function buildMailto(subject, reference, data) {
  const lines = Object.keys(data)
    .filter((key) => key !== 'reference' && key !== 'sentAt')
    .map((key) => key + ': ' + data[key]);
  const body = 'Reference: ' + reference + '\n\n' + lines.join('\n');
  return 'mailto:' + BUSINESS_EMAIL + '?subject=' + encodeURIComponent('[' + reference + '] ' + subject) +
    '&body=' + encodeURIComponent(body);
}

/** Replaces the form with a confirmation panel that lists what was submitted. */
function showConfirmation(form, panel, data, mailtoLink) {
  if (!panel) return;
  const list = panel.querySelector('.summary-list');
  list.innerHTML = '';
  Object.keys(data).forEach((key) => {
    if (key === 'reference' || key === 'sentAt') return;
    const dt = document.createElement('dt'); dt.textContent = key;
    const dd = document.createElement('dd'); dd.textContent = data[key];   // textContent keeps user input safe
    list.append(dt, dd);
  });
  panel.querySelector('.ref-number').textContent = data.reference;
  panel.querySelector('.resend-link').href = mailtoLink;

  form.hidden = true;
  panel.hidden = false;
  panel.focus();

  panel.querySelector('.another-btn').onclick = () => {
    form.reset();
    panel.hidden = true;
    form.hidden = false;
    form.querySelector('input, select, textarea').focus();
  };
}
