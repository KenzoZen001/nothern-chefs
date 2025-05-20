// js/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nmivtkovpygylpyaeqju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taXZ0a292cHlneWxweWFlcWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MjE0NDMsImV4cCI6MjA2MzE5NzQ0M30.kjv866JZXCIfm--b1edi2DYsdisVqjfRaWjOe3tkZmw';

// Initialize the Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if user is logged in
async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Sign up a new user
async function signUp(email, password, userData) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone_number: userData.phone
      }
    }
  });
  
  if (error) {
    throw error;
  }
  
  // Create user preferences
  if (data.user) {
    await supabase.from('user_preferences').insert({
      user_id: data.user.id,
      favorite_products: userData.favorites || [],
      referral_source: userData.referral || null
    });
  }
  
  return data;
}

// Sign in a user
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

// Get user profile
async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Get user preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  return {
    id: user.id,
    email: user.email,
    firstName: user.user_metadata.first_name,
    lastName: user.user_metadata.last_name,
    phoneNumber: user.user_metadata.phone_number,
    preferences: preferences
  };
}

// Add product to cart
async function addToCart(productId, quantity = 1) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Handle guest cart (using localStorage)
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  }
  
  // Handle logged-in user cart
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();
    
  if (existingItem) {
    // Update existing item
    const { data } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select();
    return data;
  } else {
    // Insert new item
    const { data } = await supabase
      .from('cart_items')
      .insert({ user_id: user.id, product_id: productId, quantity })
      .select();
    return data;
  }
}

// Get cart items
async function getCartItems() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Return guest cart from localStorage
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }
  
  // Get logged-in user's cart with product details
  const { data } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        price,
        image_url
      )
    `)
    .eq('user_id', user.id);
    
  return data || [];
}

// Make these functions globally available
window.supabase = supabase;
window.supabaseAuth = {
  checkUser,
  signUp,
  signIn,
  signOut,
  getUserProfile
};

window.supabaseCart = {
  addToCart,
  getCartItems
};
