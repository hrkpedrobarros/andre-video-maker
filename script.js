// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');

navToggle.addEventListener('click', () => navList.classList.toggle('active'));
navList.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navList.classList.remove('active'));
});

// Header scroll effect
const header = document.querySelector('.header');

// Scroll reveal for slide wrappers
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.slide-wrapper').forEach(el => revealObserver.observe(el));

// Form is handled by @formspree/ajax SDK

// ===== NAV INDICATOR =====
const indicator = document.getElementById('navIndicator');
const navLinks = document.querySelectorAll('.nav-list a[data-section]');
const sections = [];

navLinks.forEach(link => {
  const id = link.getAttribute('data-section');
  const target = document.getElementById(id);
  if (target) sections.push({ id, el: target, link });
});

function moveIndicator(link) {
  if (!link || window.innerWidth <= 768) return;
  const rect = link.getBoundingClientRect();
  const parentRect = navList.getBoundingClientRect();
  indicator.style.left = (rect.left - parentRect.left) + 'px';
  indicator.style.width = rect.width + 'px';
  indicator.classList.add('active');
}

function clearIndicator() {
  indicator.classList.remove('active');
  navLinks.forEach(l => l.classList.remove('nav-active'));
}

// Hover interactions
navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => moveIndicator(link));
  link.addEventListener('mouseleave', () => {
    const active = document.querySelector('.nav-list a.nav-active');
    if (active) moveIndicator(active);
    else clearIndicator();
  });
});

window.addEventListener('resize', () => {
  const active = document.querySelector('.nav-list a.nav-active');
  if (active && window.innerWidth > 768) moveIndicator(active);
  else clearIndicator();
});

// ===== SCROLL TRACK (lateral) =====
const trackLine = document.getElementById('trackLine');
const trackArrow = document.getElementById('trackArrow');
const trackDotsContainer = document.getElementById('trackDots');

// Create dots for each section
const allSections = document.querySelectorAll('.section, .hero');
allSections.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.classList.add('track-dot');
  dot.dataset.index = i;
  trackDotsContainer.appendChild(dot);
});
const trackDots = document.querySelectorAll('.track-dot');

// ===== UNIFIED SCROLL HANDLER =====
let lastScrollY = window.scrollY;
let scrollDirection = 'down';
let rafId = null;

function onScroll() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / docHeight, 1);

    // Scroll direction
    scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = scrollY;

    // Header
    header.style.background = scrollY > 60
      ? 'rgba(8, 8, 8, 0.97)'
      : 'rgba(8, 8, 8, 0.85)';

    // Nav scroll spy
    let currentIdx = -1;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (scrollY + 200 >= sections[i].el.offsetTop) {
        currentIdx = i;
        break;
      }
    }

    navLinks.forEach(l => l.classList.remove('nav-active'));
    if (currentIdx >= 0) {
      sections[currentIdx].link.classList.add('nav-active');
      moveIndicator(sections[currentIdx].link);
    } else {
      clearIndicator();
    }

    // Track line progress
    trackLine.style.setProperty('--progress', (progress * 100) + '%');

    // Track arrow direction
    if (scrollDirection === 'up') {
      trackArrow.classList.add('up');
    } else {
      trackArrow.classList.remove('up');
    }

    // Track dots — find which section block is in view
    let activeSectionIdx = 0;
    allSections.forEach((sec, i) => {
      const top = sec.offsetTop;
      if (scrollY + 300 >= top) activeSectionIdx = i;
    });

    trackDots.forEach((dot, i) => {
      dot.classList.remove('active', 'passed');
      if (i === activeSectionIdx) dot.classList.add('active');
      else if (i < activeSectionIdx) dot.classList.add('passed');
    });

    rafId = null;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });

// Initial call
onScroll();
