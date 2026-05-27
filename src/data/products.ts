import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // Vegetables
  {
    id: 'v1',
    name: 'Fresh Tomato (Tamatar)',
    category: 'vegetable',
    price: 30,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: true,
    description: 'Vibrant red, juicy fresh farm-grown tomatoes, perfect for salads, sauces, and curries.',
    rating: 4.8
  },
  {
    id: 'v2',
    name: 'Organic Potato (Alu)',
    category: 'vegetable',
    price: 25,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: true,
    description: 'Directly sourced from the cold-soils of North India, versatile and rich in carbohydrates.',
    rating: 4.7
  },
  {
    id: 'v3',
    name: 'Red Onion (Pyaz)',
    category: 'vegetable',
    price: 35,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1508747702-3de20f3c5b59?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: true,
    description: 'Crisp, pungent red onions, essential as a base for curries, sautéing, or fresh salads.',
    rating: 4.6
  },
  {
    id: 'v4',
    name: 'Fresh Cauliflower (Gobi)',
    category: 'vegetable',
    price: 40,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ecf?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: false,
    description: 'Snow-white compact heads of fresh cauliflower, rich in vitamin C and dietary fibers.',
    rating: 4.5
  },
  {
    id: 'v5',
    name: 'Green Spinaches (Palak)',
    category: 'vegetable',
    price: 20,
    unit: 'bunch',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: true,
    description: 'Iron-rich, fresh green spinach leaves, washed carefully and ready for health smoothies or saag.',
    rating: 4.9
  },
  {
    id: 'v6',
    name: 'Lady Finger (Bhindi/Okra)',
    category: 'vegetable',
    price: 45,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1625938146369-adc83368bda7?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: false,
    description: 'Tender, slim and fiber-dense green okra, locally harvested for crisp stir-fries.',
    rating: 4.4
  },
  {
    id: 'v7',
    name: 'Organic Eggplant (Baingan)',
    category: 'vegetable',
    price: 30,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4bc820?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: true,
    description: 'Glossy dark purple brinjal, perfect for roast recipes like "baingan bharta" and stews.',
    rating: 4.3
  },
  {
    id: 'v8',
    name: 'Sweet Carrot (Gajar)',
    category: 'vegetable',
    price: 40,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: false,
    description: 'Crunchy, sweet orange carrots, packed with beta-carotene, perfect for juice or dessert gajar halwa.',
    rating: 4.7
  },

  // Fruits
  {
    id: 'f1',
    name: 'Kashmiri Apple (Seb)',
    category: 'fruit',
    price: 120,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: true,
    description: 'Premium red delicious apples directly from Kashmir valleys, sweet, crunchy and extremely healthy.',
    rating: 4.9
  },
  {
    id: 'f2',
    name: 'Ripe Bananas (Kela)',
    category: 'fruit',
    price: 40,
    unit: 'dozen',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: false,
    description: 'Perfectly yellow, energizing ripe bananas, rich in potassium and instantly sweet.',
    rating: 4.6
  },
  {
    id: 'f3',
    name: 'Sunkist Orange (Santra)',
    category: 'fruit',
    price: 60,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: true,
    description: 'Tangy-sweet citrus oranges, loaded with vitamin C, hand-plucked from orange groves.',
    rating: 4.5
  },
  {
    id: 'f4',
    name: 'Alphonso Mango (Aam)',
    category: 'fruit',
    price: 90,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: true,
    description: 'The King of Fruits. Ultra-sweet, pulpy Alphonso mangoes with rich yellow flash and tropical aroma.',
    rating: 4.9
  },
  {
    id: 'f5',
    name: 'Sweet Grapes (Angoor)',
    category: 'fruit',
    price: 70,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: false,
    description: 'Seedless crisp green grapes, wonderfully sweet and cooling for hot summer afternoons.',
    rating: 4.7
  },
  {
    id: 'f6',
    name: 'Ruby Pomegranate (Anar)',
    category: 'fruit',
    price: 140,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: true,
    description: 'Pristine ruby-red grains inside, extremely high in antioxidants, fresh and crisp.',
    rating: 4.8
  },
  {
    id: 'f7',
    name: 'Ripe Papaya (Papita)',
    category: 'fruit',
    price: 40,
    unit: 'pc',
    image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: false,
    description: 'Sweet, buttery orange papaya, an excellent digestive fruit packed with enzymes.',
    rating: 4.4
  },
  {
    id: 'f8',
    name: 'Stripped Watermelon (Tarbooz)',
    category: 'fruit',
    price: 30,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    isAiGenerated: true,
    description: 'Vibrant, watery, and cool red watermelons, perfect hydration for warm climates.',
    rating: 4.8
  }
];

export function getStoredProducts(): Product[] {
  const stored = localStorage.getItem('freshmarket_products');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored products, using defaults', e);
    }
  }
  return INITIAL_PRODUCTS;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem('freshmarket_products', JSON.stringify(products));
}
