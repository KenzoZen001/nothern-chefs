document.addEventListener("DOMContentLoaded", async () => {
  // Check if Supabase is available
  if (!window.supabaseCart) {
    console.error("Supabase cart functions not available");
    return;
  }
  // Cart functionality
  class ShoppingCart {
    constructor() {
      this.items = [];
      this.cartCount = document.querySelector(".cart-count");
      this.init();
    }

    async init()
     {
      this.updateCartCount()
      this.setupEventListeners()
      if (!document.getElementById("cart-animations")) {
      await this.loadCartItems();
      const style = document.createElement("style")
      this.updateCartCount();
      this.setupEventListeners();
      style.id = "cart-animations"
      style.textContent = `
          .cart-floater {
            position: fixed;
            z-index: 9999;
            font-size: 24px;
            color: #e3d03a;
            pointer-events: none;
            transition: all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
          }
          
          .cart-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #e3d03a;
            color: #1a1a1a;
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .pulse {
            animation: pulse 0.5s ease-in-out;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }
          
          .product-card.added-to-cart,
          .product-item.added-to-cart {
            animation: highlight 1s ease;
          }
          
          @keyframes highlight {
            0% { box-shadow: 0 0 0 0 rgba(227, 208, 58, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(227, 208, 58, 0); }
            100% { box-shadow: 0 0 0 0 rgba(227, 208, 58, 0); }
          }
        `
        document.head.appendChild(style)
    }
  }


  async loadCartItems() {
    try {
      this.items = await window.supabaseCart.getCartItems();
    } catch (error) {
      console.error("Error loading cart items:", error);
      this.items = [];
    }
  }

    setupEventListeners() {
      // Add to cart buttons
      const buyButtons = document.querySelectorAll(".buy-button, .add-to-cart-btn, .quick-add-btn");

      buyButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
          e.preventDefault();

          // Get product info
          let productId, productName, productPrice, productImage;

          if (button.hasAttribute("data-product-id")) {
            // Handle data attribute format
            productId = button.getAttribute("data-product-id")

            // Find the product container
            const productElement = button.closest(".product-card, .product-item")

            if (productElement) {
              productName = productElement.querySelector(".product-title, .product-name, h3").textContent
              const priceElement = productElement.querySelector(".product-price, .price")
              productPrice = Number.parseFloat(priceElement.textContent.replace(/[^\d.]/g, ""))
              const imgElement = productElement.querySelector("img")
              productImage = imgElement ? imgElement.src : "images/placeholder.png"
            }
          } else if (button.hasAttribute("onclick")) {
            // Handle onclick attribute format
            const onclickAttr = button.getAttribute("onclick")
            const match = onclickAttr.match(/cart\.addItem$$\{(.*?)\}$$/)

            if (match) {
              const itemProps = match[1].split(",").map((prop) => prop.trim())
              const itemObj = {}

              itemProps.forEach((prop) => {
                const [key, value] = prop.split(":")
                itemObj[key.trim()] = value.trim().replace(/['"]/g, "")
              })

              productId = itemObj.id
              productName = itemObj.name
              productPrice = Number.parseFloat(itemObj.price)

              // Try to find image
              const productElement = button.closest(".product-card, .product-item")
              if (productElement) {
                const imgElement = productElement.querySelector("img")
                if (imgElement) {
                  productImage = imgElement.src
                }
              }
            }
          } else {
            // Handle standard format
            const productElement = button.closest(".product-card, .product-item")

            if (productElement) {
              productId = productElement.getAttribute("data-product-id") || Date.now().toString()
              const nameElement = productElement.querySelector(".product-title, .product-name, h3")
              const priceElement = productElement.querySelector(".product-price, .price")
              const imgElement = productElement.querySelector("img")

              if (nameElement) productName = nameElement.textContent
              if (priceElement) productPrice = Number.parseFloat(priceElement.textContent.replace(/[^\d.]/g, ""))
              if (imgElement) productImage = imgElement.src
            }
          }    

          


          // Get quantity if available
          let quantity = 1
          const quantityInput = document.querySelector(".product-quantity input, #quantity")
          if (quantityInput) {
            quantity = Number.parseInt(quantityInput.value) || 1
          }
          

          if (productId) {
            try {
              // Add to cart using Supabase
              await window.supabaseCart.addToCart(productId, quantity);
              
              // Reload cart items
              await this.loadCartItems();
              
              // Update cart count
              this.updateCartCount();
              
              // Show add to cart animation
              this.showAddToCartAnimation(button);

              // Highlight the product
              const productElement = button.closest(".product-card, .product-item");
              if (productElement) {
                productElement.classList.add("added-to-cart");
                setTimeout(() => {
                  productElement.classList.remove("added-to-cart");
                }, 1000);
              }
              
              // Show notification
              this.showNotification(`${productName} added to cart`);
            } catch (error) {
              this.showNotification("Error adding to cart: " + error.message, "error");
            }
          }
        });
      });

      // Setup cart page functionality if on cart page
      if (window.location.href.includes("cart.html") || document.querySelector(".cart-items-container")) {
        this.setupCartPage();
      }
    }

    setupCartPage() {
      const cartItemsContainer = document.getElementById("cart-items-container")
      const emptyCartMessage = document.getElementById("empty-cart-message")
      const subtotalElement = document.getElementById("subtotal")
      const discountRowElement = document.getElementById("discount-row")
      const discountAmountElement = document.getElementById("discount-amount")
      const totalElement = document.getElementById("total")
      const cartCountDisplay = document.getElementById("cart-count-display")
      const checkoutBtn = document.getElementById("checkout-btn")
      const clearCartBtn = document.getElementById("clear-cart")
      const couponCodeInput = document.getElementById("coupon-code")
      const applyCouponBtn = document.getElementById("apply-coupon")
      const couponMessage = document.getElementById("coupon-message")

      if (!cartItemsContainer) return

      let discount = 0

      // Render cart items
      this.renderCartItems(cartItemsContainer, emptyCartMessage, cartCountDisplay, checkoutBtn, clearCartBtn)

      // Update summary
      this.updateCartSummary(subtotalElement, discountRowElement, discountAmountElement, totalElement, discount)

      // Apply coupon
      if (applyCouponBtn && couponCodeInput) {
        applyCouponBtn.addEventListener("click", () => {
          const couponCode = couponCodeInput.value.trim()

          if (!couponCode) {
            this.showCouponMessage(couponMessage, "Please enter a coupon code", "error")
            return
          }

          // Check if coupon is valid (for demo, we'll accept "DISCOUNT10")
          if (couponCode.toUpperCase() === "DISCOUNT10") {
            discount = this.getTotal() * 0.1 // 10% discount
            this.showCouponMessage(couponMessage, "10% discount applied!", "success")
            this.updateCartSummary(subtotalElement, discountRowElement, discountAmountElement, totalElement, discount)
          } else {
            this.showCouponMessage(couponMessage, "Invalid coupon code", "error")
            discount = 0
            this.updateCartSummary(subtotalElement, discountRowElement, discountAmountElement, totalElement, discount)
          }
        })
      }

      // Clear cart
      if (clearCartBtn) {
        clearCartBtn.addEventListener("click", () => {
          if (confirm("Are you sure you want to clear your cart?")) {
            this.clearCart()
            discount = 0
            if (couponCodeInput) couponCodeInput.value = ""
            if (couponMessage) couponMessage.textContent = ""
            this.renderCartItems(cartItemsContainer, emptyCartMessage, cartCountDisplay, checkoutBtn, clearCartBtn)
            this.updateCartSummary(subtotalElement, discountRowElement, discountAmountElement, totalElement, discount)
          }
        })
      }

      // Checkout button
      if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
          if (this.items.length === 0) {
            this.showNotification("Your cart is empty", "error")
            return
          }

          // Redirect to checkout/order page
          window.location.href = "order.html"
        })
      }
    }

    renderCartItems(cartItemsContainer, emptyCartMessage, cartCountDisplay, checkoutBtn, clearCartBtn) {
      if (!cartItemsContainer) return

      if (this.items.length === 0) {
        if (emptyCartMessage) emptyCartMessage.style.display = "block"
        if (cartCountDisplay) cartCountDisplay.textContent = "0"
        if (checkoutBtn) checkoutBtn.disabled = true
        if (clearCartBtn) clearCartBtn.style.display = "none"

        // Clear container except for empty message
        while (cartItemsContainer.firstChild && cartItemsContainer.firstChild !== emptyCartMessage) {
          cartItemsContainer.removeChild(cartItemsContainer.firstChild)
        }

        return
      }

      if (emptyCartMessage) emptyCartMessage.style.display = "none"
      if (cartCountDisplay) cartCountDisplay.textContent = this.items.reduce((total, item) => total + item.quantity, 0)
      if (checkoutBtn) checkoutBtn.disabled = false
      if (clearCartBtn) clearCartBtn.style.display = "block"

      // Clear previous items
      while (cartItemsContainer.firstChild && cartItemsContainer.firstChild !== emptyCartMessage) {
        cartItemsContainer.removeChild(cartItemsContainer.firstChild)
      }

      // Add cart items
      this.items.forEach((item) => {
        const cartItem = document.createElement("div")
        cartItem.className = "cart-item"
        cartItem.setAttribute("data-product-id", item.id)

        cartItem.innerHTML = `
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₱${item.price.toFixed(2)} each</div>
            <div class="cart-item-actions">
              <div class="quantity-controls">
                <button class="quantity-btn decrease" data-id="${item.id}" ${item.quantity <= 1 ? "disabled" : ""}>-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
              </div>
              <button class="remove-item-btn" data-id="${item.id}">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          <div class="cart-item-total">₱${(item.price * item.quantity).toFixed(2)}</div>
        `

        cartItemsContainer.appendChild(cartItem)
      })

      // Add event listeners to quantity buttons
      const decreaseButtons = cartItemsContainer.querySelectorAll(".quantity-btn.decrease")
      const increaseButtons = cartItemsContainer.querySelectorAll(".quantity-btn.increase")
      const removeButtons = cartItemsContainer.querySelectorAll(".remove-item-btn")

      decreaseButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.dataset.id
          this.updateQuantity(id, -1)
          this.setupCartPage() // Re-render cart
        })
      })

      increaseButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.dataset.id
          this.updateQuantity(id, 1)
          this.setupCartPage() // Re-render cart
        })
      })

      removeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const id = button.dataset.id
          this.removeItem(id)
          this.setupCartPage() // Re-render cart
        })
      })
    }

    updateCartSummary(subtotalElement, discountRowElement, discountAmountElement, totalElement, discount) {
      const subtotal = this.getTotal()

      if (subtotalElement) {
        subtotalElement.textContent = `₱${subtotal.toFixed(2)}`
      }

      if (discountRowElement && discountAmountElement && totalElement) {
        if (discount > 0) {
          discountRowElement.style.display = "flex"
          discountAmountElement.textContent = `-₱${discount.toFixed(2)}`
          totalElement.textContent = `₱${(subtotal - discount).toFixed(2)}`
        } else {
          discountRowElement.style.display = "none"
          totalElement.textContent = `₱${subtotal.toFixed(2)}`
        }
      }
    }

    showCouponMessage(couponMessage, message, type) {
      if (!couponMessage) return

      couponMessage.textContent = message
      couponMessage.className = `coupon-message ${type}`
    }

    addItem(item) {
      // Check if item already exists in cart
      const existingItemIndex = this.items.findIndex((cartItem) => cartItem.id === item.id)

      if (existingItemIndex !== -1) {
        // Increment quantity if item already exists
        this.items[existingItemIndex].quantity += item.quantity
      } else {
        // Add new item
        this.items.push(item)
      }

      // Save to localStorage
      localStorage.setItem("cartItems", JSON.stringify(this.items))

      // Update cart count
      this.updateCartCount()

      // Show notification
      this.showNotification(`${item.name} added to cart`)
    }

    removeItem(itemId) {
      this.items = this.items.filter((item) => item.id !== itemId)
      localStorage.setItem("cartItems", JSON.stringify(this.items))
      this.updateCartCount()
      this.showNotification("Item removed from cart")
    }

    updateQuantity(itemId, change) {
      const itemIndex = this.items.findIndex((item) => item.id === itemId)

      if (itemIndex !== -1) {
        this.items[itemIndex].quantity += change

        // Remove item if quantity is 0 or less
        if (this.items[itemIndex].quantity <= 0) {
          this.items.splice(itemIndex, 1)
        }

        localStorage.setItem("cartItems", JSON.stringify(this.items))
        this.updateCartCount()
      }
    }

    clearCart() {
      this.items = []
      localStorage.removeItem("cartItems")
      this.updateCartCount()
      this.showNotification("Cart cleared")
    }

    getTotal() {
      return this.items.reduce((total, item) => total + item.price * item.quantity, 0)
    }

    updateCartCount() {
      if (this.cartCount) {
        const totalItems = this.items.reduce((total, item) => total + item.quantity, 0)
        this.cartCount.textContent = totalItems

        // Add animation class
        this.cartCount.classList.add("pulse")
        setTimeout(() => {
          this.cartCount.classList.remove("pulse")
        }, 300)
      }
    }

    showAddToCartAnimation(button) {
      // Create floating element
      const floater = document.createElement("div")
      floater.className = "cart-floater"
      floater.innerHTML = '<i class="fas fa-shopping-cart"></i>'

      // Position at the button
      const rect = button.getBoundingClientRect()
      floater.style.left = `${rect.left + rect.width / 2}px`
      floater.style.top = `${rect.top + rect.height / 2}px`

      document.body.appendChild(floater)

      // Get cart icon position
      const cartIcon = document.querySelector(".cart-icon")
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect()

        // Animate to cart
        setTimeout(() => {
          floater.style.left = `${cartRect.left + cartRect.width / 2}px`
          floater.style.top = `${cartRect.top + cartRect.height / 2}px`
          floater.style.opacity = "0"
          floater.style.transform = "scale(0.5)"

          // Animate cart icon
          cartIcon.style.transform = "scale(1.5)"
          setTimeout(() => {
            cartIcon.style.transform = "scale(1)"
            document.body.removeChild(floater)
          }, 800)
        }, 10)
      } else {
        // If cart icon not found, just fade out
        setTimeout(() => {
          floater.style.opacity = "0"
          setTimeout(() => {
            document.body.removeChild(floater)
          }, 800)
        }, 500)
      }
    }

    showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span class="cart-notification-message">${message}</span>
      `;

      document.body.appendChild(notification);

      // Show notification
      setTimeout(() => {
        notification.classList.add('show');
        
        // Hide and remove notification after 3 seconds
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 500);
        }, 3000);
      }, 100);
    }
  }


  // Initialize cart
  window.cart = new ShoppingCart();
});
