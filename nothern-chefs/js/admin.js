// js/admin.js
document.addEventListener("DOMContentLoaded", async () => {
    // Check if user is logged in and is an admin
    const user = await window.supabaseAuth.checkUser();
    
    if (!user) {
      // Redirect to login if not logged in
      window.location.href = "login.html";
      return;
    }
    
    // For simplicity, we'll assume the first user is an admin
    // In a real app, you would check for admin role
    
    // Tab switching
    const menuItems = document.querySelectorAll('.admin-menu li');
    const tabs = document.querySelectorAll('.admin-tab');
    
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        // Remove active class from all menu items and tabs
        menuItems.forEach(i => i.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked menu item and corresponding tab
        item.classList.add('active');
        const tabId = `${item.getAttribute('data-tab')}-tab`;
        document.getElementById(tabId).classList.add('active');
        
        // Load data for the tab
        if (tabId === 'products-tab') {
          loadProducts();
        } else if (tabId === 'orders-tab') {
          loadOrders();
        } else if (tabId === 'users-tab') {
          loadUsers();
        }
      });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await window.supabaseAuth.signOut();
          window.location.href = "login.html";
        } catch (error) {
          showNotification("Error signing out: " + error.message, "error");
        }
      });
    }
    
    // Product modal
    const productModal = document.getElementById('product-modal');
    const addProductBtn = document.getElementById('add-product-btn');
    const closeModal = productModal.querySelector('.close-modal');
    const cancelBtn = productModal.querySelector('.cancel-btn');
    const productForm = document.getElementById('product-form');
    
    // Open modal for adding a product
    addProductBtn.addEventListener('click', () => {
      document.getElementById('product-modal-title').textContent = 'Add Product';
      productForm.reset();
      document.getElementById('product-id').value = '';
      productModal.style.display = 'block';
    });
    
    // Close modal
    closeModal.addEventListener('click', () => {
      productModal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
      productModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === productModal) {
        productModal.style.display = 'none';
      }
    });
    
    // Product form submission
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const productId = document.getElementById('product-id').value;
      const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock_quantity: parseInt(document.getElementById('product-stock').value),
        category: document.getElementById('product-category').value,
        image_url: document.getElementById('product-image').value || null
      };
      
      try {
        if (productId) {
          // Update existing product
          await supabase
            .from('products')
            .update(productData)
            .eq('id', productId);
            
          showNotification("Product updated successfully");
        } else {
          // Add new product
          await supabase
            .from('products')
            .insert(productData);
            
          showNotification("Product added successfully");
        }
        
        // Close modal and reload products
        productModal.style.display = 'none';
        loadProducts();
      } catch (error) {
        showNotification("Error saving product: " + error.message, "error");
      }
    });
    
    // Load products initially
    loadProducts();
    
    // Load products function
    async function loadProducts() {
      const productsTable = document.getElementById('products-table');
      const tbody = productsTable.querySelector('tbody');
      
      try {
        // Show loading state
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="loading-message">Loading products...</td>
          </tr>
        `;
        
        // Fetch products from Supabase
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        // Clear table
        tbody.innerHTML = '';
        
        if (products.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" class="empty-message">No products found</td>
            </tr>
          `;
          return;
        }
        
        // Add products to table
        products.forEach(product => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>
              <img src="${product.image_url || 'public/images/placeholder.png'}" alt="${product.name}" class="product-thumbnail">
            </td>
            <td>${product.name}</td>
            <td>${formatCategory(product.category)}</td>
            <td>₱${product.price.toFixed(2)}</td>
            <td>${product.stock_quantity}</td>
            <td>
              <button class="edit-btn" data-id="${product.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-btn" data-id="${product.id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          `;
          
          tbody.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
          button.addEventListener('click', (e) => {
            const productId = button.getAttribute('data-id');
            editProduct(productId);
          });
        });
        
        document.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', (e) => {
            const productId = button.getAttribute('data-id');
            deleteProduct(productId);
          });
        });
      } catch (error) {
        console.error("Error loading products:", error);
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="error-message">Error loading products: ${error.message}</td>
          </tr>
        `;
      }
    }
    
    // Edit product function
    async function editProduct(productId) {
      try {
        // Fetch product data
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
          
        if (error) {
          throw error;
        }
        
        // Populate form
        document.getElementById('product-modal-title').textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock_quantity;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-image').value = product.image_url || '';
        
        // Show modal
        productModal.style.display = 'block';
      } catch (error) {
        showNotification("Error loading product: " + error.message, "error");
      }
    }
    
    // Delete product function
    async function deleteProduct(productId) {
      if (confirm("Are you sure you want to delete this product?")) {
        try {
          // Delete product
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
            
          if (error) {
            throw error;
          }
          
          showNotification("Product deleted successfully");
          loadProducts();
        } catch (error) {
          showNotification("Error deleting product: " + error.message, "error");
        }
      }
    }
    
    // Format category function
    function formatCategory(category) {
      return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // Load orders function
    async function loadOrders() {
      const ordersTable = document.getElementById('orders-table');
      const tbody = ordersTable.querySelector('tbody');
      
      try {
        // Show loading state
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="loading-message">Loading orders...</td>
          </tr>
        `;
        
        // Fetch orders from Supabase
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            *,
            users (
              first_name,
              last_name,
              email
            )
          `)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Clear table
        tbody.innerHTML = '';
        
        if (orders.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" class="empty-message">No orders found</td>
            </tr>
          `;
          return;
        }
        
        // Add orders to table
        orders.forEach(order => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${order.order_number}</td>
            <td>${order.users ? `${order.users.first_name} ${order.users.last_name}` : 'Unknown'}</td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
            <td>₱${order.total.toFixed(2)}</td>
            <td>
              <button class="view-btn" data-id="${order.id}">
                <i class="fas fa-eye"></i>
              </button>
              <button class="update-status-btn" data-id="${order.id}">
                <i class="fas fa-edit"></i>
              </button>
            </td>
          `;
          
          tbody.appendChild(row);
        });
        
        // Add event listeners to buttons
        // (Implementation for view and update status would go here)
      } catch (error) {
        console.error("Error loading orders:", error);
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="error-message">Error loading orders: ${error.message}</td>
          </tr>
        `;
      }
    }
    
    // Load users function
    async function loadUsers() {
      const usersTable = document.getElementById('users-table');
      const tbody = usersTable.querySelector('tbody');
      
      try {
        // Show loading state
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="loading-message">Loading users...</td>
          </tr>
        `;
        
        // Fetch users from Supabase Auth
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
          throw error;
        }
        
        // Clear table
        tbody.innerHTML = '';
        
        if (users.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" class="empty-message">No users found</td>
            </tr>
          `;
          return;
        }
        
        // Add users to table
        users.forEach(user => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td>${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}</td>
            <td>${user.email}</td>
            <td>${user.user_metadata.phone_number || 'N/A'}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
              <button class="view-user-btn" data-id="${user.id}">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          `;
          
          tbody.appendChild(row);
        });
        
        // Add event listeners to buttons
        // (Implementation for view user would go here)
      } catch (error) {
        console.error("Error loading users:", error);
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="error-message">Error loading users: ${error.message}</td>
          </tr>
        `;
      }
    }
    
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