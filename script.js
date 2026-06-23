/* ─────────────────────────────────────────────────────────────
   PORTFOLIO — script.js
   Scroll spy · Nav highlight · Mobile menu · Counter animation
───────────────────────────────────────────────────────────── */

'use strict';

// ── Elements ──────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('.nav-link');
const content = document.getElementById('content');
const sections = document.querySelectorAll('.section');

// ─────────────────────────────────────────────────────────────
// 1. MOBILE SIDEBAR TOGGLE
// ─────────────────────────────────────────────────────────────
function openSidebar() {
  sidebar.classList.add('open');
  hamburger.classList.add('open');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  hamburger.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});

overlay.addEventListener('click', closeSidebar);

// ─────────────────────────────────────────────────────────────
// 5. COUNTER ANIMATION (Home stats)
// ─────────────────────────────────────────────────────────────
let countersRan = false;
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1200; // ms
  const step = 16;   // ~60fps
  const increment = target / (duration / step);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, step);
}

// ─────────────────────────────────────────────────────────────
// 2. TAB NAVIGATION — Handle section switching
// ─────────────────────────────────────────────────────────────
function switchSection(targetId) {
  // Hide all sections and remove active classes
  sections.forEach(section => {
    section.classList.remove('active-section');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Show target section and highlight corresponding nav link
  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.classList.add('active-section');
  }
  const targetLink = document.querySelector(`.nav-link[data-section="${targetId}"]`);
  if (targetLink) {
    targetLink.classList.add('active');
  }

  // Scroll back to top
  content.scrollTop = 0;

  // Trigger counters if switching to home
  if (targetId === 'home' && !countersRan) {
    countersRan = true;
    document.querySelectorAll('.stat-num-v2').forEach(animateCounter);
  }
}

// Initialize based on hash or default to home
const initialHash = window.location.hash.substring(1);
const sectionIdsArray = Array.from(sections).map(s => s.id);
const isValidHash = sectionIdsArray.includes(initialHash);
switchSection(isValidHash ? initialHash : 'home');

// Listen to popstate event to handle back/forward navigation
window.addEventListener('popstate', () => {
  const currentHash = window.location.hash.substring(1);
  const isValid = sectionIdsArray.includes(currentHash);
  switchSection(isValid ? currentHash : 'home');
});

// Listen to Backspace key press to navigate to the previous section/panel
document.addEventListener('keydown', (e) => {
  // Ignore if the user is typing in an input, textarea, or editing content
  const activeEl = document.activeElement;
  if (activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.isContentEditable
  )) {
    return;
  }

  // Handle Backspace navigation
  if (e.key === 'Backspace') {
    // Check if a lightbox/modal is active first. If so, close it rather than changing panels.
    const certLightbox = document.getElementById('cert-lightbox');
    const imageLightbox = document.getElementById('image-lightbox');
    const isCertLightboxActive = certLightbox && certLightbox.classList.contains('active');
    const isImageLightboxActive = imageLightbox && imageLightbox.classList.contains('active');

    if (isCertLightboxActive || isImageLightboxActive) {
      e.preventDefault();
      if (isCertLightboxActive) {
        certLightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
      if (isImageLightboxActive) {
        imageLightbox.classList.remove('active');
      }
      return;
    }

    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback: if there's no history, switch to the previous section in order
      const activeSection = document.querySelector('.active-section');
      if (activeSection) {
        const activeId = activeSection.id;
        const currentIndex = sectionIdsArray.indexOf(activeId);
        if (currentIndex > 0) {
          const prevId = sectionIdsArray[currentIndex - 1];
          switchSection(prevId);
          history.pushState(null, null, `#${prevId}`);
        }
      }
    }
  }
});


// ─────────────────────────────────────────────────────────────
// 3. NAV LINK & CTA CLICKS
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]:not(.cert-lightbox-download)').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    let targetId;
    if (anchor.classList.contains('nav-link')) {
      targetId = anchor.dataset.section;
    } else {
      targetId = anchor.getAttribute('href').substring(1);
    }
    
    if (document.getElementById(targetId)) {
      switchSection(targetId);
      history.pushState(null, null, `#${targetId}`);
    }
    
    if (window.innerWidth <= 700) closeSidebar();
  });
});

