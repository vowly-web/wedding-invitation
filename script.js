

document.addEventListener('DOMContentLoaded', () => {

  /* ==============================================================
     CONFIGURATION
     This is the one place you need to look to change the date
     and where RSVPs are sent. Everything below reads from here.
     ============================================================== */

  /* ✏️ TO CHANGE THE WEDDING DATE:
     Format is 'YYYY-MM-DDTHH:MM:SS±HH:MM' (ISO 8601).
     The countdown timer below counts down to this exact moment.
     Make sure this matches the date you wrote in index.html
     (search for "WEDDING DATE TEXT" in that file).
     The "-07:00" is the UTC offset for Pacific Daylight Time —
     change it to match your venue's timezone. */
  const WEDDING_DATE = new Date('2026-09-12T16:00:00-07:00');

  /* ✏️ TO CHANGE WHERE RSVPs ARE SENT:
     This template ships with a working DEMO mode (no backend
     required) that simply confirms the RSVP on-screen. To connect
     it to a real destination, pick ONE of the options below:

     OPTION A — Form backend service (recommended, no server needed)
       1. Create a free form endpoint at https://formspree.io
          (or similar services like Getform, Basin, or FormSubmit).
       2. Set RSVP_MODE to 'endpoint' below.
       3. Paste your endpoint URL into RSVP_ENDPOINT.

     OPTION B — Your own backend / serverless function
       Same as Option A — just point RSVP_ENDPOINT at your API
       route, and make sure it accepts a JSON POST request.

     OPTION C — Plain email (no server, opens the guest's email app)
       Set RSVP_MODE to 'mailto' and update RSVP_EMAIL below.
       Note: this requires the guest to have an email client
       configured and to click "send" themselves.

     OPTION D — Demo only (default)
       Leave RSVP_MODE as 'demo'. Responses are not actually sent
       anywhere — the form simply shows a success message. Useful
       for previewing the design before your backend is ready. */
  const RSVP_MODE = 'demo';                                   // 'demo' | 'endpoint' | 'mailto'
  const RSVP_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // used when RSVP_MODE = 'endpoint'
  const RSVP_EMAIL = 'charlotte.and.henry@example.com';        // used when RSVP_MODE = 'mailto'


  /* ==============================================================
     1. ENVELOPE OPENING ANIMATION
     Sequence on wax-seal click:
       seal cracks & disappears -> flap rotates open ->
       invitation card slides up and out -> whole envelope
       screen fades away -> main site fades in -> countdown starts
     ============================================================== */
  const envelopeScreen = document.getElementById('envelopeScreen');
  const envelope        = document.getElementById('envelope');
  const waxSeal          = document.getElementById('waxSeal');
  const envelopeHint     = document.getElementById('envelopeHint');
  const mainContent      = document.getElementById('mainContent');

  let envelopeHasOpened = false;

  function openEnvelope() {
    if (envelopeHasOpened) return;
    envelopeHasOpened = true;

    envelopeHint.classList.add('is-hidden');
    waxSeal.classList.add('is-breaking');
    waxSeal.disabled = true;

    // Step 1: let the seal crack animation play, then open the flap + card
    setTimeout(() => {
      envelope.classList.add('is-open');
    }, 350);

    // Step 2: once the flap/card animation has had time to play, dismiss
    // the whole envelope screen and reveal the site underneath
    setTimeout(() => {
      envelopeScreen.classList.add('is-dismissed');
      revealMainSite();
    }, 1900);
  }

  function revealMainSite() {
    mainContent.classList.add('is-visible');
    document.body.style.overflow = '';
    startCountdown();
    initScrollReveal();
    // Allow the envelope screen to be fully removed from layout
    // after its fade-out transition finishes.
    setTimeout(() => { envelopeScreen.style.display = 'none'; }, 950);
  }

  waxSeal.addEventListener('click', openEnvelope);
  // Also allow opening with Enter/Space for keyboard users (button already
  // supports this natively, but we guard in case of custom key handling)
  waxSeal.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openEnvelope();
  });

  // Lock background scroll while the envelope screen is showing
  document.body.style.overflow = 'hidden';

  // "Skip envelope animation" link for accessibility / keyboard users
  document.querySelector('.skip-link').addEventListener('click', (e) => {
    e.preventDefault();
    openEnvelope();
    document.getElementById('main-content').focus({ preventScroll: false });
  });


  /* ==============================================================
     2. MOBILE NAVIGATION TOGGLE
     ============================================================== */
  const navToggle = document.getElementById('navToggle');
  const navMenu    = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // Close the mobile menu after a link is tapped (smooth scroll then closes)
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    });
  });


  /* ==============================================================
     3. LIVE COUNTDOWN TIMER
     Counts down to WEDDING_DATE (configured at the top of this file).
     Updates once per second. Switches to a celebration message once
     the date has passed.
     ============================================================== */
  const cdDays    = document.getElementById('cdDays');
  const cdHours   = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');
  const countdownGrid    = document.getElementById('countdownGrid');
  const countdownMessage = document.getElementById('countdownMessage');

  let countdownInterval = null;

  function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      clearInterval(countdownInterval);
      countdownGrid.hidden = true;
      countdownMessage.hidden = false;
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    cdDays.textContent    = String(days).padStart(2, '0');
    cdHours.textContent   = String(hours).padStart(2, '0');
    cdMinutes.textContent = String(minutes).padStart(2, '0');
    cdSeconds.textContent = String(seconds).padStart(2, '0');
  }

  function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }


  /* ==============================================================
     4. SCROLL-TRIGGERED REVEAL ANIMATIONS
     Adds the .reveal class behaviour to key content blocks the
     first time they're added to the DOM (called once the main
     site becomes visible), then uses IntersectionObserver to fade
     each one up into place as the guest scrolls to it.
     ============================================================== */
  function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
      '.timeline__item, .gallery__item, .details__card, .rsvp__form, .countdown__unit'
    );

    revealTargets.forEach((el) => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((el) => observer.observe(el));
  }


  /* ==============================================================
     5. GALLERY LIGHTBOX
     Clicking a gallery photo opens it large in a <dialog>.
     ✏️ To change gallery photos themselves, edit the <img> tags
     directly inside index.html (search "GALLERY SECTION").
     ============================================================== */
  const galleryGrid    = document.getElementById('galleryGrid');
  const lightbox        = document.getElementById('lightbox');
  const lightboxImage   = document.getElementById('lightboxImage');
  const lightboxClose   = document.getElementById('lightboxClose');

  galleryGrid.querySelectorAll('.gallery__item img').forEach((img) => {
    img.parentElement.setAttribute('tabindex', '0');
    img.parentElement.setAttribute('role', 'button');
    img.parentElement.setAttribute('aria-label', `Enlarge photo: ${img.alt}`);

    const open = () => {
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightbox.showModal();
    };

    img.parentElement.addEventListener('click', open);
    img.parentElement.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' || e.key === ' ') open();
    });
  });

  lightboxClose.addEventListener('click', () => lightbox.close());
  // Close when clicking the dark backdrop area outside the image
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });


  /* ==============================================================
     6. FLOATING MUSIC BUTTON
     ✏️ TO CHANGE THE BACKGROUND MUSIC FILE: see the <audio> element
     in index.html (search "BACKGROUND MUSIC") and replace the
     <source> src attribute with your own track.
     ============================================================== */
  const musicButton = document.getElementById('musicButton');
  const bgMusic       = document.getElementById('bgMusic');

  musicButton.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play()
        .then(() => {
          musicButton.classList.add('is-playing');
          musicButton.setAttribute('aria-pressed', 'true');
          musicButton.setAttribute('aria-label', 'Pause background music');
        })
        .catch(() => {
          // Autoplay / playback can be blocked by the browser until the
          // user interacts with the page — this click IS that interaction,
          // so failures here are usually just a missing audio file. Add
          // your own track by following the comment above the <audio>
          // element in index.html.
          console.warn('Could not play background music. Check that the audio file path in index.html is correct.');
        });
    } else {
      bgMusic.pause();
      musicButton.classList.remove('is-playing');
      musicButton.setAttribute('aria-pressed', 'false');
      musicButton.setAttribute('aria-label', 'Play background music');
    }
  });


  /* ==============================================================
     7. RSVP FORM HANDLING
     Validates required fields, then sends the response according
     to RSVP_MODE (configured at the top of this file).
     ============================================================== */
  const rsvpForm   = document.getElementById('rsvpForm');
  const rsvpStatus = document.getElementById('rsvpStatus');
  const rsvpSubmit = document.getElementById('rsvpSubmit');

  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!rsvpForm.checkValidity()) {
      rsvpForm.reportValidity();
      rsvpForm.classList.add('is-shaking');
      setTimeout(() => rsvpForm.classList.remove('is-shaking'), 400);
      return;
    }

    const formData = new FormData(rsvpForm);
    const payload = Object.fromEntries(formData.entries());

    rsvpSubmit.disabled = true;
    rsvpSubmit.textContent = 'Sending...';
    rsvpStatus.textContent = '';
    rsvpStatus.className = 'rsvp__status';

    try {
      await sendRsvp(payload);
      rsvpStatus.textContent = payload.attending === 'yes'
        ? `Thank you, ${payload.guestName.split(' ')[0]}! We can't wait to celebrate with you.`
        : `Thank you for letting us know, ${payload.guestName.split(' ')[0]}. You'll be missed!`;
      rsvpStatus.classList.add('is-success');
      rsvpForm.reset();
    } catch (err) {
      console.error('RSVP submission failed:', err);
      rsvpStatus.textContent = 'Something went wrong sending your RSVP. Please try again, or email us directly.';
      rsvpStatus.classList.add('is-error');
    } finally {
      rsvpSubmit.disabled = false;
      rsvpSubmit.textContent = 'Send RSVP';
    }
  });

  /**
   * Sends the RSVP payload according to RSVP_MODE.
   * See the configuration block at the top of this file for setup steps.
   */
  async function sendRsvp(payload) {
    if (RSVP_MODE === 'endpoint') {
      const response = await fetch(RSVP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`RSVP endpoint returned status ${response.status}`);
      return response;
    }

    if (RSVP_MODE === 'mailto') {
      const subject = encodeURIComponent(`RSVP from ${payload.guestName}`);
      const bodyLines = [
        `Name: ${payload.guestName}`,
        `Email: ${payload.guestEmail}`,
        `Phone: ${payload.guestPhone || '—'}`,
        `Attending: ${payload.attending === 'yes' ? 'Joyfully accepts' : 'Regretfully declines'}`,
        `Guests: ${payload.guestCount}`,
        `Meal: ${payload.mealChoice}`,
        `Message: ${payload.guestMessage || '—'}`
      ];
      window.location.href = `mailto:${RSVP_EMAIL}?subject=${subject}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
      return Promise.resolve();
    }

    // RSVP_MODE === 'demo' (default): simulate a short network delay so the
    // loading state is visible, but don't actually send the data anywhere.
    return new Promise((resolve) => setTimeout(resolve, 700));
  }

});