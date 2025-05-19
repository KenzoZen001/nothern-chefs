// js/seed-products.js
const products = [
    {
      name: "Chicken Pastil Original",
      description: "Traditional chicken pastil with authentic flavors.",
      price: 149.00,
      image_url: "public/images/chickenpastiloriginal.png",
      category: "chicken-pastil",
      stock_quantity: 100
    },
    {
      name: "Chicken Pastil Spicy",
      description: "Spicy version of our popular chicken pastil.",
      price: 159.00,
      image_url: "public/images/chickenpastilspicy.png",
      category: "chicken-pastil",
      stock_quantity: 100
    },
    {
      name: "Laing Original",
      description: "Traditional laing made with taro leaves and coconut milk.",
      price: 149.00,
      image_url: "public/images/laing.png",
      category: "laing",
      stock_quantity: 100
    },
    {
      name: "Spanish Bangus Original",
      description: "Delicious Spanish-style milkfish in olive oil.",
      price: 189.00,
      image_url: "public/images/bangusspanish.png",
      category: "spanish-bangus",
      stock_quantity: 100
    },
    {
      name: "Chili Garlic Original",
      description: "Homemade chili garlic sauce for adding flavor to any dish.",
      price: 129.00,
      image_url: "public/images/chiligarlic.png",
      category: "chili-garlic",
      stock_quantity: 100
    }
  ];
  
  async function seedProducts() {
    console.log("Seeding products...");
    
    try {
      // Insert products
      const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();
        
      if (error) {
        throw error;
      }
      
      console.log("Products seeded successfully:", data);
    } catch (error) {
      console.error("Error seeding products:", error);
    }
  }
  
  // Run the seed function
  seedProducts();