document.addEventListener("DOMContentLoaded", () => {
  // Get form elements
  const registrationForm = document.getElementById("registration-form")
  if (!registrationForm) return // Exit if form doesn't exist on this page

  const errorMessage = document.getElementById("error-message")
  const progressBar = document.querySelector(".progress")
  const steps = document.querySelectorAll(".step")
  const formSteps = document.querySelectorAll(".form-step")

  // Get buttons
  const step1Next = document.getElementById("step1-next")
  const step2Next = document.getElementById("step2-next")
  const step2Prev = document.getElementById("step2-prev")
  const step3Prev = document.getElementById("step3-prev")
  const registerBtn = document.getElementById("register-btn")

  // Password elements
  const passwordInput = document.getElementById("password")
  const confirmPasswordInput = document.getElementById("confirmPassword")
  const strengthBar = document.querySelector(".strength-bar")
  const strengthText = document.querySelector(".strength-text")
  const requirements = document.querySelectorAll(".requirement")
  const togglePasswordBtns = document.querySelectorAll(".toggle-password")

  let currentStep = 1

  // Function to show error message
  function showError(message) {
    errorMessage.style.display = "block"
    errorMessage.querySelector("p").textContent = message
  }

  // Function to hide error message
  function hideError() {
    errorMessage.style.display = "none"
  }

  // Function to validate step
  function validateStep(step) {
    hideError()

    switch (step) {
      case 1:
        const firstName = document.getElementById("firstName").value
        const lastName = document.getElementById("lastName").value
        const email = document.getElementById("email").value
        const phone = document.getElementById("phone").value

        if (!firstName || !lastName || !email || !phone) {
          showError("Please fill in all required fields")
          return false
        }

        if (!/^[a-zA-Z]{2,}$/.test(firstName)) {
          showError("First name must be at least 2 characters and contain only letters")
          return false
        }

        if (!/^[a-zA-Z]{2,}$/.test(lastName)) {
          showError("Last name must be at least 2 characters and contain only letters")
          return false
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
          showError("Please enter a valid email address")
          return false
        }

        if (!/^[0-9]{10,15}$/.test(phone.replace(/\D/g, ""))) {
          showError("Please enter a valid phone number (10-15 digits)")
          return false
        }

        return true

      case 2:
        const password = passwordInput.value
        const confirmPassword = confirmPasswordInput.value

        if (!password) {
          showError("Please enter a password")
          return false
        }

        if (password.length < 8) {
          showError("Password must be at least 8 characters long")
          return false
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(password)) {
          showError(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
          )
          return false
        }

        if (password !== confirmPassword) {
          showError("Passwords do not match")
          return false
        }

        return true

      case 3:
        const termsCheckbox = document.getElementById("termsCheckbox")

        if (!termsCheckbox.checked) {
          showError("You must accept the terms and conditions")
          return false
        }

        return true
    }
  }

  // Function to go to a specific step
  function goToStep(step) {
    console.log(`Going to step ${step}`)

    formSteps.forEach((formStep) => {
      formStep.classList.remove("active")
    })

    steps.forEach((stepEl) => {
      stepEl.classList.remove("active")
    })

    for (let i = 1; i <= step; i++) {
      steps[i - 1].classList.add("active")
    }

    formSteps[step - 1].classList.add("active")
    progressBar.style.width = `${((step - 1) / 2) * 100}%`
    currentStep = step
  }

  // Password strength checker
  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const password = this.value
      let strength = 0

      // Update requirements
      if (requirements.length >= 5) {
        requirements[0].classList.toggle("valid", password.length >= 8)
        requirements[0].querySelector("i").className =
          password.length >= 8 ? "fas fa-check-circle" : "fas fa-times-circle"

        requirements[1].classList.toggle("valid", /[A-Z]/.test(password))
        requirements[1].querySelector("i").className = /[A-Z]/.test(password)
          ? "fas fa-check-circle"
          : "fas fa-times-circle"

        requirements[2].classList.toggle("valid", /[a-z]/.test(password))
        requirements[2].querySelector("i").className = /[a-z]/.test(password)
          ? "fas fa-check-circle"
          : "fas fa-times-circle"

        requirements[3].classList.toggle("valid", /\d/.test(password))
        requirements[3].querySelector("i").className = /\d/.test(password)
          ? "fas fa-check-circle"
          : "fas fa-times-circle"

        requirements[4].classList.toggle("valid", /[^A-Za-z0-9]/.test(password))
        requirements[4].querySelector("i").className = /[^A-Za-z0-9]/.test(password)
          ? "fas fa-check-circle"
          : "fas fa-times-circle"
      }

      // Calculate strength
      if (password.length >= 8) strength += 1
      if (/[A-Z]/.test(password)) strength += 1
      if (/[a-z]/.test(password)) strength += 1
      if (/\d/.test(password)) strength += 1
      if (/[^A-Za-z0-9]/.test(password)) strength += 1

      // Update strength bar
      if (strengthBar) {
        strengthBar.style.width = `${(strength / 5) * 100}%`
        strengthBar.style.backgroundColor = strength < 2 ? "#ff4d4d" : strength < 4 ? "#ffa64d" : "#4CAF50"
      }

      // Update strength text
      if (strengthText) {
        strengthText.textContent =
          strength === 0 ? "Password strength" : strength < 2 ? "Weak" : strength < 4 ? "Medium" : "Strong"
      }
    })
  }

  // Toggle password visibility
  togglePasswordBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const input = this.previousElementSibling
      const type = input.getAttribute("type") === "password" ? "text" : "password"
      input.setAttribute("type", type)
      this.classList.toggle("fa-eye")
      this.classList.toggle("fa-eye-slash")
    })
  })

  // Step navigation - FIXED EVENT LISTENERS
  if (step1Next) {
    console.log("Found step1Next button")
    step1Next.addEventListener("click", (e) => {
      e.preventDefault() // Prevent default button behavior
      console.log("Step 1 Next clicked")
      if (validateStep(1)) {
        goToStep(2)
      }
    })
  }

  if (step2Next) {
    console.log("Found step2Next button")
    step2Next.addEventListener("click", (e) => {
      e.preventDefault() // Prevent default button behavior
      console.log("Step 2 Next clicked")
      if (validateStep(2)) {
        goToStep(3)
      }
    })
  }

  if (step2Prev) {
    console.log("Found step2Prev button")
    step2Prev.addEventListener("click", (e) => {
      e.preventDefault() // Prevent default button behavior
      console.log("Step 2 Prev clicked")
      goToStep(1)
    })
  }

  if (step3Prev) {
    console.log("Found step3Prev button")
    step3Prev.addEventListener("click", (e) => {
      e.preventDefault() // Prevent default button behavior
      console.log("Step 3 Prev clicked")
      goToStep(2)
    })
  }

  // Form submission
  if (registrationForm) {
    registrationForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      if (!validateStep(3)) return

      try {
        // Show loading state
        registerBtn.textContent = "Creating Account..."
        registerBtn.disabled = true

        // Get form data
        const firstName = document.getElementById("firstName").value
        const lastName = document.getElementById("lastName").value
        const email = document.getElementById("email").value
        const phone = document.getElementById("phone").value
        const password = document.getElementById("password").value

        // Get favorite products
        const favoriteCheckboxes = document.querySelectorAll('input[name="favorites[]"]:checked')
        const favorites = Array.from(favoriteCheckboxes).map((checkbox) => checkbox.value)

        // Get referral source
        const referral = document.getElementById("referral").value

        // Register user with Supabase
        if (window.supabaseAuth) {
          await window.supabaseAuth.signUp(email, password, {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            favorites: favorites,
            referral: referral,
          })

          // Show success message and redirect to login
          alert("Registration successful! Please check your email to confirm your account.")
          window.location.href = "login.html"
        } else {
          // Fallback if Supabase is not available
          console.log("Registration would happen here with:", {
            email,
            password,
            firstName,
            lastName,
            phone,
            favorites,
            referral,
          })
          alert("Registration successful! (Demo mode)")
          window.location.href = "login.html"
        }
      } catch (error) {
        showError(error.message || "Failed to register")

        // Reset button state
        registerBtn.textContent = "Create Account"
        registerBtn.disabled = false
      }
    })
  }
})
