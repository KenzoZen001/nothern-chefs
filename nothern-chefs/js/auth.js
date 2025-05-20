// Import Supabase client
// Note: The Supabase client should be initialized in supabase.js and available globally

// Check if user is logged in
async function checkUser() {
    try {
      // Use the global supabase client
      if (!window.supabase) {
        console.error("Supabase client not initialized")
        return null
      }
  
      const {
        data: { user },
        error,
      } = await window.supabase.auth.getUser()
  
      if (error) {
        console.error("Error checking auth status:", error)
        return null
      }
  
      if (!user) {
        // If on account page and not logged in, redirect to login
        if (window.location.pathname.includes("account.html")) {
          window.location.href = "login.html"
        }
        return null
      }
  
      // If logged in but on login/register page, redirect to account
      if (window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html")) {
        window.location.href = "account.html"
      }
  
      return user
    } catch (error) {
      console.error("Error in checkUser:", error)
      return null
    }
  }
  
  // Login function
  async function login(email, password) {
    try {
      if (!window.supabase) {
        throw new Error("Supabase client not initialized")
      }
  
      const { data, error } = await window.supabase.auth.signInWithPassword({
        email,
        password,
      })
  
      if (error) throw error
  
      return data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }
  
  // Register function
  async function register(email, password, userData) {
    try {
      if (!window.supabase) {
        throw new Error("Supabase client not initialized")
      }
  
      const { data, error } = await window.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })
  
      if (error) throw error
  
      // Create user preferences
      if (data.user) {
        await window.supabase.from("user_preferences").insert({
          user_id: data.user.id,
          favorite_products: userData.favorites || [],
          referral_source: userData.referral || null,
        })
      }
  
      return data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }
  
  // Logout function
  async function logout() {
    try {
      if (!window.supabase) {
        throw new Error("Supabase client not initialized")
      }
  
      const { error } = await window.supabase.auth.signOut()
  
      if (error) {
        console.error("Error logging out:", error)
        return false
      }
  
      window.location.href = "login.html"
      return true
    } catch (error) {
      console.error("Logout error:", error)
      return false
    }
  }
  
  // Update user profile
  async function updateProfile(userData) {
    try {
      if (!window.supabase) {
        throw new Error("Supabase client not initialized")
      }
  
      // Update auth metadata
      const { error: authError } = await window.supabase.auth.updateUser({
        data: userData,
      })
  
      if (authError) throw authError
  
      // Get current user
      const {
        data: { user },
      } = await window.supabase.auth.getUser()
  
      // Update users table
      const { error: dbError } = await window.supabase.from("users").update(userData).eq("id", user.id)
  
      if (dbError) throw dbError
  
      return true
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }
  
  // Upload avatar
  async function uploadAvatar(file) {
    try {
      if (!window.supabase) {
        throw new Error("Supabase client not initialized")
      }
  
      const {
        data: { user },
      } = await window.supabase.auth.getUser()
  
      if (!user) throw new Error("User not authenticated")
  
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`
  
      // Upload file
      const { error: uploadError } = await window.supabase.storage.from("avatars").upload(filePath, file)
  
      if (uploadError) throw uploadError
  
      // Get public URL
      const { data } = window.supabase.storage.from("avatars").getPublicUrl(filePath)
  
      // Update user profile with avatar URL
      await updateProfile({ avatar_url: data.publicUrl })
  
      return data.publicUrl
    } catch (error) {
      console.error("Upload avatar error:", error)
      throw error
    }
  }
  
  // Change password
  async function changePassword(currentPassword, newPassword) {
    try {
      if (!window.supabase) {
        throw new Error("Supabase client not initialized")
      }
  
      // Get current user
      const {
        data: { user },
      } = await window.supabase.auth.getUser()
  
      // First verify current password by trying to sign in
      const { error: signInError } = await window.supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
  
      if (signInError) throw new Error("Current password is incorrect")
  
      // Update password
      const { error } = await window.supabase.auth.updateUser({
        password: newPassword,
      })
  
      if (error) throw error
  
      return true
    } catch (error) {
      console.error("Change password error:", error)
      throw error
    }
  }
  
  // Event listeners for login form
  document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    checkUser()
  
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
      const errorMessage = document.getElementById("error-message")
  
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault()
  
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value
  
        try {
          const loginButton = document.querySelector(".login-button")
          loginButton.textContent = "Logging in..."
          loginButton.disabled = true
  
          await login(email, password)
          window.location.href = "account.html"
        } catch (error) {
          if (errorMessage) {
            errorMessage.style.display = "block"
            errorMessage.querySelector("p").textContent = error.message || "Failed to sign in"
          } else {
            alert(error.message || "Failed to sign in")
          }
  
          const loginButton = document.querySelector(".login-button")
          loginButton.textContent = "Login"
          loginButton.disabled = false
        }
      })
  
      // Toggle password visibility
      const togglePassword = document.querySelector(".toggle-password")
      const passwordInput = document.getElementById("password")
  
      if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
          const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
          passwordInput.setAttribute("type", type)
          togglePassword.classList.toggle("fa-eye")
          togglePassword.classList.toggle("fa-eye-slash")
        })
      }
    }
  
    // Logout buttons
    const logoutButtons = document.querySelectorAll("#logout-btn, #mobile-logout-btn, #sidebar-logout-btn")
    logoutButtons.forEach((button) => {
      if (button) {
        button.addEventListener("click", (e) => {
          e.preventDefault()
          logout()
        })
      }
    })
  })
  