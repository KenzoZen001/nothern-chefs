document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const form = document.getElementById("registration-form")
    const steps = document.querySelectorAll(".form-step")
    const progressBar = document.querySelector(".progress")
    const stepIndicators = document.querySelectorAll(".step")
    const nextButtons = document.querySelectorAll(".next-btn")
    const prevButtons = document.querySelectorAll(".prev-btn")
    const passwordInput = document.getElementById("password")
    const confirmPasswordInput = document.getElementById("confirmPassword")
    const togglePasswordButtons = document.querySelectorAll(".toggle-password")
    const strengthBar = document.querySelector(".strength-bar")
    const strengthText = document.querySelector(".strength-text")
    const termsCheckbox = document.getElementById("termsCheckbox")
    const registerButton = document.getElementById("register-btn")
  
    // Current step tracker
    let currentStep = 1
    const totalSteps = steps.length
  
    // Form validation patterns
    const patterns = {
      firstName: /^[a-zA-Z]{2,}$/,
      lastName: /^[a-zA-Z]{2,}$/,
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      phone: /^[0-9]{10,15}$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    }
  
    // Error messages
    const errorMessages = {
      firstName: "First name must be at least 2 characters and contain only letters",
      lastName: "Last name must be at least 2 characters and contain only letters",
      email: "Please enter a valid email address",
      phone: "Please enter a valid phone number (10-15 digits)",
      password: "Password does not meet the requirements",
      confirmPassword: "Passwords do not match",
      terms: "You must accept the terms and conditions",
    }
  
    // Initialize form
    updateProgressBar()
  
    // Event Listeners
    nextButtons.forEach((button) => {
      button.addEventListener("click", goToNextStep)
    })
  
    prevButtons.forEach((button) => {
      button.addEventListener("click", goToPrevStep)
    })
  
    togglePasswordButtons.forEach((button) => {
      button.addEventListener("click", togglePasswordVisibility)
    })
  
    passwordInput.addEventListener("input", checkPasswordStrength)
  
    // Add input validation for all fields on blur and input for real-time feedback
    const inputs = form.querySelectorAll('input:not([type="checkbox"])')
    inputs.forEach((input) => {
      input.addEventListener("blur", validateInput)
      input.addEventListener("input", validateInput)
    })
  
    // Form submission
    form.addEventListener("submit", handleSubmit);

    async function handleSubmit(event) {
      event.preventDefault();
  
      // Validate all steps
      let isValid = true;
      for (let i = 1; i <= totalSteps; i++) {
        if (!validateStep(i)) {
          isValid = false;
          // Go to the first invalid step
          if (currentStep !== i) {
            currentStep = i;
            updateUI();
          }
          break;
        }
      }
  
      if (!isValid) {
        showNotification("Please fill in all required fields correctly", "error");
        return;
      }
  
      // Collect form data
      const formData = new FormData(form);
      const userData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
        favorites: formData.getAll("favorites[]"),
        referral: formData.get("referral"),
        terms: formData.get("terms") === "on",
      };
  
      // Disable button and show loading state
      registerButton.disabled = true;
      registerButton.textContent = "Creating Account...";
  
      try {
        // Register user with Supabase
        await window.supabaseAuth.signUp(
          userData.email, 
          userData.password, 
          {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            favorites: userData.favorites,
            referral: userData.referral
          }
        );
  
        showNotification("Account created successfully! Redirecting to login...", "success");
  
        // Show confetti animation
        startConfetti();
  
        // Reset form
        form.reset();
        currentStep = 1;
        updateUI();
  
        // Redirect to login page after delay
        setTimeout(() => {
          window.location.href = "login.html";
        }, 3000);
      } catch (error) {
        showNotification(error.message || "Error creating account", "error");
      } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Create Account";
      }
    }
  
    // Header scroll effect
    window.addEventListener("scroll", () => {
      const header = document.getElementById("main-header")
      if (window.scrollY > 50) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }
    })
  
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")
    const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay")
    const closeMenu = document.querySelector(".close-menu")
  
    mobileMenuToggle.addEventListener("click", () => {
      mobileMenuOverlay.classList.add("active")
      document.body.style.overflow = "hidden"
    })
  
    closeMenu.addEventListener("click", () => {
      mobileMenuOverlay.classList.remove("active")
      document.body.style.overflow = ""
    })
  
    // Mobile dropdown toggle
    const mobileDropdownTriggers = document.querySelectorAll(".mobile-dropdown-trigger")
  
    mobileDropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", function (e) {
        e.preventDefault()
        const dropdownMenu = this.nextElementSibling
        dropdownMenu.classList.toggle("active")
      })
    })
  
    // Back to top button
    const backToTopButton = document.getElementById("back-to-top")
  
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopButton.style.display = "flex"
      } else {
        backToTopButton.style.display = "none"
      }
    })
  
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    })
  
    // Functions
    function goToNextStep() {
      // Validate current step before proceeding
      if (!validateStep(currentStep)) {
        showNotification("Please fill in all required fields correctly", "error")
        return
      }
    
      if (currentStep < totalSteps) {
        // Hide current step
        steps[currentStep - 1].classList.remove("active")
        
        // Show next step
        currentStep++
        steps[currentStep - 1].classList.add("active")
        
        // Update progress bar and step indicators
        updateProgressBar()
        
        // Scroll to top of form
        scrollToTop()
      }
    }
  
    function goToPrevStep() {
      if (currentStep > 1) {
        // Hide current step
        steps[currentStep - 1].classList.remove("active")
  
        // Show previous step
        currentStep--
        steps[currentStep - 1].classList.add("active")
  
        // Update progress bar and step indicators
        updateProgressBar()
  
        // Scroll to top of form
        scrollToTop()
      }
    }
  
    function updateProgressBar() {
      // Update progress bar width
      const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100
      progressBar.style.width = `${progressPercentage}%`
  
      // Update step indicators
      stepIndicators.forEach((step, index) => {
        if (index + 1 < currentStep) {
          step.classList.add("active")
        } else if (index + 1 === currentStep) {
          step.classList.add("active")
        } else {
          step.classList.remove("active")
        }
      })
    }
  
    function scrollToTop() {
      const formContainer = document.querySelector(".login-right")
      formContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  
    function validateStep(step) {
      const currentStepElement = steps[step - 1];
      const requiredInputs = currentStepElement.querySelectorAll("input[required]");
      let isValid = true;
    
      requiredInputs.forEach((input) => {
        if (!validateInput({ target: input })) {
          isValid = false;
        }
      });
    
      // Special validation for step 3 (terms checkbox)
      if (step === 3 && !termsCheckbox.checked) {
        const errorElement = termsCheckbox.parentElement.querySelector(".error-message");
        errorElement.textContent = errorMessages.terms;
        isValid = false;
      }
    
      return isValid;
    }
  
    function validateInput(event) {
      const input = event.target;
      const inputName = input.id;
      const inputValue = input.value.trim();
      const errorElement = input.parentElement.querySelector(".error-message");
    
      // Skip validation for optional fields
      if (!input.hasAttribute("required") && inputValue === "") {
        errorElement.textContent = "";
        return true;
      }
    
      // Special validation for confirm password
      if (inputName === "confirmPassword") {
        if (inputValue !== passwordInput.value) {
          errorElement.textContent = errorMessages.confirmPassword;
          return false;
        } else {
          errorElement.textContent = "";
          return true;
        }
      }
    
      // Regular validation for other fields
      if (patterns[inputName]) {
        if (!patterns[inputName].test(inputValue)) {
          errorElement.textContent = errorMessages[inputName];
          return false;
        } else {
          errorElement.textContent = "";
          return true;
        }
      }
    
      return inputValue !== "";
    }
  
    function togglePasswordVisibility(event) {
      const button = event.target
      const inputId = button.getAttribute("data-for")
      const input = document.getElementById(inputId)
  
      if (input.type === "password") {
        input.type = "text"
        button.classList.remove("fa-eye")
        button.classList.add("fa-eye-slash")
      } else {
        input.type = "password"
        button.classList.remove("fa-eye-slash")
        button.classList.add("fa-eye")
      }
    }
  
    function checkPasswordStrength() {
      const password = passwordInput.value
      let strength = 0
      const strengthClass = ""
  
      // Update password requirement indicators
      const lengthReq = document.getElementById("length-req")
      const uppercaseReq = document.getElementById("uppercase-req")
      const lowercaseReq = document.getElementById("lowercase-req")
      const numberReq = document.getElementById("number-req")
      const specialReq = document.getElementById("special-req")
  
      // Check length
      if (password.length >= 8) {
        lengthReq.classList.add("valid")
        lengthReq.querySelector("i").classList.remove("fa-times-circle")
        lengthReq.querySelector("i").classList.add("fa-check-circle")
        strength += 1
      } else {
        lengthReq.classList.remove("valid")
        lengthReq.querySelector("i").classList.remove("fa-check-circle")
        lengthReq.querySelector("i").classList.add("fa-times-circle")
      }
  
      // Check uppercase
      if (/[A-Z]/.test(password)) {
        uppercaseReq.classList.add("valid")
        uppercaseReq.querySelector("i").classList.remove("fa-times-circle")
        uppercaseReq.querySelector("i").classList.add("fa-check-circle")
        strength += 1
      } else {
        uppercaseReq.classList.remove("valid")
        uppercaseReq.querySelector("i").classList.remove("fa-check-circle")
        uppercaseReq.querySelector("i").classList.add("fa-times-circle")
      }
  
      // Check lowercase
      if (/[a-z]/.test(password)) {
        lowercaseReq.classList.add("valid")
        lowercaseReq.querySelector("i").classList.remove("fa-times-circle")
        lowercaseReq.querySelector("i").classList.add("fa-check-circle")
        strength += 1
      } else {
        lowercaseReq.classList.remove("valid")
        lowercaseReq.querySelector("i").classList.remove("fa-check-circle")
        lowercaseReq.querySelector("i").classList.add("fa-times-circle")
      }
  
      // Check numbers
      if (/\d/.test(password)) {
        numberReq.classList.add("valid")
        numberReq.querySelector("i").classList.remove("fa-times-circle")
        numberReq.querySelector("i").classList.add("fa-check-circle")
        strength += 1
      } else {
        numberReq.classList.remove("valid")
        numberReq.querySelector("i").classList.remove("fa-check-circle")
        numberReq.querySelector("i").classList.add("fa-times-circle")
      }
  
      // Check special characters
      if (/[^A-Za-z0-9]/.test(password)) {
        specialReq.classList.add("valid")
        specialReq.querySelector("i").classList.remove("fa-times-circle")
        specialReq.querySelector("i").classList.add("fa-check-circle")
        strength += 1
      } else {
        specialReq.classList.remove("valid")
        specialReq.querySelector("i").classList.remove("fa-check-circle")
        specialReq.querySelector("i").classList.add("fa-times-circle")
      }
  
      // Update strength meter
      if (password.length === 0) {
        strengthBar.style.width = "0%"
        strengthBar.style.backgroundColor = ""
        strengthText.textContent = "Password strength"
      } else {
        const strengthPercentage = (strength / 5) * 100
        strengthBar.style.width = `${strengthPercentage}%`
  
        if (strength < 2) {
          strengthBar.style.backgroundColor = "#ff4d4d" // Red
          strengthText.textContent = "Weak"
        } else if (strength < 4) {
          strengthBar.style.backgroundColor = "#ffa64d" // Orange
          strengthText.textContent = "Medium"
        } else {
          strengthBar.style.backgroundColor = "#4CAF50" // Green
          strengthText.textContent = "Strong"
        }
      }
    }
  
    // Function to start confetti animation (replace with your actual confetti implementation)
    function startConfetti() {
      // Implement your confetti animation logic here
      // This is a placeholder, you'll need to add the actual code
      console.log("Confetti animation started!")
    }
  
    function handleSubmit(event) {
      event.preventDefault()
  
      // Validate all steps
      let isValid = true
      for (let i = 1; i <= totalSteps; i++) {
        if (!validateStep(i)) {
          isValid = false
          // Go to the first invalid step
          if (currentStep !== i) {
            currentStep = i
            updateUI()
          }
          break
        }
      }
  
      if (!isValid) {
        showNotification("Please fill in all required fields correctly", "error")
        return
      }
  
      // Collect form data
      const formData = new FormData(form)
      const userData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
        favorites: formData.getAll("favorites[]"),
        referral: formData.get("referral"),
        terms: formData.get("terms") === "on",
      }
  
      // Simulate form submission
      registerButton.disabled = true
      registerButton.textContent = "Creating Account..."
  
      setTimeout(() => {
        // Simulate successful registration
        console.log("User registered:", userData)
        showNotification("Account created successfully! Redirecting to login...", "success")
  
        // Show confetti animation
        startConfetti()
  
        // Reset form
        form.reset()
        currentStep = 1
        updateUI()
  
        // Redirect to login page after delay
        setTimeout(() => {
          window.location.href = "login.html"
        }, 3000)
  
        registerButton.disabled = false
        registerButton.textContent = "Create Account"
      }, 2000)
    }
  
    function updateUI() {
      // Hide all steps
      steps.forEach((step) => step.classList.remove("active"))
  
      // Show current step
      steps[currentStep - 1].classList.add("active")
  
      // Update progress bar and step indicators
      updateProgressBar()
    }
  
    function showNotification(message, type) {
      const notificationContainer = document.getElementById("notification-container")
  
      // Create notification element
      const notification = document.createElement("div")
      notification.className = `notification ${type}`
  
      // Add icon based on type
      let icon = ""
      if (type === "success") {
        icon = '<i class="fas fa-check-circle"></i>'
      } else if (type === "error") {
        icon = '<i class="fas fa-exclamation-circle"></i>'
      } else if (type === "info") {
        icon = '<i class="fas fa-info-circle"></i>'
      }
  
      // Set notification content
      notification.innerHTML = `
        ${icon}
        <div class="notification-message">${message}</div>
        <div class="notification-close">&times;</div>
      `
  
      // Add notification to container
      notificationContainer.appendChild(notification)
  
      // Show notification with animation
      setTimeout(() => {
        notification.classList.add("show")
      }, 10)
  
      // Set up close button
      const closeButton = notification.querySelector(".notification-close")
      closeButton.addEventListener("click", () => {
        notification.classList.remove("show")
        setTimeout(() => {
          notification.remove()
        }, 300)
      })
  
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.classList.remove("show")
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove()
            }
          }, 300)
        }
      }, 5000)
    }
  })

  document.addEventListener('DOMContentLoaded', function() {
    // Get all custom checkbox elements
    const customCheckboxes = document.querySelectorAll('.checkbox-custom');

    customCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function(event) {
            // Find the associated checkbox input
            const checkboxInput = this.parentNode.querySelector('input[type="checkbox"]');
            
            // Toggle the checkbox state
            checkboxInput.checked = !checkboxInput.checked;
        });
    });

    // Get all labels associated with a checkbox and prevent default behavior
    const labels = document.querySelectorAll('.terms label');

    labels.forEach(label => {
        label.addEventListener('click', function(event) {
            // Prevent the default label behavior
            event.preventDefault();
        });
    });
});