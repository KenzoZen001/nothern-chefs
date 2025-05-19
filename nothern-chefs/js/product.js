// js/products.js
document.addEventListener("DOMContentLoaded", async () => {
  const productsContainer = document.getElementById("products-container");
  const filterButtons = document.querySelectorAll(".filter-button");
  
  // Load products from Supabase
  async function loadProducts(category = "all") {
    try {
      // Show loading spinner
      productsContainer.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      `;
      
      // Query products from Supabase
      let query = supabase.from('products').select('*');
      
      // Apply category filter if not "all"
      if (category !== "all") {
        query = query.eq('category', category);
      }
      
      // Execute query
      const { data: products, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Clear container
      productsContainer.innerHTML = "";
      
      if (products.length === 0) {
        productsContainer.innerHTML = `
          <div class="no-products">
            <p>No products found in this category.</p>
          </div>
        `;
        return;
      }
      
      // Render products
      products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.setAttribute("data-product-id", product.id);
        
        productCard.innerHTML = `
          <div class="product-image">
            <img src="${product.image_url || 'public/images/placeholder.png'}" alt="${product.name}">
          </div>
          <div class="product-details">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">₱${product.price.toFixed(2)}</p>
            <div class="product-actions">
              <button class="buy-button" data-product-id="${product.id}">
                <i class="fas fa-shopping-cart"></i> Add to Cart
              </button>
              <button class="wishlist-button" data-product-id="${product.id}">
                <i class="far fa-heart"></i>
              </button>
            </div>
          </div>
        `;
        
        productsContainer.appendChild(productCard);
      });
      
    } catch (error) {
      console.error("Error loading products:", error);
      productsContainer.innerHTML = `
        <div class="error-message">
          <p>Error loading products. Please try again later.</p>
        </div>
      `;
    }
  }
  
  // Load all products initially
  loadProducts();
  
  // Filter button click handlers
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove("active"));
      
      // Add active class to clicked button
      button.classList.add("active");
      
      // Get category and load products
      const category = button.getAttribute("data-category");
      loadProducts(category);
    });
  });
  
  // Wishlist button click handler
  productsContainer.addEventListener("click", async (e) => {
    const wishlistButton = e.target.closest(".wishlist-button");
    
    if (wishlistButton) {
      e.preventDefault();
      
      try {
        const productId = wishlistButton.getAttribute("data-product-id");
        const user = await window.supabaseAuth.checkUser();
        
        if (!user) {
          // Redirect to login if not logged in
          window.location.href = "login.html";
          return;
        }
        
        // Check if product is already in wishlist
        const { data: existingItem } = await supabase
          .from('wishlist_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .single();
          
        if (existingItem) {
          // Remove from wishlist
          await supabase
            .from('wishlist_items')
            .delete()
            .eq('id', existingItem.id);
            
          // Update icon
          const icon = wishlistButton.querySelector("i");
          icon.classList.remove("fas");
          icon.classList.add("far");
          
          // Show notification
          showNotification("Removed from wishlist");
        } else {
          // Add to wishlist
          await supabase
            .from('wishlist_items')
            .insert({ user_id: user.id, product_id: productId });
            
          // Update icon
          const icon = wishlistButton.querySelector("i");
          icon.classList.remove("far");
          icon.classList.add("fas");
          
          // Show notification
          showNotification("Added to wishlist");
        }
      } catch (error) {
        console.error("Error updating wishlist:", error);
        showNotification("Error updating wishlist", "error");
      }
    }
  });
  
  // Show notification function
  function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add("show");
      
      // Hide after 3 seconds
      setTimeout(() => {
        notification.classList.remove("show");
        
        // Remove from DOM after animation
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }, 10);
  }
});