// ─────────────────────────────────────────────────────────────
// 6. CONTACT FORM — simple client-side feedback
// ─────────────────────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  
  const status = document.getElementById('form-status');
  const btn = document.getElementById('form-submit-btn');
  const formData = new FormData(e.target);
  
  // Prevents accidental sending if user forgot to swap out the placeholder
  if(formData.get('access_key') === 'YOUR_ACCESS_KEY_HERE') {
    alert("You need to enter your actual Web3Forms Access Key in index.html first!");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = 'Sending...';
  status.textContent = '';

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData
  })
  .then(async (response) => {
    let json = await response.json();
    if (response.status == 200) {
      status.textContent = '✓ Message sent successfully directly to my inbox!';
      status.style.color = '#10b981'; // Success green
      e.target.reset();
    } else {
      console.error(json);
      status.textContent = json.message || '✕ Something went wrong. Please try again.';
      status.style.color = '#ef4444'; // Error red
    }
  })
  .catch(error => {
    console.error(error);
    status.textContent = '✕ Network error. Could not send message.';
  })
  .finally(() => {
    btn.innerHTML = '<img src="https://api.iconify.design/lucide:send.svg?color=%23ffffff" alt="Send" width="16" height="16"> Send Message';
    btn.disabled = false;
    
    // Clear status after 5 seconds
    setTimeout(() => {
      status.textContent = '';
    }, 5000);
  });
}

// Keyboard Navigation custom switching removed as sections are now isolated tabs.

// ─────────────────────────────────────────────────────────────
// 7. CERTIFICATES GALLERY LIGHTBOX
// ─────────────────────────────────────────────────────────────
(function initCertLightbox() {
  const certLightbox   = document.getElementById('cert-lightbox');
  const certLightboxImg    = document.getElementById('cert-lightbox-img');
  const certLightboxTitle  = document.getElementById('cert-lightbox-title');
  const certLightboxClose  = document.getElementById('cert-lightbox-close');
  const certLightboxBdrop  = document.getElementById('cert-lightbox-backdrop');
  const certLightboxDl     = document.getElementById('cert-lightbox-download');

  if (!certLightbox) return;

  function openCertLightbox(src, title) {
    certLightboxImg.src   = src;
    certLightboxImg.alt   = title;
    certLightboxTitle.textContent = title;
    certLightboxDl.href   = src;
    certLightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCertLightbox() {
    certLightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  // View buttons inside each card
  document.querySelectorAll('.cert-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCertLightbox(btn.dataset.src, btn.dataset.title);
    });
  });

  // Click card body also opens lightbox
  document.querySelectorAll('.cert-gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const btn = card.querySelector('.cert-view-btn');
      if (btn) openCertLightbox(btn.dataset.src, btn.dataset.title);
    });
  });

  if (certLightboxClose) certLightboxClose.addEventListener('click', closeCertLightbox);
  if (certLightboxBdrop) certLightboxBdrop.addEventListener('click', closeCertLightbox);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCertLightbox();
  });
})();


// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// 8. FEATURED CAROUSEL — Expand to Full Reveal Logic
// ─────────────────────────────────────────────────────────────
(function initFeaturedCarousel() {
  const carousel   = document.getElementById('featured-carousel');
  const track      = document.getElementById('featured-track');
  const prevBtn    = document.getElementById('featured-prev');
  const nextBtn    = document.getElementById('featured-next');
  const indicators = carousel ? Array.from(carousel.querySelectorAll('.project-indicator')) : [];
  const TOTAL      = track ? track.querySelectorAll('img').length : 0;

  if (!carousel || !track || !prevBtn || !nextBtn || TOTAL === 0) return;
  const card       = carousel.closest('.featured-project-card');

  let isFullWidth = false;
  let currentIndex = 0;

  function applyState() {
    // Handle container expansion
    if (isFullWidth) {
      if (card) card.classList.add('expanded');
    } else {
      if (card) card.classList.remove('expanded');
    }

    // Translate track
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Indicators
    indicators.forEach((ind, i) => ind.classList.toggle('active', i === currentIndex));

    // Arrow visibility
    if (isFullWidth) {
      prevBtn.classList.add('visible');
    } else {
      prevBtn.classList.remove('visible');
    }

    if (currentIndex === TOTAL - 1) {
      nextBtn.classList.add('hidden');
    } else {
      nextBtn.classList.remove('hidden');
    }
  }

  // Initial state apply
  applyState();

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      applyState();
    } else if (isFullWidth) {
      isFullWidth = false;
      applyState();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (!isFullWidth) {
      isFullWidth = true;
      applyState();
    } else if (currentIndex < TOTAL - 1) {
      currentIndex++;
      applyState();
    }
  });

  // Indicators click logic
  indicators.forEach((ind, i) => {
    ind.addEventListener('click', () => {
      isFullWidth = true; // Clicking a dot always forces full width
      currentIndex = i;
      applyState();
    });
  });
})();

