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
  
  // Decide background and icon based on food keywords
  let bgColor = '%2310b981'; // emerald-500
  let icon = '🥗';
  let category = 'Healthy Food';
  
  if (lower.includes('taco') || lower.includes('mexican')) {
    bgColor = '%23f59e0b'; // amber-500
    icon = '🌮';
    category = 'Mexican';
  } else if (lower.includes('dal') || lower.includes('curry') || lower.includes('tikka') || lower.includes('masala')) {
    bgColor = '%23ea580c'; // orange-600
    icon = '🍛';
    category = 'Indian Curry';
  } else if (lower.includes('soup') || lower.includes('broth')) {
    bgColor = '%2306b6d4'; // cyan-500
    icon = '🍲';
    category = 'Warm Soup';
  } else if (lower.includes('rice') || lower.includes('biryani')) {
    bgColor = '%23eab308'; // yellow-500
    icon = '🍚';
    category = 'Rice Bowl';
  } else if (lower.includes('egg') || lower.includes('breakfast') || lower.includes('pancake') || lower.includes('oat') || lower.includes('berry')) {
    bgColor = '%23f97316'; // orange-500
    icon = '🍳';
    category = 'Breakfast';
  } else if (lower.includes('smoothie') || lower.includes('shake') || lower.includes('juice')) {
    bgColor = '%23ec4899'; // pink-500
    icon = '🥤';
    category = 'Beverage';
  } else if (lower.includes('chicken') || lower.includes('meat') || lower.includes('beef') || lower.includes('kabab')) {
    bgColor = '%23ef4444'; // red-500
    icon = '🍗';
    category = 'Protein';
  } else if (lower.includes('fish') || lower.includes('salmon') || lower.includes('seafood') || lower.includes('sushi') || lower.includes('roll')) {
    bgColor = '%233b82f6'; // blue-500
    icon = '🍣';
    category = 'Seafood';
  }
  
  // Create a beautiful modern SVG placeholder with gradient-like looks
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'>
    <defs>
      <linearGradient id='grad-${name.length}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'>
        <stop offset='0%25' style='stop-color:${bgColor};stop-opacity:1' />
        <stop offset='100%25' style='stop-color:%230f172a;stop-opacity:0.95' />
      </linearGradient>
    </defs>
    <rect width='300' height='200' fill='url(%23grad-${name.length})' />
    <circle cx='150' cy='85' r='35' fill='%23ffffff' fill-opacity='0.15' />
    <text x='50%25' y='98' font-size='36' text-anchor='middle' alignment-baseline='middle'>${icon}</text>
    <text x='50%25' y='155' font-size='12' font-weight='800' font-family='system-ui, sans-serif' text-anchor='middle' fill='%23ffffff' fill-opacity='0.9'>${name.toUpperCase()}</text>
    <text x='50%25' y='175' font-size='10' font-weight='700' font-family='system-ui, sans-serif' text-anchor='middle' fill='%23ffffff' fill-opacity='0.5' letter-spacing='1.5'>${category.toUpperCase()}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${svg}`;
};
