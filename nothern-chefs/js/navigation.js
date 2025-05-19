document.addEventListener("DOMContentLoaded", () => {
  // Navbar scroll effect
  const header = document.getElementById("main-header");
  const backToTopButton = document.getElementById("back-to-top");

  function updateHeader() {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
      if (backToTopButton) {
        backToTopButton.style.display = "flex";
      }
    } else {
      header.classList.remove("scrolled");
      if (backToTopButton) {
        backToTopButton.style.display = "none";
      }
    }
  }

  window.addEventListener("scroll", updateHeader);
  updateHeader();

  // Mobile menu functionality
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu-overlay");
  const closeMenu = document.querySelector(".close-menu");

  if (menuToggle && mobileMenu && closeMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.add("active");
      document.body.style.overflow = "hidden";
    });

    closeMenu.addEventListener("click", () => {
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "";
    });

    // Mobile dropdown functionality
    const mobileDropdownTriggers = document.querySelectorAll(".mobile-dropdown-trigger");
    
    mobileDropdownTriggers.forEach(trigger => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        const dropdownMenu = trigger.nextElementSibling;
        dropdownMenu.classList.toggle("active");
        
        // Toggle icon
        const icon = trigger.querySelector("i");
        if (icon) {
          if (icon.classList.contains("fa-chevron-down")) {
            icon.classList.remove("fa-chevron-down");
            icon.classList.add("fa-chevron-up");
          } else {
            icon.classList.remove("fa-chevron-up");
            icon.classList.add("fa-chevron-down");
          }
        }
      });
    });

    // Close mobile menu when clicking on a link
    const mobileLinks = document.querySelectorAll(".mobile-nav-links a:not(.mobile-dropdown-trigger)");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }

  // Back to top button functionality
  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // Desktop dropdown functionality
  const dropdownTriggers = document.querySelectorAll(".dropdown-trigger");
  
  dropdownTriggers.forEach(trigger => {
    const parent = trigger.parentElement;
    const dropdown = trigger.nextElementSibling;
    
    if (window.innerWidth > 992) {
      parent.addEventListener("mouseenter", () => {
        dropdown.style.opacity = "1";
        dropdown.style.visibility = "visible";
        dropdown.style.transform = "translateY(0)";
      });
      
      parent.addEventListener("mouseleave", () => {
        dropdown.style.opacity = "0";
        dropdown.style.visibility = "hidden";
        dropdown.style.transform = "translateY(10px)";
      });
    } else {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        dropdown.style.opacity = dropdown.style.opacity === "1" ? "0" : "1";
        dropdown.style.visibility = dropdown.style.visibility === "visible" ? "hidden" : "visible";
        dropdown.style.transform = dropdown.style.transform === "translateY(0px)" ? "translateY(10px)" : "translateY(0)";
      });
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if(targetElement) {
        const headerOffset = header.offsetHeight;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  });

  // Enhanced smooth scroll for product sections
  function scrollToSection(targetId) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerHeight = document.querySelector('#main-header').offsetHeight;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20; // Added extra padding

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Product navigation click handlers
  document.querySelectorAll('.dropdown-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
      // Filter products if needed
      const category = targetId.replace('#', '');
      const filterButtons = document.querySelectorAll('.filter-button');
      filterButtons.forEach(btn => {
        if (btn.dataset.category === category) {
          btn.click();
        }
      });

      // Scroll to products section
      scrollToSection(targetId);
      
      // Close mobile menu if open
      const mobileMenu = document.querySelector('.mobile-menu-overlay');
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Active link highlighting
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav-links a");
  
  navLinks.forEach(link => {
    const linkHref = link.getAttribute("href");
    if (linkHref === currentPage || (currentPage === "" && linkHref === "index.html")) {
      link.classList.add("active");
    }
  });

  setupProductNavigation();
});

// Enhanced product navigation
function setupProductNavigation() {
  const productSections = document.querySelectorAll('.product-category-section');
  const filterButtons = document.querySelectorAll('.filter-button');
  const navLinks = document.querySelectorAll('.dropdown-menu a');

  // Intersection Observer for product sections
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -20% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Update active filter button
        const categoryId = entry.target.id;
        filterButtons.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.category === categoryId);
        });
      }
    });
  }, observerOptions);

  productSections.forEach(section => observer.observe(section));

  // Enhanced scroll to section
  function scrollToSection(targetId, filterCategory = null) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerHeight = document.querySelector('#main-header').offsetHeight;
      const filterHeight = document.querySelector('.product-filters').offsetHeight;
      const totalOffset = headerHeight + filterHeight + 20;
      
      // Click corresponding filter button if provided
      if (filterCategory) {
        filterButtons.forEach(btn => {
          if (btn.dataset.category === filterCategory) {
            btn.click();
          }
        });
      }

      window.scrollTo({
        top: targetElement.offsetTop - totalOffset,
        behavior: 'smooth'
      });
    }
  }

  // Update nav links click handlers
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const category = targetId.replace('#', '');
      scrollToSection(targetId, category);
    });
  });
}