// ─────────────────────────────────────────────────────────────
// 9. GRID PROJECT CAROUSELS (Game Zone, Unity, etc.)
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('.project-image-wrapper.project-carousel').forEach(carousel => {
  const track      = carousel.querySelector('.project-carousel-track');
  const prevBtn    = carousel.querySelector('.project-prev');
  const nextBtn    = carousel.querySelector('.project-next');
  const indicators = carousel.querySelectorAll('.project-indicator');
  const total      = parseInt(carousel.dataset.images, 10);
  let current      = 0;

  if (total <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    const indContainer = carousel.querySelector('.project-indicators');
    if (indContainer) indContainer.style.display = 'none';
    return;
  }

  function update(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    indicators.forEach((ind, i) => ind.classList.toggle('active', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => update(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => update(current + 1));
  indicators.forEach((ind, i) => ind.addEventListener('click', () => update(i)));
});

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// 10. LIGHTBOX LOGIC
// ─────────────────────────────────────────────────────────────
const lightbox = document.getElementById('image-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let currentLightboxImgs = [];
let currentLightboxIndex = 0;

function updateLightboxImage() {
  if (currentLightboxImgs.length > 0) {
    lightboxImg.src = currentLightboxImgs[currentLightboxIndex].src;
    
    if (currentLightboxImgs.length > 1) {
      if (lightboxPrev) lightboxPrev.style.display = 'flex';
      if (lightboxNext) lightboxNext.style.display = 'flex';
    } else {
      if (lightboxPrev) lightboxPrev.style.display = 'none';
      if (lightboxNext) lightboxNext.style.display = 'none';
    }
  }
}

if (lightbox && lightboxImg && lightboxClose) {
  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
  });
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('active');
  });
}

if (lightboxPrev) {
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentLightboxIndex--;
    if (currentLightboxIndex < 0) currentLightboxIndex = currentLightboxImgs.length - 1;
    updateLightboxImage();
  });
}

if (lightboxNext) {
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentLightboxIndex++;
    if (currentLightboxIndex >= currentLightboxImgs.length) currentLightboxIndex = 0;
    updateLightboxImage();
  });
}

// Attach expand click handlers to all project wrappers
document.querySelectorAll('.project-image-wrapper').forEach(wrapper => {
  const expandBtn = wrapper.querySelector('.expand-btn');
  if (!expandBtn) return;
  
  expandBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const track = wrapper.querySelector('.project-carousel-track');
    
    if (track) {
      currentLightboxImgs = Array.from(track.querySelectorAll('img'));
      
      const activeInd = wrapper.querySelector('.project-indicator.active');
      currentLightboxIndex = 0;
      if (activeInd && activeInd.dataset.index) {
        currentLightboxIndex = parseInt(activeInd.dataset.index, 10);
      }
      
      if (currentLightboxImgs.length > 0) {
        updateLightboxImage();
        lightbox.classList.add('active');
      }
    }
  });
});


