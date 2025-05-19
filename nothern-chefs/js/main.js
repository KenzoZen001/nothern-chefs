document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      navMenu &&
      navMenu.classList.contains("active") &&
      !e.target.closest(".nav-menu") &&
      !e.target.closest(".hamburger")
    ) {
      hamburger.classList.remove("active")
      navMenu.classList.remove("active")
    }
  })

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href")

      if (href !== "#") {
        e.preventDefault()

        const target = document.querySelector(href)

        if (target) {
          // Close mobile menu if open
          if (hamburger && hamburger.classList.contains("active")) {
            hamburger.classList.remove("active")
            navMenu.classList.remove("active")
          }

          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: "smooth",
          })
        }
      }
    })
  })

  // Sticky header
  const header = document.querySelector(".header")
  const headerHeight = header ? header.offsetHeight : 0

  function handleScroll() {
    if (window.scrollY > headerHeight) {
      header.classList.add("sticky")
    } else {
      header.classList.remove("sticky")
    }
  }

  if (header) {
    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initialize on page load
  }

  // Back to top button
  const backToTopBtn = document.createElement("button")
  backToTopBtn.className = "back-to-top"
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'
  document.body.appendChild(backToTopBtn)

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("show")
    } else {
      backToTopBtn.classList.remove("show")
    }
  })

  // Add back to top button styles if not in CSS
  const backToTopStyles = `
    .back-to-top {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      background-color: var(--primary-color);
      color: var(--secondary-color);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      z-index: 99;
    }
    
    .back-to-top.show {
      opacity: 1;
      visibility: visible;
    }
    
    .back-to-top:hover {
      background-color: var(--hover-color);
    }
  `

  if (!document.getElementById("back-to-top-styles")) {
    const styleElement = document.createElement("style")
    styleElement.id = "back-to-top-styles"
    styleElement.textContent = backToTopStyles
    document.head.appendChild(styleElement)
  }

  // Dark mode toggle
  const darkModeToggle = document.createElement("button")
  darkModeToggle.className = "dark-mode-toggle"
  darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'
  document.body.appendChild(darkModeToggle)

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode")
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'
  }

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode")

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark")
      darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>'
    } else {
      localStorage.setItem("theme", "light")
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>'
    }
  })

  // Add dark mode toggle styles if not in CSS
  const darkModeStyles = `
    .dark-mode-toggle {
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 40px;
      height: 40px;
      background-color: var(--primary-color);
      color: var(--secondary-color);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 99;
    }
    
    .dark-mode-toggle:hover {
      background-color: var(--hover-color);
    }
    
    body.dark-mode {
      --background-color: #121212;
      --text-color: #f5f5f5;
      --text-secondary: #aaaaaa;
      --border-color: #333333;
      --input-bg: #1a1a1a;
    }
  `

  if (!document.getElementById("dark-mode-styles")) {
    const styleElement = document.createElement("style")
    styleElement.id = "dark-mode-styles"
    styleElement.textContent = darkModeStyles
    document.head.appendChild(styleElement)
  }

  // Lazy loading images
  const lazyImages = document.querySelectorAll("img[data-src]")

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.removeAttribute("data-src")
          imageObserver.unobserve(img)
        }
      })
    })

    lazyImages.forEach((img) => {
      imageObserver.observe(img)
    })
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    lazyImages.forEach((img) => {
      img.src = img.dataset.src
      img.removeAttribute("data-src")
    })
  }

  // Add responsive CSS to head
  const linkElement = document.createElement("link")
  linkElement.rel = "stylesheet"
  linkElement.href = "responsive.css"
  document.head.appendChild(linkElement)
})
