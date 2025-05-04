
import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'hoodies',
    name: 'Hoodies',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG9vZGllfGVufDB8fDB8fHww',
    url: '/products?category=Hoodies'
  },
  {
    id: 'tshirts',
    name: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dHNoaXJ0fGVufDB8fDB8fHww',
    url: '/products?category=T-Shirts'
  },
  {
    id: 'pants',
    name: 'Pants',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FyZ28lMjBwYW50c3xlbnwwfHwwfHx8MA%3D%3D',
    url: '/products?category=Pants'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGF0fGVufDB8fDB8fHww',
    url: '/products?category=Accessories'
  },
];

export default function Categories() {
  return (
    <section className="py-16 bg-gradient-to-b from-urban-dark to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-graffiti text-white text-center mb-12">Shop by <span className="text-urban-purple">Category</span></h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={category.url}
              className="group relative overflow-hidden rounded-lg aspect-square hover:scale-[1.03] transition-transform"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
              <div className="absolute inset-0 z-20 flex items-end justify-center p-4">
                <h3 className="text-white text-xl font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