// ─────────────────────────────────────────────────────────────
// 11. DATA ANALYSIS — SQL Code Tab Switcher
// ─────────────────────────────────────────────────────────────
(function initSQLTabs() {
  const tabTrigger  = document.getElementById('da-tab-trigger');
  const tabWindow   = document.getElementById('da-tab-window');
  const codeTrigger = document.getElementById('da-code-trigger');
  const codeWindow  = document.getElementById('da-code-window');

  if (!tabTrigger || !tabWindow) return;

  tabTrigger.addEventListener('click', () => {
    tabTrigger.classList.add('active');
    tabWindow.classList.remove('active');
    codeTrigger.style.display = '';
    codeWindow.style.display = 'none';
  });

  tabWindow.addEventListener('click', () => {
    tabWindow.classList.add('active');
    tabTrigger.classList.remove('active');
    codeWindow.style.display = '';
    codeTrigger.style.display = 'none';
  });
})();

// ─────────────────────────────────────────────────────────────
// 12. DATA ANALYSIS — Fraud Simulator
// ─────────────────────────────────────────────────────────────
(function initFraudSimulator() {
  const runBtn = document.getElementById('da-sim-run');
  const t1     = document.getElementById('da-sim-t1');
  const t2     = document.getElementById('da-sim-t2');
  const msg    = document.getElementById('da-sim-msg');

  if (!runBtn || !t1 || !t2) return;

  function resetSim() {
    [t1, t2].forEach(row => {
      row.className = 'da-sim-row da-sim-idle';
      row.querySelector('.da-sim-indicator').className = 'da-sim-indicator idle';
      row.querySelector('.da-sim-status').textContent = 'Waiting...';
    });
    msg.textContent = '';
    runBtn.disabled = false;
    runBtn.textContent = '▶ Run Simulation';
  }

  function runSim() {
    resetSim();
    runBtn.disabled = true;
    runBtn.textContent = '⏳ Running...';

    // Step 1 — Delhi approved after 800ms
    setTimeout(() => {
      t1.className = 'da-sim-row approved';
      t1.querySelector('.da-sim-indicator').className = 'da-sim-indicator ok';
      t1.querySelector('.da-sim-status').textContent = '✓ APPROVED';
    }, 800);

    // Step 2 — New York blocked after 1800ms
    setTimeout(() => {
      t2.className = 'da-sim-row blocked';
      t2.querySelector('.da-sim-indicator').className = 'da-sim-indicator bad';
      t2.querySelector('.da-sim-status').textContent = '🚨 BLOCKED';
    }, 1800);

    // Step 3 — Message + re-enable button after 2400ms
    setTimeout(() => {
      msg.textContent = '⚡ Impossible Velocity: 2 continents in 3 min — Trigger fired!';
      runBtn.disabled = false;
      runBtn.textContent = '↺ Re-run';
    }, 2400);
  }

  runBtn.addEventListener('click', runSim);
})();

// ─────────────────────────────────────────────────────────────
// 13. DATA ANALYSIS — Power BI Page Tab Switcher + Lightbox
// ─────────────────────────────────────────────────────────────
(function initPBITabs() {
  const pbiTabs  = document.querySelectorAll('.da-pbi-tab');
  const pbiPages = document.querySelectorAll('.da-pbi-page');

  if (!pbiTabs.length) return;

  pbiTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.page;
      pbiTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      pbiPages.forEach(p => {
        if (p.id === `da-pbi-page-${target}`) {
          p.style.display = '';
        } else {
          p.style.display = 'none';
        }
      });
    });
  });

  // Power BI expand buttons — wire into the existing lightbox
  document.querySelectorAll('.da-pbi-expand').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!lightbox || !lightboxImg) return;

      const imgs = btn.dataset.imgs.split('|');
      currentLightboxImgs = imgs.map(src => ({ src }));
      currentLightboxIndex = parseInt(btn.dataset.index, 10);

      lightboxImg.src = currentLightboxImgs[currentLightboxIndex].src;

      if (lightboxPrev) lightboxPrev.style.display = imgs.length > 1 ? 'flex' : 'none';
      if (lightboxNext) lightboxNext.style.display = imgs.length > 1 ? 'flex' : 'none';

      lightbox.classList.add('active');
    });
  });
})();


