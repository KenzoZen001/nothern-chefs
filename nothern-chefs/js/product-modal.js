document.addEventListener('DOMContentLoaded', () => {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'product-modal-overlay';
  document.body.appendChild(modalContainer);

  // Show modal function
  function showProductModal(productData) {
    modalContainer.style.display = 'flex';
    const modalHTML = `
      <div class="product-modal">
        <button class="modal-close">&times;</button>
        <div class="modal-content">
          <div class="product-info">
            <div class="modal-image-section">
              <img src="${productData.image}" alt="${productData.name}" class="modal-image">
              ${productData.badge ? `<span class="modal-badge ${productData.badge.toLowerCase()}">${productData.badge}</span>` : ''}
            </div>
            <div class="modal-details">
              <div class="modal-header">
                <h2 class="modal-title">${productData.name}</h2>
                <div class="modal-rating">
                  <div class="modal-stars">
                    ${'★'.repeat(productData.rating)}${'☆'.repeat(5 - productData.rating)}
                  </div>
                  <span class="modal-rating-count">(${productData.reviewCount} reviews)</span>
                </div>
                <div class="modal-price">₱${productData.price.toFixed(2)}</div>
              </div>
              
              <p class="modal-description">${productData.description}</p>
              
              <div class="modal-actions">
                <div class="modal-quantity">
                  <button class="quantity-btn minus">-</button>
                  <input type="number" class="quantity-input" value="1" min="1" max="99">
                  <button class="quantity-btn plus">+</button>
                </div>
                <button class="modal-add-to-cart" data-id="${productData.id}">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          <div class="modal-reviews-section">
            <div class="modal-reviews-header">
              <h3 class="modal-reviews-title">Product Reviews</h3>
            </div>
            
            <div class="modal-review-form">
              <h4>Write a Review</h4>
              <form id="modal-review-form">
                <div class="modal-form-group">
                  <label for="modal-review-name">Name</label>
                  <input type="text" id="modal-review-name" required placeholder="Your name">
                </div>
                
                <div class="modal-form-group">
                  <label>Rating</label>
                  <div class="modal-rating-input" id="modal-rating-input">
                    <button type="button" data-rating="1">★</button>
                    <button type="button" data-rating="2">★</button>
                    <button type="button" data-rating="3">★</button>
                    <button type="button" data-rating="4">★</button>
                    <button type="button" data-rating="5">★</button>
                  </div>
                </div>
                
                <div class="modal-form-group">
                  <label for="modal-review-content">Review</label>
                  <textarea id="modal-review-content" required placeholder="Share your thoughts about this product..."></textarea>
                </div>
                
                <button type="submit" class="submit-modal-review">Submit Review</button>
              </form>
            </div>
            
            <div class="modal-reviews-grid" id="modal-reviews-container">
              <!-- Reviews will be dynamically loaded here -->
            </div>
          </div>
        </div>
      </div>
    `;

    modalContainer.innerHTML = modalHTML;
    
    // Show modal with animation
    requestAnimationFrame(() => {
      modalContainer.classList.add('active');
      const modal = modalContainer.querySelector('.product-modal');
      requestAnimationFrame(() => {
        modal.classList.add('active');
      });
    });

    // Setup event listeners
    setupModalEventListeners(productData);
    loadProductReviews(productData.id);
    
    // Setup review functionality
    setupReviewSystem(productData.id);
  }

  // Setup modal event listeners
  function setupModalEventListeners(productData) {
    const modal = modalContainer.querySelector('.product-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const quantityInput = modal.querySelector('.quantity-input');
    const minusBtn = modal.querySelector('.quantity-btn.minus');
    const plusBtn = modal.querySelector('.quantity-btn.plus');
    const addToCartBtn = modal.querySelector('.modal-add-to-cart');

    // Close modal
    closeBtn.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) closeModal();
    });

    // Quantity controls
    minusBtn.addEventListener('click', () => {
      let value = parseInt(quantityInput.value);
      if (value > 1) quantityInput.value = value - 1;
    });

    plusBtn.addEventListener('click', () => {
      let value = parseInt(quantityInput.value);
      if (value < 99) quantityInput.value = value + 1;
    });

    // Add to cart
    addToCartBtn.addEventListener('click', () => {
      const quantity = parseInt(quantityInput.value);
      window.cart.addItem({
        id: productData.id,
        name: productData.name,
        price: productData.price,
        image: productData.image,
        quantity: quantity
      });
      closeModal();
    });
  }

  // Close modal function
  function closeModal() {
    const modal = modalContainer.querySelector('.product-modal');
    modal.classList.remove('active');
    modalContainer.classList.remove('active');
    modal.addEventListener('transitionend', () => {
      modalContainer.style.display = 'none';
      modalContainer.innerHTML = '';
    }, { once: true });
  }

  // Add click listeners to all product items
  document.querySelectorAll('.product-item, .product-card').forEach(product => {
    product.addEventListener('click', (e) => {
      if (!e.target.closest('.add-to-cart-btn') && !e.target.closest('.buy-button')) {
        const productData = {
          id: product.dataset.productId,
          name: product.querySelector('.product-name, .product-title').textContent,
          price: parseFloat(product.querySelector('.price').textContent.replace('₱', '')),
          image: product.querySelector('img').src,
          rating: parseInt(product.querySelector('.stars')?.getAttribute('data-rating') || 5),
          reviewCount: parseInt(product.querySelector('.rating-count')?.textContent?.match(/\d+/) || 0),
          description: product.querySelector('.product-description')?.textContent || 
                      'A delicious homemade product made with the finest ingredients.',
          badge: product.querySelector('.product-badge')?.textContent || null
        };
        showProductModal(productData);
      }
    });
  });

  function setupReviewSystem(productId) {
    const form = document.getElementById('modal-review-form');
    const ratingInput = document.getElementById('modal-rating-input');
    const reviewsContainer = document.getElementById('modal-reviews-container');
    let selectedRating = 5;
  
    // Initialize rating buttons as active
    ratingInput.querySelectorAll('button').forEach((btn, index) => {
      btn.classList.toggle('active', index < selectedRating);
    });
  
    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const review = {
        id: Date.now(),
        productId: productId,
        name: document.getElementById('modal-review-name').value,
        rating: selectedRating,
        content: document.getElementById('modal-review-content').value,
        date: new Date().toISOString()
      };
  
      // Save review
      saveProductReview(review);
      
      // Add new review to the top of the list
      const newReviewElement = createReviewElement(review);
      if (reviewsContainer.firstChild) {
        reviewsContainer.insertBefore(newReviewElement, reviewsContainer.firstChild);
      } else {
        reviewsContainer.appendChild(newReviewElement);
      }
  
      // Reset form
      form.reset();
      
      // Reset rating stars
      selectedRating = 5;
      ratingInput.querySelectorAll('button').forEach((btn, index) => {
        btn.classList.toggle('active', index < selectedRating);
      });
  
      // Show success notification
      if (window.cart && window.cart.showNotification) {
        window.cart.showNotification('Review submitted successfully');
      }
    });
  }
  
  function createReviewElement(review) {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'modal-review-card';
    reviewElement.innerHTML = `
      <div class="modal-review-header">
        <span class="modal-reviewer">${review.name}</span>
        <span class="modal-review-date">${formatDate(review.date)}</span>
      </div>
      <div class="modal-review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
      <p class="modal-review-content">${review.content}</p>
    `;
    
    // Add entrance animation
    reviewElement.style.opacity = '0';
    reviewElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      reviewElement.style.transition = 'all 0.3s ease';
      reviewElement.style.opacity = '1';
      reviewElement.style.transform = 'translateY(0)';
    }, 10);
    
    return reviewElement;
  }
  
  function saveProductReview(review) {
    let reviews = JSON.parse(localStorage.getItem(`product_reviews_${review.productId}`) || '[]');
    reviews.unshift(review);
    localStorage.setItem(`product_reviews_${review.productId}`, JSON.stringify(reviews));
  }
  
  function loadProductReviews(productId) {
    const container = document.getElementById('modal-reviews-container');
    const reviews = JSON.parse(localStorage.getItem(`product_reviews_${productId}`) || '[]');
    
    container.innerHTML = reviews.length ? reviews.map(review => `
      <div class="modal-review-card">
        <div class="modal-review-header">
          <span class="modal-reviewer">${review.name}</span>
          <span class="modal-review-date">${formatDate(review.date)}</span>
        </div>
        <div class="modal-review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
        <p class="modal-review-content">${review.content}</p>
      </div>
    `).join('') : '<p class="no-reviews">No reviews yet. Be the first to review this product!</p>';
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
});
