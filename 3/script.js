// ===== INIT ON DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
  initCarousel();
  initAnimatedCounters();
  initFloatingBubbles();
  initScrollAnimations();
  initSmoothScrolling();
});

// ===== CAROUSEL FUNCTIONALITY =====
function initCarousel() {
  const carouselWrapper = document.querySelector('.features-carousel-wrapper');
  if (!carouselWrapper) return;

  const carousel = carouselWrapper.querySelector('.features-carousel');
  const slides = carousel.querySelectorAll('.feature-slide');
  const prevBtn = carouselWrapper.querySelector('.carousel-prev');
  const nextBtn = carouselWrapper.querySelector('.carousel-next');
  const dotsContainer = carouselWrapper.querySelector('.carousel-dots');

  if (!carousel || slides.length === 0) return;

  // Clone slides for infinite loop
  const firstSlide = slides[0].cloneNode(true);
  const lastSlide = slides[slides.length - 1].cloneNode(true);
  carousel.insertBefore(lastSlide, slides[0]);
  carousel.appendChild(firstSlide);

  const allSlides = carousel.querySelectorAll('.feature-slide');
  const slideWidth = allSlides[0].offsetWidth + 24; // width + gap
  const realSlideCount = slides.length;
  
  // Start at the first real slide (index 1, since we added clone at start)
  let currentIndex = 1;
  carousel.scrollLeft = slideWidth * currentIndex;

  // Create dots
  for (let i = 0; i < realSlideCount; i++) {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToRealSlide(i));
    dotsContainer.appendChild(dot);
  }

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function updateDots() {
    const realIndex = currentIndex === 0 ? realSlideCount - 1 : 
                     currentIndex === allSlides.length - 1 ? 0 : 
                     currentIndex - 1;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === realIndex);
    });
  }

  function goToRealSlide(realIndex) {
    currentIndex = realIndex + 1; // +1 because first slide is clone
    carousel.scrollTo({
      left: slideWidth * currentIndex,
      behavior: 'smooth'
    });
    updateDots();
  }

  function checkInfiniteScroll() {
    // If at the last clone (end), jump to first real slide
    if (currentIndex >= allSlides.length - 1) {
      carousel.style.scrollBehavior = 'auto';
      currentIndex = 1;
      carousel.scrollLeft = slideWidth * currentIndex;
      carousel.style.scrollBehavior = 'smooth';
    }
    // If at the first clone (start), jump to last real slide
    else if (currentIndex <= 0) {
      carousel.style.scrollBehavior = 'auto';
      currentIndex = realSlideCount;
      carousel.scrollLeft = slideWidth * currentIndex;
      carousel.style.scrollBehavior = 'smooth';
    }
  }

  prevBtn?.addEventListener('click', () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : allSlides.length - 1;
    carousel.scrollTo({
      left: slideWidth * currentIndex,
      behavior: 'smooth'
    });
    setTimeout(checkInfiniteScroll, 300);
    updateDots();
  });

  nextBtn?.addEventListener('click', () => {
    currentIndex = currentIndex < allSlides.length - 1 ? currentIndex + 1 : 0;
    carousel.scrollTo({
      left: slideWidth * currentIndex,
      behavior: 'smooth'
    });
    setTimeout(checkInfiniteScroll, 300);
    updateDots();
  });

  // Auto-scroll on mobile swipe
  let startX = 0;
  carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  carousel.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        currentIndex = currentIndex < allSlides.length - 1 ? currentIndex + 1 : 0;
      } else {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : allSlides.length - 1;
      }
      carousel.scrollTo({
        left: slideWidth * currentIndex,
        behavior: 'smooth'
      });
      setTimeout(checkInfiniteScroll, 300);
      updateDots();
    }
  });

  // Update on scroll (for desktop drag)
  let scrollTimeout;
  let isScrolling = false;
  carousel.addEventListener('scroll', () => {
    if (isScrolling) return;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollPosition = carousel.scrollLeft;
      const newIndex = Math.round(scrollPosition / slideWidth);
      
      if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        updateDots();
        checkInfiniteScroll();
      }
    }, 150);
  });

  // Auto-scroll infinite loop
  let autoScrollInterval = setInterval(() => {
    currentIndex = currentIndex < allSlides.length - 1 ? currentIndex + 1 : 0;
    carousel.scrollTo({
      left: slideWidth * currentIndex,
      behavior: 'smooth'
    });
    setTimeout(checkInfiniteScroll, 300);
    updateDots();
  }, 4000);

  // Pause on hover
  carousel.addEventListener('mouseenter', () => {
    clearInterval(autoScrollInterval);
  });

  carousel.addEventListener('mouseleave', () => {
    autoScrollInterval = setInterval(() => {
      currentIndex = currentIndex < allSlides.length - 1 ? currentIndex + 1 : 0;
      carousel.scrollTo({
        left: slideWidth * currentIndex,
        behavior: 'smooth'
      });
      setTimeout(checkInfiniteScroll, 300);
      updateDots();
    }, 4000);
  });
}