// ─────────────────────────────────────────────────────────────
// 14. MOBILE TOP NAV — Active link sync
// ─────────────────────────────────────────────────────────────
(function initMobileNav() {
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  if (!mobileNavLinks.length) return;

  function setMobileActive(targetId) {
    mobileNavLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === targetId);
    });

    // Auto-scroll the active link into view in the scroll area
    const activeLink = document.querySelector(`.mobile-nav-link[data-section="${targetId}"]`);
    if (activeLink) {
      activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // Wire mobile nav links to the existing switchSection function
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.dataset.section;
      if (document.getElementById(targetId)) {
        switchSection(targetId);
        setMobileActive(targetId);
        history.pushState(null, null, `#${targetId}`);
      }
    });
  });

  // Patch switchSection to keep mobile nav in sync
  const originalSwitch = switchSection;
  window.switchSection = function(targetId) {
    originalSwitch(targetId);
    setMobileActive(targetId);
  };

  // Set initial state
  const initHash = window.location.hash.substring(1);
  const validSections = Array.from(document.querySelectorAll('.section')).map(s => s.id);
  setMobileActive(validSections.includes(initHash) ? initHash : 'home');
})();


// ─────────────────────────────────────────────────────────────
// 15. MOBILE CORTEX CAROUSEL
// ─────────────────────────────────────────────────────────────
(function initMobileCortexCarousel() {
  const track   = document.getElementById('mobile-cortex-track');
  const prevBtn = document.getElementById('mobile-cortex-prev');
  const nextBtn = document.getElementById('mobile-cortex-next');
  const counter = document.getElementById('mobile-cortex-counter');

  if (!track || !prevBtn || !nextBtn) return;

  const images = track.querySelectorAll('img');
  const TOTAL  = images.length;
  let current  = 0;

  function goTo(index) {
    if (index < 0) index = TOTAL - 1;
    if (index >= TOTAL) index = 0;
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    if (counter) counter.textContent = `${current + 1} / ${TOTAL}`;
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });

  goTo(0);
})();


// ─────────────────────────────────────────────────────────────
// 16. MOBILE FRAUD SIMULATOR
// ─────────────────────────────────────────────────────────────
(function initMobileFraudSimulator() {
  const runBtn  = document.getElementById('mobile-da-sim-run');
  const t1      = document.getElementById('mobile-da-sim-t1');
  const t2      = document.getElementById('mobile-da-sim-t2');
  const dot1    = document.getElementById('mobile-da-dot-1');
  const dot2    = document.getElementById('mobile-da-dot-2');
  const status1 = document.getElementById('mobile-da-status-1');
  const status2 = document.getElementById('mobile-da-status-2');
  const msg     = document.getElementById('mobile-da-sim-msg');

  if (!runBtn || !t1 || !t2) return;

  function resetMobileSim() {
    [t1, t2].forEach(row => row.className = 'mobile-da-sim-row');
    dot1.className = 'mobile-da-sim-dot idle';
    dot2.className = 'mobile-da-sim-dot idle';
    status1.textContent = 'Waiting...';
    status2.textContent = 'Waiting...';
    msg.textContent = '';
    runBtn.disabled = false;
    runBtn.textContent = '▶ Run';
  }

  function runMobileSim() {
    resetMobileSim();
    runBtn.disabled = true;
    runBtn.textContent = '⏳';

    setTimeout(() => {
      t1.className = 'mobile-da-sim-row approved';
      dot1.className = 'mobile-da-sim-dot ok';
      status1.textContent = '✓ APPROVED';
    }, 800);

    setTimeout(() => {
      t2.className = 'mobile-da-sim-row blocked';
      dot2.className = 'mobile-da-sim-dot bad';
      status2.textContent = '🚨 BLOCKED';
    }, 1800);

    setTimeout(() => {
      msg.textContent = '⚡ Impossible velocity — Trigger fired!';
      runBtn.disabled = false;
      runBtn.textContent = '↺ Re-run';
    }, 2400);
  }

  runBtn.addEventListener('click', runMobileSim);
})();


// ─────────────────────────────────────────────────────────────
// 17. MOBILE POWER BI TAB SWITCHER
// ─────────────────────────────────────────────────────────────
(function initMobilePBITabs() {
  const tabs  = document.querySelectorAll('.mobile-pbi-tab');
  const pages = document.querySelectorAll('.mobile-pbi-page');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.page;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      pages.forEach(p => {
        p.style.display = (p.id === `mobile-pbi-page-${target}`) ? '' : 'none';
      });
    });
  });
})();

