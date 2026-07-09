// Curated ingredients and recipes to display beautiful culinary details for the food database
export const getRecipeDetails = (foodName = '') => {
  const name = foodName.toLowerCase();
  
  if (name.includes('taco')) {
    return {
      ingredients: [
        'Lean Ground Beef or Tofu (200g)',
        'Corn Tortillas (3 pcs)',
        'Shredded Lettuce (1 cup)',
        'Diced Tomatoes (1/2 cup)',
        'Cheddar Cheese or Vegan Cheese (1/4 cup)',
        'Fresh Cilantro & Lime wedges',
        'Taco Seasoning (Cumin, Chili Powder, Oregano)'
      ],
      instructions: [
        'Brown the meat/tofu in a skillet over medium heat, draining any excess fat.',
        'Stir in the taco seasoning and a splash of water, simmer for 5 minutes.',
        'Warm the corn tortillas in a dry pan for 30 seconds on each side.',
        'Assemble the tacos by layering the meat/tofu, cheese, lettuce, and tomatoes.',
        'Garnish with fresh cilantro and a squeeze of lime juice.'
      ]
    };
  }

  if (name.includes('dal') || name.includes('lentil')) {
    return {
      ingredients: [
        'Yellow Split Lentils / Dal (1 cup)',
        'Water (3 cups)',
        'Ghee or Coconut Oil (1 tbsp)',
        'Cumin Seeds (1 tsp)',
        'Finely chopped Onion (1 medium)',
        'Minced Garlic & Ginger (1 tbsp)',
        'Turmeric, Garam Masala & Salt to taste',
        'Chopped Cilantro for garnish'
      ],
      instructions: [
        'Rinse the lentils and boil them in water with turmeric and salt until soft (approx. 20 minutes).',
        'In a separate pan, heat ghee/oil and add cumin seeds until they splutter.',
        'Add onions, garlic, and ginger, sautéing until golden brown.',
        'Stir in garam masala and pour this aromatic mixture (Tadka) over the cooked lentils.',
        'Stir well, garnish with fresh cilantro, and serve warm.'
      ]
    };
  }

  if (name.includes('salad')) {
    return {
      ingredients: [
        'Mixed Salad Greens / Spinach (3 cups)',
        'Cucumber sliced (1/2 cup)',
        'Cherry Tomatoes halved (1/2 cup)',
        'Avocado sliced (1/2)',
        'Extra Virgin Olive Oil (1 tbsp)',
        'Lemon Juice (1 tbsp)',
        'Pumpkin Seeds or Almonds (2 tbsp)',
        'Salt and freshly cracked Black Pepper'
      ],
      instructions: [
        'Wash and thoroughly dry the mixed salad greens.',
        'Toss the greens, cucumbers, and cherry tomatoes together in a large bowl.',
        'Top the salad with fresh avocado slices and seeds/nuts.',
        'Whisk olive oil, lemon juice, salt, and pepper in a cup to make the dressing.',
        'Drizzle dressing over the salad right before serving and toss gently.'
      ]
    };
  }

  if (name.includes('chicken') || name.includes('curry') || name.includes('tikka')) {
    return {
      ingredients: [
        'Protein of choice (Chicken Breast / Paneer / Tempeh - 250g)',
        'Greek Yogurt (1/2 cup)',
        'Garlic & Ginger Paste (1 tbsp)',
        'Lemon Juice (1 tbsp)',
        'Spices (Tandoori Masala, Paprika, Cumin, Salt)',
        'Onion and Bell Peppers cubed (1 cup)',
        'Olive Oil (1 tbsp)'
      ],
      instructions: [
        'Cut your protein and vegetables into bite-sized cubes.',
        'Whisk yogurt, lemon juice, garlic, ginger, and spices together in a bowl.',
        'Add the protein and marinate in the refrigerator for at least 30 minutes.',
        'Thread protein and vegetables onto skewers or place on a baking sheet.',
        'Bake at 400°F (200°C) for 20 minutes, turning once, or pan-sear until fully cooked.'
      ]
    };
  }

  if (name.includes('soup')) {
    return {
      ingredients: [
        'Vegetable or Chicken Broth (4 cups)',
        'Chopped Carrots, Celery & Onion (1 cup)',
        'Minced Garlic (2 cloves)',
        'Diced Tomatoes (1 can)',
        'Cannellini Beans or Cooked Chicken (1 cup)',
        'Italian Seasoning & Bay Leaf',
        'Olive Oil (1 tbsp)'
      ],
      instructions: [
        'Heat olive oil in a large pot, sauté onion, celery, carrots, and garlic until soft.',
        'Pour in the broth, diced tomatoes (with juice), and seasonings.',
        'Bring to a boil, then reduce heat and simmer for 15 minutes.',
        'Add the beans or cooked chicken and cook for another 5 minutes.',
        'Discard the bay leaf, adjust salt/pepper, and serve hot.'
      ]
    };
  }

  if (name.includes('smoothie') || name.includes('shake')) {
    return {
      ingredients: [
        'Frozen Berries or Banana (1 cup)',
        'Almond Milk or Oat Milk (1.5 cups)',
        'Protein Powder (1 scoop)',
        'Chia Seeds or Flaxseeds (1 tbsp)',
        'Spinach (optional, 1 cup)',
        'Honey or Maple Syrup (1 tsp)'
      ],
      instructions: [
        'Add the liquid (almond/oat milk) to your blender first to prevent sticking.',
        'Add frozen fruits, protein powder, seeds, and sweetener.',
        'Blend on high speed for 60-90 seconds until completely smooth.',
        'If too thick, add a splash more milk and blend briefly.',
        'Pour into a glass and enjoy immediately.'
      ]
    };
  }

  // Fallback recipes for general food items
  return {
    ingredients: [
      'Primary organic ingredient (200g)',
      'Aromatic Herbs & Seasoning',
      'Healthy Fat source (Olive oil/Ghee - 1 tbsp)',
      'Assorted fresh vegetables (1 cup)',
      'Mineral Salt and Black Pepper to taste'
    ],
    instructions: [
      'Prepare and wash all ingredients thoroughly.',
      'Heat oil/ghee in a pan over medium heat.',
      'Sauté the primary ingredients and vegetables with seasoning.',
      'Cover and simmer on low heat for 10-15 minutes until tender.',
      'Serve warm alongside a fresh side salad.'
    ]
  };
};

