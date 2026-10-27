/* menu-data.js — the dishes, stored as an array of objects.
   menu.js reads this array to build the page. */
const menuItems = [
  { name: 'Tomato Bruschetta',    category: 'starters', price: 7.00,  vegetarian: true,  description: 'Toasted bread, garlic, basil, olive oil' },
  { name: 'Soup of the Day',      category: 'starters', price: 6.50,  vegetarian: true,  description: 'Changes daily, ask your server' },
  { name: 'Crispy Calamari',      category: 'starters', price: 9.50,  vegetarian: false, description: 'Served with lemon aioli' },
  { name: 'Copper House Burger',  category: 'mains',    price: 13.00, vegetarian: false, description: 'Beef patty, cheddar, house sauce, fries' },
  { name: 'Wood-Fired Pizza',     category: 'mains',    price: 12.00, vegetarian: true,  description: 'Mozzarella, tomato, fresh basil' },
  { name: 'Grilled Salmon',       category: 'mains',    price: 16.50, vegetarian: false, description: 'Roasted vegetables, lemon butter sauce' },
  { name: 'Sushi Sampler',        category: 'mains',    price: 14.00, vegetarian: false, description: 'Chef\u2019s daily selection, 8 pieces' },
  { name: 'Chocolate Layer Cake', category: 'desserts', price: 6.00,  vegetarian: false, description: 'Made in-house, three layers' },
  { name: 'Vanilla Salad Bowl',   category: 'desserts', price: 5.00,  vegetarian: true,  description: 'Light and sweet, with fresh vanilla' },
  { name: 'House Red Wine',       category: 'drinks',   price: 7.00,  vegetarian: false, description: 'A glass of our house red' },
  { name: 'Fresh Lemonade',       category: 'drinks',   price: 4.00,  vegetarian: false, description: 'Squeezed to order' }
];
