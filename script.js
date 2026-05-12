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

// ─────────────────────────────────────────────────────────────
// 3. NAV LINK & CTA CLICKS
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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
// 7. CERTIFICATES CAROUSEL
// ─────────────────────────────────────────────────────────────
const certNamesList = document.getElementById('cert-names-list');
const certCarouselTrack = document.getElementById('cert-carousel-track');
const certPrevBtn = document.getElementById('cert-prev-btn');
const certNextBtn = document.getElementById('cert-next-btn');

if (certNamesList && certCarouselTrack) {
  const nameBtns = certNamesList.querySelectorAll('.cert-name-btn');
  const totalSlides = nameBtns.length;
  let currentCertIndex = 0;

  function updateCertCarousel(index) {
    // Wrap around logic
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    
    currentCertIndex = index;
    
    // Update track position
    certCarouselTrack.style.transform = `translateX(-${currentCertIndex * 100}%)`;
    
    // Update buttons
    nameBtns.forEach((btn, i) => {
      if (i === currentCertIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Click on names
  nameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      updateCertCarousel(parseInt(btn.dataset.index, 10));
    });
  });

  // Arrows
  if (certPrevBtn) {
    certPrevBtn.addEventListener('click', () => updateCertCarousel(currentCertIndex - 1));
  }
  if (certNextBtn) {
    certNextBtn.addEventListener('click', () => updateCertCarousel(currentCertIndex + 1));
  }
}

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

