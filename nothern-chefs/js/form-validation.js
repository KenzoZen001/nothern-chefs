document.addEventListener("DOMContentLoaded", () => {
  // Form validation
  const forms = document.querySelectorAll("form")

  // Mock implementations for showToast, showSpinner, and hideSpinner
  // In a real application, these would be defined elsewhere or imported
  const showToast = (message, type) => {
    console.log(`Toast: ${message} (Type: ${type})`)
    // You would typically display a visual toast message here
  }

  const showSpinner = () => {
    console.log("Showing spinner...")
    // You would typically display a loading spinner here
  }

  const hideSpinner = () => {
    console.log("Hiding spinner...")
    // You would typically hide the loading spinner here
  }

  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input, textarea, select")

    inputs.forEach((input) => {
      // Add blur event listener to validate on focus out
      input.addEventListener("blur", () => {
        validateInput(input)
      })

      // Add input event listener for real-time validation
      input.addEventListener("input", () => {
        if (input.classList.contains("invalid")) {
          validateInput(input)
        }
      })
    })

    // Form submission
    form.addEventListener("submit", (e) => {
      let isValid = true

      // Validate all inputs
      inputs.forEach((input) => {
        if (!validateInput(input)) {
          isValid = false
        }
      })

      // Prevent submission if form is invalid
      if (!isValid) {
        e.preventDefault()

        // Show error message
        showToast("Please fix the errors in the form.", "error")

        // Scroll to first invalid input
        const firstInvalid = form.querySelector(".invalid")
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" })
          firstInvalid.focus()
        }
      } else {
        // If it's a login or register form, handle it
        if (form.id === "login-form" || form.id === "register-form") {
          e.preventDefault()
          handleAuthForm(form)
        }
      }
    })
  })

  // Input validation
  function validateInput(input) {
    const value = input.value.trim()
    const type = input.type
    const required = input.hasAttribute("required")
    const minLength = input.getAttribute("minlength")
    const pattern = input.getAttribute("pattern")
    const errorElement = input.nextElementSibling?.classList.contains("error-message") ? input.nextElementSibling : null

    // Create error message element if it doesn't exist
    let errorMsg = errorElement
    if (!errorMsg) {
      errorMsg = document.createElement("div")
      errorMsg.className = "error-message"
      input.parentNode.insertBefore(errorMsg, input.nextSibling)
    }

    // Check if required field is empty
    if (required && value === "") {
      input.classList.add("invalid")
      errorMsg.textContent = "This field is required"
      errorMsg.style.display = "block"
      return false
    }

    // Skip other validations if field is empty and not required
    if (value === "" && !required) {
      input.classList.remove("invalid")
      errorMsg.style.display = "none"
      return true
    }

    // Validate email
    if (type === "email" && value !== "") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(value)) {
        input.classList.add("invalid")
        errorMsg.textContent = "Please enter a valid email address"
        errorMsg.style.display = "block"
        return false
      }
    }

    // Validate password
    if (input.id === "password" && value !== "") {
      if (value.length < 8) {
        input.classList.add("invalid")
        errorMsg.textContent = "Password must be at least 8 characters long"
        errorMsg.style.display = "block"
        return false
      }
    }

    // Validate confirm password
    if (input.id === "confirm-password") {
      const password = document.getElementById("password").value
      if (value !== password) {
        input.classList.add("invalid")
        errorMsg.textContent = "Passwords do not match"
        errorMsg.style.display = "block"
        return false
      }
    }

    // Validate phone
    if (type === "tel" && value !== "") {
      const phonePattern = /^\d{10,}$/
      if (!phonePattern.test(value.replace(/\D/g, ""))) {
        input.classList.add("invalid")
        errorMsg.textContent = "Please enter a valid phone number"
        errorMsg.style.display = "block"
        return false
      }
    }

    // Validate minimum length
    if (minLength && value.length < Number.parseInt(minLength)) {
      input.classList.add("invalid")
      errorMsg.textContent = `This field must be at least ${minLength} characters long`
      errorMsg.style.display = "block"
      return false
    }

    // Validate pattern
    if (pattern && value !== "") {
      const regexPattern = new RegExp(pattern)
      if (!regexPattern.test(value)) {
        input.classList.add("invalid")
        errorMsg.textContent = "Please enter a valid value"
        errorMsg.style.display = "block"
        return false
      }
    }

    // If all validations pass
    input.classList.remove("invalid")
    errorMsg.style.display = "none"
    return true
  }

  // Handle login and register forms
  async function handleAuthForm(form) {
    const formId = form.id;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    // Show loading spinner
    showSpinner();

    try {
      if (formId === "loginForm") {
        // Login with Supabase
        await window.supabaseAuth.signIn(email, password);
        
        showToast("Login successful! Redirecting...", "success");

        setTimeout(() => {
          window.location.href = "account.html";
        }, 1500);
      }
    } catch (error) {
      hideSpinner();
      showToast(error.message || "Authentication failed", "error");
    }
  }

  // Password toggle
  const passwordToggles = document.querySelectorAll(".password-toggle")

  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = toggle.previousElementSibling

      if (input.type === "password") {
        input.type = "text"
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i>'
      } else {
        input.type = "password"
        toggle.innerHTML = '<i class="fas fa-eye"></i>'
      }
    })
  })

  // Login/Register tab switching
  const authTabs = document.querySelectorAll(".auth-tab")
  const authForms = document.querySelectorAll(".auth-form")

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs
      authTabs.forEach((tab) => tab.classList.remove("active"))

      // Add active class to clicked tab
      tab.classList.add("active")

      // Hide all forms
      authForms.forEach((form) => form.classList.remove("active"))

      // Show selected form
      const formId = tab.getAttribute("data-tab")
      document.getElementById(`${formId}-form`).classList.add("active")
    })
  })
})
