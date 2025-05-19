document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab")
      
      // Update active states
      tabBtns.forEach(b => b.classList.remove("active"))
      btn.classList.add("active")
      
      // Show/hide content
      tabContents.forEach(content => {
        content.style.display = "none"
      })
      
      const selectedTab = document.getElementById(`${tabId}-tab`)
      if (selectedTab) {
        selectedTab.style.display = "block"
      }
      
      // Update delivery fee if switching to/from delivery tab
      const total = document.getElementById("total")
      const subtotalElement = document.getElementById("subtotal")
      const deliveryFeeElement = document.getElementById("delivery-fee")
      
      if (subtotalElement && deliveryFeeElement && total) {
        const subtotal = Number.parseFloat(subtotalElement.textContent.replace(/[^\d.]/g, ""))
        const deliveryFee = tabId === "delivery" ? (subtotal > 1000 ? 0 : 150) : 0
        
        deliveryFeeElement.textContent = deliveryFee === 0 ? "FREE" : `₱${deliveryFee.toFixed(2)}`
        total.textContent = `₱${(subtotal + deliveryFee).toFixed(2)}`
      }
    })
  })

  // Scheduled delivery/pickup time
  const deliveryTimeRadios = document.querySelectorAll('input[name="delivery-time"]')
  const scheduledTimeDiv = document.querySelector(".scheduled-time")

  if (deliveryTimeRadios.length > 0 && scheduledTimeDiv) {
    deliveryTimeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.value === "scheduled") {
          scheduledTimeDiv.style.display = "block"
        } else {
          scheduledTimeDiv.style.display = "none"
        }
      })
    })
  }

  const pickupTimeRadios = document.querySelectorAll('input[name="pickup-time"]')
  const pickupScheduledTimeDiv = document.querySelector(".pickup-scheduled-time")

  if (pickupTimeRadios.length > 0 && pickupScheduledTimeDiv) {
    pickupTimeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.value === "scheduled") {
          pickupScheduledTimeDiv.style.display = "block"
        } else {
          pickupScheduledTimeDiv.style.display = "none"
        }
      })
    })
  }

  // Set min date for date inputs to today
  const today = new Date().toISOString().split("T")[0]
  const dateInputs = document.querySelectorAll('input[type="date"]')

  dateInputs.forEach((input) => {
    input.min = today
  })

  // Payment method selection
  const paymentMethodSelect = document.getElementById("payment-method")
  const paymentDetails = document.querySelectorAll(".payment-details")

  if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener("change", () => {
      const selectedMethod = paymentMethodSelect.value

      // Hide all payment details
      paymentDetails.forEach((detail) => {
        detail.style.display = "none"
      })

      // Show selected payment details
      if (selectedMethod) {
        const selectedDetails = document.getElementById(`${selectedMethod}-details`)
        if (selectedDetails) {
          selectedDetails.style.display = "block"
        }
      }
    })
  }

  // Order tracking form
  const trackingForm = document.getElementById("tracking-form")
  const orderResults = document.querySelector(".order-results")

  // Mock functions for spinner and toast
  function showSpinner() {
    let spinnerOverlay = document.querySelector(".spinner-overlay")

    if (!spinnerOverlay) {
      spinnerOverlay = document.createElement("div")
      spinnerOverlay.className = "spinner-overlay"
      spinnerOverlay.innerHTML = '<div class="spinner"></div>'
      document.body.appendChild(spinnerOverlay)
    }

    setTimeout(() => {
      spinnerOverlay.classList.add("show")
    }, 10)
  }

  function hideSpinner() {
    const spinnerOverlay = document.querySelector(".spinner-overlay")

    if (spinnerOverlay) {
      spinnerOverlay.classList.remove("show")

      setTimeout(() => {
        if (spinnerOverlay.parentNode) {
          spinnerOverlay.parentNode.removeChild(spinnerOverlay)
        }
      }, 300)
    }
  }

  function showToast(message, type = "info") {
    let toastContainer = document.querySelector(".toast-container")

    if (!toastContainer) {
      toastContainer = document.createElement("div")
      toastContainer.className = "toast-container"
      document.body.appendChild(toastContainer)
    }

    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    let icon = ""
    switch (type) {
      case "success":
        icon = '<i class="fas fa-check-circle toast-icon"></i>'
        break
      case "error":
        icon = '<i class="fas fa-exclamation-circle toast-icon"></i>'
        break
      default:
        icon = '<i class="fas fa-info-circle toast-icon"></i>'
    }

    toast.innerHTML = `
      ${icon}
      <div class="toast-content">${message}</div>
      <span class="toast-close">&times;</span>
    `

    toastContainer.appendChild(toast)

    // Show toast
    setTimeout(() => {
      toast.classList.add("show")
    }, 10)

    // Auto hide after 3 seconds
    const hideTimeout = setTimeout(() => {
      hideToast(toast)
    }, 3000)

    // Close button
    const closeBtn = toast.querySelector(".toast-close")
    closeBtn.addEventListener("click", () => {
      clearTimeout(hideTimeout)
      hideToast(toast)
    })
  }

  function hideToast(toast) {
    toast.classList.remove("show")

    // Remove from DOM after animation
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }

  if (trackingForm) {
    trackingForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const orderNumber = document.getElementById("order-number").value
      const email = document.getElementById("order-email").value

      // Show loading spinner
      showSpinner()

      // Simulate order tracking
      setTimeout(() => {
        hideSpinner()

        // Show order results
        if (orderResults) {
          orderResults.style.display = "block"

          // Scroll to results
          orderResults.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 1500)
    })
  }

  // Order history filter
  const statusFilter = document.getElementById("status-filter")
  const dateFilter = document.getElementById("date-filter")
  const orderItems = document.querySelectorAll(".order-item")

  if (statusFilter && dateFilter) {
    // Filter function
    function filterOrders() {
      const status = statusFilter.value
      const date = dateFilter.value

      orderItems.forEach((item) => {
        const itemStatus = item.getAttribute("data-status")
        const itemDate = item.getAttribute("data-date")

        let showItem = true

        if (status !== "all" && itemStatus !== status) {
          showItem = false
        }

        if (date !== "all" && itemDate !== date) {
          showItem = false
        }

        item.style.display = showItem ? "flex" : "none"
      })

      // Show empty message if no orders match filters
      const emptyMessage = document.querySelector(".empty-orders")
      let visibleOrders = 0

      orderItems.forEach((item) => {
        if (item.style.display !== "none") {
          visibleOrders++
        }
      })

      if (visibleOrders === 0) {
        if (!emptyMessage) {
          const message = document.createElement("div")
          message.className = "empty-orders"
          message.innerHTML = `
            <i class="fas fa-box-open"></i>
            <h3>No orders found</h3>
            <p>Try adjusting your filters.</p>
          `

          document.querySelector(".order-history").appendChild(message)
        }
      } else {
        if (emptyMessage) {
          emptyMessage.remove()
        }
      }
    }

    // Add event listeners
    statusFilter.addEventListener("change", filterOrders)
    dateFilter.addEventListener("change", filterOrders)
  }

  // Order details modal
  const viewOrderBtns = document.querySelectorAll(".view-order-btn")
  const orderModal = document.getElementById("order-modal")

  if (viewOrderBtns.length > 0 && orderModal) {
    viewOrderBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault()

        // Show modal
        orderModal.style.display = "block"
      })
    })

    // Close modal
    const closeModal = orderModal.querySelector(".close-modal")

    if (closeModal) {
      closeModal.addEventListener("click", () => {
        orderModal.style.display = "none"
      })
    }

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === orderModal) {
        orderModal.style.display = "none"
      }
    })
  }

  // Order progress steps
  const progressSteps = document.querySelectorAll(".progress-step")

  if (progressSteps.length > 0) {
    // Simulate order progress
    let currentStep = 0

    function updateProgress() {
      progressSteps.forEach((step, index) => {
        if (index < currentStep) {
          step.classList.add("completed")
          step.classList.remove("active")
        } else if (index === currentStep) {
          step.classList.add("active")
          step.classList.remove("completed")
        } else {
          step.classList.remove("active", "completed")
        }
      })
    }

    // Initialize progress
    updateProgress()

    // Simulate progress updates
    const nextStepBtn = document.querySelector(".next-step-btn")

    if (nextStepBtn) {
      nextStepBtn.addEventListener("click", () => {
        if (currentStep < progressSteps.length - 1) {
          currentStep++
          updateProgress()

          // Update button text for last step
          if (currentStep === progressSteps.length - 1) {
            nextStepBtn.textContent = "Finish"
          }
        } else {
          // Simulate order completion
          showToast("Order completed successfully!", "success")

          // Reset progress
          currentStep = 0
          updateProgress()
          nextStepBtn.textContent = "Next Step"
        }
      })
    }
  }

  // Form validation
  const orderForm = document.getElementById("order-form")

  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      
      const activeTab = document.querySelector(".tab-btn.active").getAttribute("data-tab")
      let isValid = true

      // Reset previous errors
      orderForm.querySelectorAll(".error-message").forEach(msg => {
        msg.textContent = ""
        msg.classList.remove("show")
      })
      orderForm.querySelectorAll(".error").forEach(field => field.classList.remove("error"))

      // Validate based on active tab
      if (activeTab === "delivery") {
        // Validate delivery fields
        const deliveryFields = [
          { id: "delivery-address", msg: "Delivery address is required" },
          { id: "city", msg: "City is required" },
          { id: "zip", msg: "ZIP code is required" },
          { id: "contact-name", msg: "Contact name is required" },
          { id: "contact-email", msg: "Email is required" },
          { id: "contact-phone", msg: "Phone number is required" },
          { id: "payment-method", msg: "Please select a payment method" }
        ]

        deliveryFields.forEach(field => {
          const element = document.getElementById(field.id)
          if (!element?.value?.trim()) {
            isValid = false
            showFieldError(element, field.msg)
          }
        })

        // Validate scheduled delivery if selected
        if (document.querySelector('input[name="delivery-time"]:checked')?.value === "scheduled") {
          const deliveryDate = document.getElementById("delivery-date")
          const deliveryTime = document.getElementById("delivery-time-slot")

          if (!deliveryDate?.value) {
            isValid = false
            showFieldError(deliveryDate, "Please select a delivery date")
          }
          if (!deliveryTime?.value) {
            isValid = false
            showFieldError(deliveryTime, "Please select a delivery time")
          }
        }
      }

      // Additional validation logic for delivery/pickup time
      if (activeTab === "delivery") {
        if (document.querySelector('input[name="delivery-time"]:checked')?.value === "scheduled") {
          const deliveryDate = document.getElementById("delivery-date")
          const deliveryTimeSlot = document.getElementById("delivery-time-slot")

          if (!deliveryDate.value) {
            isValid = false
            deliveryDate.classList.add("error")
            const errorMessage = deliveryDate.parentElement.parentElement.querySelector(".error-message")
            if (errorMessage) {
              errorMessage.textContent = "Please select a delivery date"
            }
          }

          if (!deliveryTimeSlot.value) {
            isValid = false
            deliveryTimeSlot.classList.add("error")
            const errorMessage = deliveryTimeSlot.parentElement.parentElement.querySelector(".error-message")
            if (errorMessage) {
              errorMessage.textContent = "Please select a delivery time"
            }
          }
        }
      } else {
        // Check pickup scheduled time if selected
        if (document.querySelector('input[name="pickup-time"]:checked')?.value === "scheduled") {
          const pickupDate = document.getElementById("pickup-date")
          const pickupTimeSlot = document.getElementById("pickup-time-slot")

          if (!pickupDate.value) {
            isValid = false
            pickupDate.classList.add("error")
            const errorMessage = pickupDate.parentElement.parentElement.querySelector(".error-message")
            if (errorMessage) {
              errorMessage.textContent = "Please select a pickup date"
            }
          }

          if (!pickupTimeSlot.value) {
            isValid = false
            pickupTimeSlot.classList.add("error")
            const errorMessage = pickupTimeSlot.parentElement.parentElement.querySelector(".error-message")
            if (errorMessage) {
              errorMessage.textContent = "Please select a pickup time"
            }
          }
        }
      }

      // Check payment method details
      const paymentMethod = paymentMethodSelect.value

      if (paymentMethod === "credit-card") {
        const cardNumber = document.getElementById("card-number")
        const cardExpiry = document.getElementById("card-expiry")
        const cardCvv = document.getElementById("card-cvv")

        if (cardNumber && !cardNumber.value.trim()) {
          isValid = false
          cardNumber.classList.add("error")
        }

        if (cardExpiry && !cardExpiry.value.trim()) {
          isValid = false
          cardExpiry.classList.add("error")
        }

        if (cardCvv && !cardCvv.value.trim()) {
          isValid = false
          cardCvv.classList.add("error")
        }
      } else if (paymentMethod === "gcash") {
        const gcashNumber = document.getElementById("gcash-number")

        if (gcashNumber && !gcashNumber.value.trim()) {
          isValid = false
          gcashNumber.classList.add("error")
        }
      }

      if (isValid) {
        // Show loading spinner
        showSpinner()

        try {
          // Simulate order processing
          await new Promise(resolve => setTimeout(resolve, 1500))

          // Hide spinner
          hideSpinner()

          const orderSuccessModal = document.getElementById("order-success-modal")
          if (orderSuccessModal) {
            // Update modal content
            updateOrderModal(activeTab)

            // Show modal
            orderSuccessModal.style.display = "block"
            requestAnimationFrame(() => {
              orderSuccessModal.classList.add("show")
              const modalContent = orderSuccessModal.querySelector(".modal-content")
              if (modalContent) {
                modalContent.style.opacity = "1"
                modalContent.style.transform = "translateY(0)"
              }
            })

            // Clear form and cart
            if (window.cart) {
              window.cart.clearCart()
            }
            orderForm.reset()
          }
        } catch (error) {
          hideSpinner()
          showToast("An error occurred. Please try again.", "error")
        }
      } else {
        // Scroll to first error
        const firstError = orderForm.querySelector(".error")
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    })
  }

  // Helper functions
  function showFieldError(element, message) {
    if (!element) return
    
    element.classList.add("error")
    const errorDiv = element.parentElement.querySelector(".error-message")
    if (errorDiv) {
      errorDiv.textContent = message
      errorDiv.classList.add("show")
    }
  }

  function updateOrderModal(activeTab) {
    const details = {
      orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      email: document.getElementById("contact-email")?.value || "",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      type: activeTab === "delivery" ? "Delivery" : "Pickup",
      total: document.getElementById("total")?.textContent || "₱0.00"
    }

    // Update modal elements
    Object.entries(details).forEach(([key, value]) => {
      const element = document.getElementById(`order-${key}`)
      if (element) {
        element.textContent = value
      }
    })
  }

  // Order success modal
  const orderSuccessModal = document.getElementById("order-success-modal")
  const closeModalBtn = orderSuccessModal?.querySelector(".close-modal")

  if (closeModalBtn && orderSuccessModal) {
    const hideModal = () => {
      orderSuccessModal.classList.remove("show")
      const modalContent = orderSuccessModal.querySelector(".modal-content")
      if (modalContent) {
        modalContent.style.opacity = "0"
        modalContent.style.transform = "translateY(50px)"
      }
      setTimeout(() => {
        orderSuccessModal.style.display = "none"
      }, 300)
    }

    closeModalBtn.addEventListener("click", hideModal)

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === orderSuccessModal) {
        hideModal()
      }
    })
  }

  // Load cart items into order summary
  const cartItems = document.getElementById("cart-items")
  const subtotalElement = document.getElementById("subtotal")
  const deliveryFeeElement = document.getElementById("delivery-fee")
  const discountRow = document.querySelector(".discount-row")
  const discountElement = document.getElementById("discount")
  const totalElement = document.getElementById("total")

  if (cartItems && window.cart) {
    // Check if cart is empty
    if (window.cart.items.length === 0) {
      const emptyCartMessage = document.querySelector(".empty-cart-message")
      if (emptyCartMessage) {
        emptyCartMessage.style.display = "block"
      }

      // Disable submit button
      const submitOrderBtn = document.querySelector(".submit-order-btn")
      if (submitOrderBtn) {
        submitOrderBtn.disabled = true
      }
    } else {
      // Hide empty cart message
      const emptyCartMessage = document.querySelector(".empty-cart-message")
      if (emptyCartMessage) {
        emptyCartMessage.style.display = "none"
      }

      // Render cart items
      const mergedItems = []
      window.cart.items.forEach((item) => {
        const existingItem = mergedItems.find(i => i.id === item.id)
        if (existingItem) {
          existingItem.quantity += item.quantity
        } else {
          mergedItems.push({...item})
        }
      })

      // Clear cart items container first
      cartItems.innerHTML = ''

      // Render merged items
      mergedItems.forEach((item) => {
        const cartItem = document.createElement("div")
        cartItem.innerHTML = `
          <div class="item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-price">₱${item.price.toFixed(2)} x ${item.quantity}</div>
          </div>
          <div class="order-item-total">₱${(item.price * item.quantity).toFixed(2)}</div>
        `
        cartItems.appendChild(cartItem)
      })

      // Calculate totals
      const subtotal = window.cart.getTotal()
      const deliveryFee = subtotal > 1000 ? 0 : 150 // Free delivery for orders over ₱1000
      const total = subtotal + deliveryFee

      // Update summary
      if (subtotalElement) {
        subtotalElement.textContent = `₱${subtotal.toFixed(2)}`
      }

      if (deliveryFeeElement) {
        deliveryFeeElement.textContent = deliveryFee === 0 ? "FREE" : `₱${deliveryFee.toFixed(2)}`
      }

      if (totalElement) {
        totalElement.textContent = `₱${total.toFixed(2)}`
      }
    }
  }

  // Promo code functionality
  const promoCodeInput = document.getElementById("promo-code")
  const applyPromoBtn = document.getElementById("apply-promo")

  if (promoCodeInput && applyPromoBtn) {
    applyPromoBtn.addEventListener("click", () => {
      const promoCode = promoCodeInput.value.trim().toUpperCase()

      if (!promoCode) {
        showToast("Please enter a promo code", "error")
        return
      }

      // Check if promo code is valid
      if (promoCode === "WELCOME10") {
        // Apply 10% discount
        const subtotal = Number.parseFloat(subtotalElement.textContent.replace(/[^\d.]/g, ""))
        const discount = subtotal * 0.1

        if (discountRow && discountElement) {
          discountRow.style.display = "flex"
          discountElement.textContent = `-₱${discount.toFixed(2)}`
        }

        // Update total
        const deliveryFee =
          deliveryFeeElement.textContent === "FREE"
            ? 0
            : Number.parseFloat(deliveryFeeElement.textContent.replace(/[^\d.]/g, ""))
        const total = subtotal - discount + deliveryFee

        if (totalElement) {
          totalElement.textContent = `₱${total.toFixed(2)}`
        }

        showToast("Promo code applied: 10% discount", "success")
        promoCodeInput.disabled = true
        applyPromoBtn.disabled = true
      } else {
        showToast("Invalid promo code", "error")
      }
    })
  }

  // Update cart button
  const updateCartBtn = document.getElementById("update-cart-btn")

  if (updateCartBtn) {
    updateCartBtn.addEventListener("click", () => {
      window.location.href = "cart.html"
    })
  }
})
