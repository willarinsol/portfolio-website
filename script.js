/* ==========================================================================
   CUSTOM CURSOR LOGIC (Damping, Interpolation, & View Badging)
   ========================================================================== */
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let glowX = 0, glowY = 0;

const customCursor = document.getElementById('customCursor');
const customCursorGlow = document.getElementById('customCursorGlow');
const cursorText = document.getElementById('cursorText');

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Interpolation (lerping) loop for custom cursors
function updateCursorPosition() {
  cursorX += (mouseX - cursorX) * 0.25;
  cursorY += (mouseY - cursorY) * 0.25;
  glowX += (mouseX - glowX) * 0.08;
  glowY += (mouseY - glowY) * 0.08;

  if (customCursor) {
    customCursor.style.left = `${cursorX}px`;
    customCursor.style.top = `${cursorY}px`;
  }
  if (customCursorGlow) {
    customCursorGlow.style.left = `${glowX}px`;
    customCursorGlow.style.top = `${glowY}px`;
  }
  requestAnimationFrame(updateCursorPosition);
}
requestAnimationFrame(updateCursorPosition);

// 1. General Hover animations for standard interactive elements
const hoverables = document.querySelectorAll('a, button, .btn, .magnetic-target, .skill-item, input, textarea');
hoverables.forEach(el => {
  el.addEventListener('mouseenter', () => {
    customCursor.classList.add('hovered');
    customCursorGlow.classList.add('hovered');
  });
  el.addEventListener('mouseleave', () => {
    customCursor.classList.remove('hovered');
    customCursorGlow.classList.remove('hovered');
  });
});

// 2. Specialized Hover animations for Gallery Work containers (VIEW state)
const cursorViewTriggers = document.querySelectorAll('.cursor-view-trigger');
cursorViewTriggers.forEach(trigger => {
  trigger.addEventListener('mouseenter', () => {
    customCursor.classList.add('view-state');
    customCursorGlow.classList.add('view-state');
    if (cursorText) cursorText.textContent = "VIEW";
  });
  trigger.addEventListener('mouseleave', () => {
    customCursor.classList.remove('view-state');
    customCursorGlow.classList.remove('view-state');
    if (cursorText) cursorText.textContent = "";
  });
});

/* ==========================================================================
   MAGNETIC INTERACTION (Micro-interactions)
   ========================================================================== */
const magneticTargets = document.querySelectorAll('.magnetic-target');
magneticTargets.forEach(target => {
  target.addEventListener('mousemove', (e) => {
    const rect = target.getBoundingClientRect();
    // Calculate distance of cursor from the center of the element
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    
    // Magnetic pull ratio
    target.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0)`;
    target.style.transition = 'none'; // Instant responsive mapping
  });

  target.addEventListener('mouseleave', () => {
    // Return to default smoothly
    target.style.transform = 'translate3d(0, 0, 0)';
    target.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  });
});

/* ==========================================================================
   SCROLL REVEAL INTERSECTION OBSERVER
   ========================================================================== */
const revealOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active-scroll');
      observer.unobserve(entry.target);
    }
  });
}, revealOptions);

const revealElements = document.querySelectorAll(
  '.reveal-fade, .reveal-fade-delay-1, .reveal-fade-delay-2, .reveal-fade-delay-3, .reveal-slide'
);
revealElements.forEach(el => observer.observe(el));

/* ==========================================================================
   DYNAMIC SCROLL-LINKED PARALLAX & HORIZONTAL MARQUEES
   ========================================================================== */
// Find parallax and marquee elements
const bgBlobs = document.querySelectorAll('.parallax-bg');
const heroDecoItems = document.querySelectorAll('.parallax-el');
const projectMedias = document.querySelectorAll('.parallax-media');
const projectBadges = document.querySelectorAll('.parallax-badge');
const marqueeLayer1 = document.querySelector('#marqueeLayer1 .marquee-inner');
const marqueeLayer2 = document.querySelector('#marqueeLayer2 .marquee-inner');

function handleScrollParallax() {
  const scrollTop = window.scrollY;
  const viewportHeight = window.innerHeight;

  // 1. Parallax background blobs (Global Scroll mapping)
  bgBlobs.forEach(blob => {
    const speed = parseFloat(blob.dataset.speed || 0.1);
    const offset = scrollTop * speed;
    blob.style.transform = `translate3d(0, ${offset}px, 0)`;
  });

  // 2. Hero decorations (Global Scroll mapping)
  heroDecoItems.forEach(item => {
    const speed = parseFloat(item.dataset.speed || 0.15);
    const offset = scrollTop * speed;
    if (item.classList.contains('square-outline')) {
      item.style.transform = `translate3d(0, ${offset}px, 0) rotate(45deg)`;
    } else {
      item.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
  });

  // 3. Project medias (Viewport position-relative mapping)
  projectMedias.forEach(media => {
    const parent = media.closest('.project-card');
    if (parent) {
      const rect = parent.getBoundingClientRect();
      const parentCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      
      const offsetFromCenter = parentCenter - viewportCenter;
      const speed = parseFloat(media.dataset.speed || 0.08);
      const translation = offsetFromCenter * speed;
      
      const img = media.querySelector('.project-img');
      if (img) {
        img.style.transform = `scale(1.08) translate3d(0, ${translation}px, 0)`;
      }
    }
  });

  // 4. Floating Project Badges (Viewport position-relative mapping)
  projectBadges.forEach(badge => {
    const parent = badge.closest('.project-card');
    if (parent) {
      const rect = parent.getBoundingClientRect();
      const parentCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      
      const offsetFromCenter = parentCenter - viewportCenter;
      const speed = parseFloat(badge.dataset.speed || 0.15);
      const translation = offsetFromCenter * speed;
      
      badge.style.transform = `translate3d(0, ${translation}px, 0)`;
    }
  });

  // 5. Horizontal Background Marquees
  if (marqueeLayer1) {
    // Translates left as user scrolls down
    const offset1 = scrollTop * 0.18;
    marqueeLayer1.style.transform = `translate3d(-${offset1}px, 0, 0)`;
  }
  if (marqueeLayer2) {
    // Translates right as user scrolls down
    const offset2 = scrollTop * 0.14;
    marqueeLayer2.style.transform = `translate3d(${offset2}px, 0, 0)`;
  }
}

// Throttle scroll event using RequestAnimationFrame for performance
let isScrolling = false;
window.addEventListener('scroll', () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      handleScrollParallax();
      updateActiveNavHighlight();
      isScrolling = false;
    });
    isScrolling = true;
  }
});

// Initial run to lay out items correct on load
handleScrollParallax();

/* ==========================================================================
   ACTIVE NAVIGATION LINK HIGHLIGHT ON SCROLL
   ========================================================================== */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNavHighlight() {
  let currentSectionId = 'hero';
  const viewportHeightOffset = window.innerHeight * 0.35; // Trigger scroll threshold early
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    
    if (window.scrollY >= (sectionTop - viewportHeightOffset)) {
      currentSectionId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSectionId}`) {
      link.classList.add('active');
    }
  });
}
