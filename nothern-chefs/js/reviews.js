document.addEventListener("DOMContentLoaded", () => {
    // Sample reviews data
    const sampleReviews = [
      {
        id: 1,
        username: "Maria Santos",
        rating: 5,
        title: "Absolutely Delicious!",
        content: "The Laing is so authentic and tasty. Reminds me of my grandmother's cooking!",
        date: "2023-12-15",
      },
      {
        id: 2,
        username: "Juan Dela Cruz",
        rating: 4,
        title: "Great Quality Products",
        content: "The Spanish Bangus is excellent. Very convenient and tastes homemade.",
        date: "2023-11-28",
      },
      {
        id: 3,
        username: "Anna Reyes",
        rating: 5,
        title: "Perfect Spice Level",
        content: "The Chili Garlic has the perfect balance of heat and flavor. I put it on everything!",
        date: "2024-01-05",
      },
    ]
  
    // Get reviews from localStorage or use sample reviews
    function getReviews() {
      const savedReviews = localStorage.getItem("reviews")
      return savedReviews ? JSON.parse(savedReviews) : sampleReviews
    }
  
    // Save reviews to localStorage
    function saveReviews(reviews) {
      localStorage.setItem("reviews", JSON.stringify(reviews))
    }
  
    // Render reviews
    function renderReviews() {
      const reviewsList = document.getElementById("reviews-list")
      if (!reviewsList) return
  
      const reviews = getReviews()
  
      if (reviews.length === 0) {
        reviewsList.innerHTML = `
          <div class="no-reviews">
            <p>No reviews yet. Be the first to leave a review!</p>
          </div>`;
        return
      }
  
      reviewsList.innerHTML = reviews
        .map(
          (review) => `
          <div class="review-card">
            <div>
              <div class="review-header">
                <span class="review-author" title="${review.username}">${review.username}</span>
                <span class="review-date">${formatDate(review.date)}</span>
              </div>
              <div class="review-rating">
                ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
              </div>
              <h4 class="review-title" title="${review.title}">${review.title}</h4>
            </div>
            <p class="review-content">${review.content}</p>
          </div>
        `
        )
        .join("")
    }
  
    // Format date with better readability
    function formatDate(dateString) {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      const date = new Date(dateString);
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      // Add ordinal suffix to day (1st, 2nd, 3rd, etc.)
      const ordinalSuffix = (day) => {
        if (day > 3 && day < 21) return "th";
        switch (day % 10) {
          case 1: return "st";
          case 2: return "nd";
          case 3: return "rd";
          default: return "th";
        }
      };
  
      return `${month} ${day}${ordinalSuffix(day)}, ${year}`;
    }
  
    // Handle review form submission
    const reviewForm = document.getElementById("review-form")
    if (reviewForm) {
      reviewForm.addEventListener("submit", (e) => {
        e.preventDefault()
  
        const username = document.getElementById("review-username").value.trim() || "Anonymous"
        const ratingInput = document.querySelector('input[name="rating"]:checked')
        const rating = ratingInput ? Number.parseInt(ratingInput.value) : 5
        const title = document.getElementById("review-title").value.trim()
        const content = document.getElementById("review-content").value.trim()
  
        if (!title || !content) {
          alert("Please fill in all fields")
          return
        }
  
        const newReview = {
          id: Date.now(),
          username,
          rating,
          title,
          content,
          date: new Date().toISOString().split("T")[0],
        }
  
        const reviews = getReviews()
        reviews.unshift(newReview)
        saveReviews(reviews)
  
        // Reset form
        reviewForm.reset()
  
        // Re-render reviews
        renderReviews()
  
        // Show success message
        alert("Thank you for your review!")
      })
    }
  
    // Initialize reviews
    renderReviews()
  })
