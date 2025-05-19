document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-button")
    const productItems = document.querySelectorAll(".product-item")
  
    // Add click event to filter buttons
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"))
  
        // Add active class to clicked button
        button.classList.add("active")
  
        // Get filter category
        const filterCategory = button.getAttribute("data-category")
  
        // Filter products
        productItems.forEach((item) => {
          const itemCategory = item.getAttribute("data-category")
  
          if (filterCategory === "all" || filterCategory === itemCategory) {
            item.style.display = "block"
          } else {
            item.style.display = "none"
          }
        })
      })
    })
  
    // Initialize with "all" filter active
    const allFilterButton = document.querySelector('.filter-button[data-category="all"]')
    if (allFilterButton) {
      allFilterButton.classList.add("active")
    }
  })
  