// ===== ANIMATED COUNTERS =====
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.highlight-number');
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        animateCounter(entry.target);
        entry.target.classList.add('counted');
      }
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const text = element.textContent;
  const match = text.match(/(\d+[\d,]*)/);
  
  if (!match) return;

  const numStr = match[1].replace(/,/g, '');
  const targetNum = parseInt(numStr);
  const duration = 2000;
  const steps = 60;
  const increment = targetNum / steps;
  let current = 0;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    current += increment;
    
    if (step >= steps) {
      current = targetNum;
      clearInterval(timer);
    }

    const formatted = Math.floor(current).toLocaleString('nl-NL');
    element.textContent = text.replace(/\d+[\d,]*/, formatted);
  }, duration / steps);
}

// ===== FLOATING BUBBLES BACKGROUND =====
function initFloatingBubbles() {
  const hero = document.querySelector('.klarna-hero-section');
  if (!hero) return;

  const bubbleCount = 8;
  
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('floating-bubble');
    bubble.style.cssText = `
      position: absolute;
      width: ${Math.random() * 60 + 40}px;
      height: ${Math.random() * 60 + 40}px;
      background: radial-gradient(circle, rgba(69, 175, 254, 0.1), rgba(69, 175, 254, 0.02));
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: bubbleFloat ${Math.random() * 10 + 15}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
      pointer-events: none;
      z-index: 0;
    `;
    hero.appendChild(bubble);
  }

  // Add animation to stylesheet dynamically
  if (!document.querySelector('#bubble-animation')) {
    const style = document.createElement('style');
    style.id = 'bubble-animation';
    style.textContent = `
      @keyframes bubbleFloat {
        0%, 100% {
          transform: translate(0, 0) scale(1);
          opacity: 0.3;
        }
        25% {
          transform: translate(30px, -50px) scale(1.1);
          opacity: 0.5;
        }
        50% {
          transform: translate(-20px, -100px) scale(0.9);
          opacity: 0.4;
        }
        75% {
          transform: translate(40px, -70px) scale(1.05);
          opacity: 0.6;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.glass-card, .criteria-card, .condition-item, .rg-card');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 50);
      }
    });
  }, observerOptions);

  animatedElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
  });
}

// ===== SMOOTH SCROLLING =====
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ===== GLOW EFFECT ON HOVER =====
document.addEventListener('DOMContentLoaded', function() {
  const glowElements = document.querySelectorAll('.pulse-button, .badge-icon, .criteria-icon');
  
  glowElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.filter = 'drop-shadow(0 0 20px rgba(69, 175, 254, 0.6))';
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.filter = '';
    });
  });
});

// ===== TABLE RESPONSIVE SCROLL HINT =====
document.addEventListener('DOMContentLoaded', function() {
  const tableWrappers = document.querySelectorAll('.comparison-table-wrapper, .alternatives-table-wrapper');
  
  tableWrappers.forEach(wrapper => {
    const table = wrapper.querySelector('table');
    if (!table) return;
    
    if (table.scrollWidth > wrapper.clientWidth) {
      wrapper.classList.add('has-scroll');
      
      // Add scroll indicator
      const indicator = document.createElement('div');
      indicator.className = 'scroll-indicator';
      indicator.textContent = '← Scroll horizontaal →';
      indicator.style.cssText = `
        text-align: center;
        font-size: 0.85rem;
        color: var(--accent-cyan);
        padding: 8px;
        font-weight: 600;
      `;
      wrapper.appendChild(indicator);
      
      wrapper.addEventListener('scroll', function() {
        if (this.scrollLeft > 50) {
          indicator.style.opacity = '0';
        } else {
          indicator.style.opacity = '1';
        }
      });
    }
  });
});

// ===== PARALLAX EFFECT =====
window.addEventListener('scroll', function() {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.klarna-hero-section::before');
  
  if (parallaxElements.length > 0) {
    document.querySelector('.klarna-hero-section').style.transform = `translateY(${scrolled * 0.3}px)`;
  }
});

// ===== ADD DOT PATTERN TO BODY =====
document.addEventListener('DOMContentLoaded', function() {
  const dotPattern = document.createElement('div');
  dotPattern.className = 'dot-pattern';
  document.body.appendChild(dotPattern);
});
