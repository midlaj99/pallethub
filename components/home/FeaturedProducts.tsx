'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { IProduct } from '@/types';

interface FeaturedProductsProps {
  initialProducts?: IProduct[];
}

export default function FeaturedProducts({ initialProducts }: FeaturedProductsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleBuyNow = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const selectedSize = product.variants?.sizes?.[0] || 'Standard';
    addItem(product, 1, selectedSize);
    router.push('/checkout');
  };

  // 5 exact products from reference
  const products: IProduct[] = initialProducts && initialProducts.length > 0
    ? initialProducts.slice(0, 5)
    : [
        {
          _id: 'prod_1',
          name: 'Oversized T-Shirt',
          slug: 'oversized-t-shirt',
          description: 'Heavyweight cotton drop-shoulder streetwear tee.',
          category: 'Costume',
          price: 799,
          originalPrice: 1299,
          images: ['/images/products/oversized-tshirt.png'],
          stock: 45,
          variants: { sizes: ['S', 'M', 'L', 'XL'] },
          isFeatured: true,
        },
        {
          _id: 'prod_2',
          name: 'Formal Blazer',
          slug: 'formal-blazer',
          description: 'Tailored jet black evening blazer.',
          category: 'Costume',
          price: 2499,
          originalPrice: 4499,
          images: ['/images/products/formal-blazer.png'],
          stock: 18,
          variants: { sizes: ['38', '40', '42'] },
          isFeatured: true,
        },
        {
          _id: 'prod_3',
          name: 'Trendy Cap',
          slug: 'trendy-cap',
          description: 'Black monochrome 3D embroidered baseball cap.',
          category: 'Caps & Hats',
          price: 599,
          originalPrice: 999,
          images: ['/images/products/trendy-cap.png'],
          stock: 60,
          variants: { sizes: ['Free Size'] },
          isFeatured: true,
        },
        {
          _id: 'prod_4',
          name: "Men's Watch",
          slug: 'mens-watch',
          description: 'Matte black chronograph with sapphire crystal glass.',
          category: 'Luxury Watches',
          price: 1999,
          originalPrice: 3999,
          images: ['/images/products/mens-watch.png'],
          stock: 22,
          variants: { sizes: ['42mm Case'] },
          isFeatured: true,
        },
        {
          _id: 'prod_5',
          name: 'Chain Necklace',
          slug: 'chain-necklace',
          description: 'Rhodium-plated surgical stainless steel cuban link.',
          category: 'Chains & Necklaces',
          price: 899,
          originalPrice: 1499,
          images: ['/images/products/chain-necklace.png'],
          stock: 35,
          variants: { sizes: ['22 Inch'] },
          isFeatured: true,
        },
      ];

  const handleAddToCart = (product: IProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedSize = product.variants?.sizes?.[0] || 'Standard';
    addItem(product, 1, selectedSize);

    setAddedIds((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  return (
    <section id="featured-products" className="bg-[#0b0c0d] text-white py-16 sm:py-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching reference */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-2">
              FEATURED PRODUCTS
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Top Picks for You
            </h2>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            <span>View All</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* 5 Products Responsive Grid matching reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6">
          {products.map((product) => {
            const isWishlisted = isInWishlist(product._id);
            const isAdded = addedIds[product._id];

            return (
              <div
                key={product._id}
                className="group flex flex-col justify-between rounded-2xl bg-transparent transition-all duration-300"
              >
                {/* Product Image Card Container */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#18191b] border border-neutral-800/80 shadow-md">
                  <Link href={`/products/${product.slug}`} className="block w-full h-full">
                    <Image
                      src={product.images[0] || '/images/products/oversized-tshirt.png'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  </Link>

                  {/* Wishlist Heart Button matching reference */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product._id);
                    }}
                    aria-label="Toggle wishlist"
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white transition-all duration-200 hover:scale-110"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'
                      }`}
                    />
                  </button>

                  {/* Stock or discount badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold text-white tracking-wider uppercase">
                      Sale
                    </span>
                  )}
                </div>

                {/* Product Info matching reference */}
                <div className="pt-3.5 pb-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="block font-medium text-sm sm:text-base text-neutral-100 hover:text-white truncate"
                    title={product.name}
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm sm:text-base text-white">
                      ₹ {product.price.toLocaleString('en-IN')}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-neutral-500 line-through">
                        ₹ {product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dual Action Buttons: Add to Cart & Buy Now */}
                <div className="grid grid-cols-2 gap-2 mt-2.5">
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={product.stock <= 0}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 active:scale-[0.98]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => handleBuyNow(product, e)}
                    disabled={product.stock <= 0}
                    className="py-2.5 px-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-100 flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer active:scale-[0.98]"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