export const getFoodImage = (name = '') => {
  const lower = name.toLowerCase();
  
  // 1. Keyword-based matching for maximum accuracy
  if (lower.includes('salad')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop';
  if (lower.includes('oat') || lower.includes('porridge') || lower.includes('berry') || lower.includes('berries')) return 'https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?w=400&h=300&fit=crop';
  if (lower.includes('sushi') || lower.includes('roll')) return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop';
  if (lower.includes('taco')) return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop';
  if (lower.includes('salmon') || lower.includes('fish') || lower.includes('seafood')) return 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&h=300&fit=crop';
  if (lower.includes('curry') || lower.includes('tikka') || lower.includes('masala') || lower.includes('dal')) return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop';
  if (lower.includes('pasta') || lower.includes('spaghetti') || lower.includes('noodle')) return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop';
  if (lower.includes('yogurt') || lower.includes('parfait')) return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop';
  if (lower.includes('rice') || lower.includes('biryani')) return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop';
  if (lower.includes('soup') || lower.includes('stew') || lower.includes('broth')) return 'https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=400&h=300&fit=crop';
  if (lower.includes('beef') || lower.includes('steak') || lower.includes('meat')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop';
  if (lower.includes('pancake') || lower.includes('waffle') || lower.includes('french toast')) return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop';
  if (lower.includes('smoothie') || lower.includes('juice') || lower.includes('shake') || lower.includes('beverage')) return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop';
  if (lower.includes('egg') || lower.includes('omelette') || lower.includes('scramble')) return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop';
  if (lower.includes('sandwich') || lower.includes('toast') || lower.includes('bread')) return 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop';
  if (lower.includes('burger')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop';
  if (lower.includes('fruit') || lower.includes('apple') || lower.includes('banana')) return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop';
  if (lower.includes('nut') || lower.includes('seed') || lower.includes('almond')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop';
  if (lower.includes('tofu') || lower.includes('veg') || lower.includes('stir fry') || lower.includes('vegetable')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
  if (lower.includes('shrimp') || lower.includes('prawn') || lower.includes('crab')) return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop';
  
  // 2. Hash-based fallback to distribute remaining foods across 20 unique images
  const images = [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', // Salad
    'https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?w=400&h=300&fit=crop', // Oatmeal
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop', // Sushi
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop', // Taco
    'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&h=300&fit=crop', // Salmon
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', // Curry
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop', // Pasta
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', // Yogurt
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop', // Rice
    'https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=400&h=300&fit=crop', // Soup
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', // Steak
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop', // Pancake
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop', // Smoothie
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop', // Sandwich
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', // Burger
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop', // Fruit
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', // Nuts
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', // Veggies
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop', // Seafood
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop'  // Bread
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % images.length;
  return images[index];
};
