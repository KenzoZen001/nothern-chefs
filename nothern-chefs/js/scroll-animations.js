document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  // Add animation classes to elements
  const animateElements = () => {
    // Hero section animations
    document.querySelector('.hero-content img').classList.add('fade-up');
    document.querySelector('.hero-content h1').classList.add('fade-up', 'delay-200');
    document.querySelector('.hero-content .cta-button').classList.add('fade-up', 'delay-400');

    // Welcome section animations
    document.querySelectorAll('.welcome-container > *').forEach((el, index) => {
      el.classList.add('fade-up', `delay-${index * 200}`);
    });

    // Product section animations
    document.querySelectorAll('.product-card').forEach((card, index) => {
      card.classList.add('zoom-in', `delay-${index * 100}`);
    });

    // Product filters animation
    document.querySelectorAll('.filter-button').forEach((btn, index) => {
      btn.classList.add('fade-up', `delay-${index * 100}`);
    });

    // Products container animations
    document.querySelectorAll('.product-item').forEach((item, index) => {
      item.classList.add(index % 2 === 0 ? 'fade-right' : 'fade-left', `delay-${index * 100}`);
    });

    // Coming soon banner animations
    document.querySelector('.coming-soon-banner').classList.add('fade-up');
    document.querySelectorAll('.coming-item').forEach((item, index) => {
      item.classList.add('zoom-in', `delay-${index * 200}`);
    });

    // Reviews section animations
    document.querySelector('.review-form-container').classList.add('fade-right');
    document.querySelectorAll('.review-card').forEach((card, index) => {
      card.classList.add('fade-left', `delay-${index * 100}`);
    });

    // Observe all elements with animation classes
    document.querySelectorAll('.fade-up, .fade-right, .fade-left, .zoom-in').forEach(el => {
      observer.observe(el);
    });
  };

  // Initial animation setup
  animateElements();

  // Re-run animations when content changes (e.g., after filtering products)
  document.addEventListener('contentChanged', animateElements);
});
