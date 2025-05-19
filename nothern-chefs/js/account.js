document.addEventListener("DOMContentLoaded", async () => {
  // Tab switching functionality
  const user = await window.supabaseAuth.checkUser();
  const menuItems = document.querySelectorAll('.dashboard-menu li:not(.logout)');
  const dashboardTabs = document.querySelectorAll('.dashboard-tab');
  const actionCards = document.querySelectorAll('.action-card');
  const viewAllLink = document.querySelector('.view-all');
  
  if (!user) {
    // Redirect to login if not logged in
    window.location.href = "login.html";
    return;
  }

  try {
    const profile = await window.supabaseAuth.getUserProfile();
    
    // Update user info in the UI
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    
    if (userName) {
      userName.textContent = `${profile.firstName} ${profile.lastName}`;
    }
    
    if (userEmail) {
      userEmail.textContent = profile.email;
    }

    // Load user's orders
    loadOrders();
    
    // Load user's addresses
    loadAddresses();
    
    // Load user's wishlist
    loadWishlist();
    
    // Load user's reviews
    loadReviews();
    
  } catch (error) {
    showNotification("Error loading profile: " + error.message, "error");
  }

  // Function to switch tabs
  function switchTab(tabId) {
    // Remove active class from all menu items
    menuItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to selected menu item
    const selectedMenuItem = document.querySelector(`.dashboard-menu li[data-tab="${tabId}"]`);
    if (selectedMenuItem) {
      selectedMenuItem.classList.add('active');
    }
    
    // Hide all tabs
    dashboardTabs.forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabId}-tab`);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
  }
  
  // Menu item click event
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // Action card click event
  actionCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = card.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // View all link click event
  if (viewAllLink) {
    viewAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = viewAllLink.getAttribute('data-tab');
      switchTab(tabId);
    });
  }
  
  // Logout functionality
  const logoutButton = document.querySelector('.logout');
  
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await window.supabaseAuth.signOut();
        window.location.href = "login.html";
      } catch (error) {
        showNotification("Error signing out: " + error.message, "error");
      }
    });
  }

  async function loadOrders() {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      // Update orders in the UI
      updateOrdersUI(orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  }

  // Load user's orders from Supabase
  async function loadOrders() {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      // Update orders in the UI
      updateOrdersUI(orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  }
  
  // Update orders in the UI
  function updateOrdersUI(orders) {
    const orderTableBody = document.querySelector('.order-table tbody');
    const recentOrdersBody = document.querySelector('.recent-orders .order-table tbody');
    
    if (!orderTableBody) return;
    
    // Clear existing orders
    orderTableBody.innerHTML = '';
    
    if (orders.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="5" class="empty-message">No orders found</td>';
      orderTableBody.appendChild(emptyRow);
      return;
    }
    
    // Add orders to the table
    orders.forEach(order => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${order.order_number}</td>
        <td>${new Date(order.created_at).toLocaleDateString()}</td>
        <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
        <td>₱${order.total.toFixed(2)}</td>
        <td><a href="#" class="view-order-btn" data-id="${order.id}">View</a></td>
      `;
      orderTableBody.appendChild(row);
      
      // Add to recent orders if available
      if (recentOrdersBody && recentOrdersBody !== orderTableBody) {
        const recentRow = row.cloneNode(true);
        if (recentOrdersBody.children.length < 3) { // Only show 3 recent orders
          recentOrdersBody.appendChild(recentRow);
        }
      }
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-order-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const orderId = button.getAttribute('data-id');
        viewOrderDetails(orderId);
      });
    });
  }
  
  // Order table functionality
  const viewOrderButtons = document.querySelectorAll('.view-order-btn');
  const orderDetailsModal = document.getElementById('order-details-modal');
  const closeOrderModal = orderDetailsModal.querySelector('.close-modal');
  
  // View order button click event
  viewOrderButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      orderDetailsModal.style.display = 'block';
    });
  });
  
  // Close order modal
  closeOrderModal.addEventListener('click', () => {
    orderDetailsModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === orderDetailsModal) {
      orderDetailsModal.style.display = 'none';
    }
  });
  
  // Order actions
  const reorderButton = document.querySelector('.reorder-btn');
  const trackOrderButton = document.querySelector('.track-order-btn');
  const downloadInvoiceButton = document.querySelector('.download-invoice-btn');
  
  if (reorderButton) {
    reorderButton.addEventListener('click', () => {
      // In a real application, this would add the items to the cart
      showNotification('Items added to cart successfully!', 'success');
      orderDetailsModal.style.display = 'none';
    });
  }
  
  if (trackOrderButton) {
    trackOrderButton.addEventListener('click', () => {
      // In a real application, this would show tracking information
      showNotification('Tracking information is not available for this demo.', 'info');
    });
  }
  
  if (downloadInvoiceButton) {
    downloadInvoiceButton.addEventListener('click', () => {
      // In a real application, this would download the invoice
      showNotification('Invoice download is not available for this demo.', 'info');
    });
  }
  
  // Address functionality
  const addAddressButton = document.getElementById('add-address-btn');
  const addressModal = document.getElementById('address-modal');
  const closeAddressModal = addressModal.querySelector('.close-modal');
  const cancelButton = addressModal.querySelector('.cancel-btn');
  const addressForm = document.getElementById('address-form');
  const editAddressButtons = document.querySelectorAll('.edit-address-btn');
  const deleteAddressButtons = document.querySelectorAll('.delete-address-btn');
  const setDefaultButtons = document.querySelectorAll('.set-default-btn');
  
  // Add address button click event
  if (addAddressButton) {
    addAddressButton.addEventListener('click', () => {
      // Reset form
      addressForm.reset();
      
      // Set modal title
      document.getElementById('address-modal-title').textContent = 'Add New Address';
      
      // Show modal
      addressModal.style.display = 'block';
    });
  }
  
  // Edit address button click event
  editAddressButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Set modal title
      document.getElementById('address-modal-title').textContent = 'Edit Address';
      
      // In a real application, this would populate the form with address data
      // For this demo, we'll just show the modal
      addressModal.style.display = 'block';
    });
  });
  
  // Delete address button click event
  deleteAddressButtons.forEach(button => {
    button.addEventListener('click', () => {
      // In a real application, this would delete the address
      // For this demo, we'll just show a notification
      showNotification('Address deleted successfully!', 'success');
    });
  });
  
  // Set default address button click event
  setDefaultButtons.forEach(button => {
    button.addEventListener('click', () => {
      // In a real application, this would set the address as default
      // For this demo, we'll just show a notification
      showNotification('Address set as default successfully!', 'success');
    });
  });
  
  // Close address modal
  closeAddressModal.addEventListener('click', () => {
    addressModal.style.display = 'none';
  });
  
  // Cancel button click event
  cancelButton.addEventListener('click', () => {
    addressModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === addressModal) {
      addressModal.style.display = 'none';
    }
  });
  
  // Address form submit event
  addressForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // In a real application, this would save the address
    // For this demo, we'll just show a notification and close the modal
    showNotification('Address saved successfully!', 'success');
    addressModal.style.display = 'none';
  });
  
  // Wishlist functionality
  const addToCartButtons = document.querySelectorAll('.wishlist-actions .add-to-cart-btn');
  const removeWishlistButtons = document.querySelectorAll('.remove-wishlist-btn');
  
  // Add to cart button click event
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      // In a real application, this would add the item to the cart
      // For this demo, we'll just show a notification
      showNotification('Item added to cart successfully!', 'success');
    });
  });
  
  // Remove wishlist button click event
  removeWishlistButtons.forEach(button => {
    button.addEventListener('click', () => {
      // In a real application, this would remove the item from the wishlist
      // For this demo, we'll just show a notification
      showNotification('Item removed from wishlist successfully!', 'success');
    });
  });
  
  // Review functionality
  const editReviewButtons = document.querySelectorAll('.edit-review-btn');
  const deleteReviewButtons = document.querySelectorAll('.delete-review-btn');
  
  // Edit review button click event
  editReviewButtons.forEach(button => {
    button.addEventListener('click', () => {
      // In a real application, this would open a review edit form
      // For this demo, we'll just show a notification
      showNotification('Review editing is not available for this demo.', 'info');
    });
  });
  
  // Delete review button click event
  deleteReviewButtons.forEach(button => {
    button.addEventListener('click', () => {
      // In a real application, this would delete the review
      // For this demo, we'll just show a notification
      showNotification('Review deleted successfully!', 'success');
    });
  });
  
  // Settings functionality
  const settingsForms = document.querySelectorAll('.settings-form');
  
  // Settings form submit event
  settingsForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // In a real application, this would save the settings
      // For this demo, we'll just show a notification
      showNotification('Settings saved successfully!', 'success');
    });
  });
  
  // Order filter functionality
  const orderSearch = document.getElementById('order-search');
  const statusFilter = document.getElementById('status-filter');
  
  if (orderSearch) {
    orderSearch.addEventListener('input', filterOrders);
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', filterOrders);
  }
  
  function filterOrders() {
    // In a real application, this would filter the orders based on search and status
    // For this demo, we'll just show a notification
    showNotification('Order filtering is not available for this demo.', 'info');
  }
  
  // Pagination functionality
  const paginationButtons = document.querySelectorAll('.pagination-btn');
  
  paginationButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      paginationButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button if it's not the next button
      if (!button.classList.contains('next')) {
        button.classList.add('active');
      }
      
      // In a real application, this would load the next page of items
      // For this demo, we'll just scroll to the top of the content
      document.querySelector('.dashboard-content').scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  // Show notification
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }, 10);
  }
  
  // Add notification styles if not already in CSS
  const notificationStyles = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: var(--border-radius);
      color: white;
      font-size: 14px;
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    
    .notification.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    .notification.success {
      background-color: #4CAF50;
    }
    
    .notification.error {
      background-color: #ff6b6b;
    }
    
    .notification.warning {
      background-color: #ff9800;
    }
    
    .notification.info {
      background-color: #2196F3;
    }
  `;
  
  // Add styles to head if not already present
  if (!document.getElementById('notification-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'notification-styles';
    styleElement.textContent = notificationStyles;
    document.head.appendChild(styleElement);
  }
});
