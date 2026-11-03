'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingCart,
  Zap,
  Check,
  Share2,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { IProduct } from '@/types';

interface ProductDetailClientProps {
  product: IProduct;
  relatedProducts: IProduct[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem, setIsOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImage, setActiveImage] = useState<string>(
    product.images[0] || '/images/products/oversized-tshirt.png'
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.sizes?.[0] || 'Standard'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.variants?.colors?.[0] || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);

  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    setIsOpen(false);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="bg-[#f7f5ee] min-h-screen py-8 sm:py-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-black">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-black"
          >
            {product.category}
          </Link>
          {product.subcategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`}
                className="hover:text-black"
              >
                {product.subcategory}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-neutral-200/80 shadow-md">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Thumbnails (if multiple images) */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px]">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-neutral-100 ${
                      activeImage === img ? 'border-black shadow-md' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Featured Photo */}
            <div className="relative flex-1 aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shadow-inner group">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md transition-transform active:scale-95"
                title="Save to Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-700'
                  }`}
                />
              </button>

              {/* Discount Tag */}
              {product.discountPercent && product.discountPercent > 0 ? (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider shadow">
                  {product.discountPercent}% OFF
                </span>
              ) : null}
            </div>

          </div>

          {/* Right Column: Product Meta & Purchasing Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-500">
                  <span>{product.category}</span>
                  {product.subcategory && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-black">{product.subcategory}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-700 font-semibold bg-neutral-100 px-2.5 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.9}</span>
                  <span className="text-neutral-400">({product.reviewsCount || 34})</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-3">
                {product.name}
              </h1>

              {/* Pricing in INR */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl sm:text-3xl font-black text-black">
                  ₹ {product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-neutral-400 line-through">
                    ₹ {product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Tax Included
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal mb-6">
                {product.description}
              </p>

              {/* Size Variant Selector */}
              {product.variants?.sizes && product.variants.sizes.length > 0 && (
                <div className="mb-5">
                  <div className="flex justify-between items-center text-xs font-bold text-neutral-800 mb-2">
                    <span>SELECT SIZE / VARIANT</span>
                    <span className="text-neutral-500 font-normal">True to fit</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          selectedSize === size
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Variant Selector */}
              {product.variants?.colors && product.variants.colors.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-bold text-neutral-800 mb-2">
                    COLOR: <span className="font-normal text-neutral-600">{selectedColor || product.variants.colors[0]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.colors.map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          selectedColor === col
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Stock Indicator */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-neutral-300 rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-black font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-black">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-black font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs">
                  {product.stock > 0 ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock ({product.stock} units available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* CTAs: Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-black border border-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold bg-black text-white hover:bg-neutral-800 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Buy Now (Instant)</span>
                </button>
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-black underline underline-offset-4"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share this piece'}</span>
              </button>
            </div>

            {/* Dropshipping & Trust Guarantees */}
            <div className="border-t border-neutral-100 pt-6 space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-neutral-800 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    Supplier-Fulfilled Dropshipping
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Dispatched directly from verified manufacturer hubs. Tracked delivery in 3-5 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    100% Quality & Payment Protection
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Encrypted Razorpay payments with comprehensive customer satisfaction guarantee.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RotateCcw className="w-4 h-4 text-neutral-800 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    7-Day Easy Replacement Policy
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Hassle-free replacements if the product is damaged, defective, or incorrect size.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6">
              Complete the Look
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel._id}
                  href={`/products/${rel.slug}`}
                  className="group bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 mb-2">
                    <Image
                      src={rel.images[0] || '/images/products/oversized-tshirt.png'}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-neutral-900 truncate">
                    {rel.name}
                  </h3>
                  <p className="text-xs font-bold text-black mt-1">
                    ₹ {rel.price.toLocaleString('en-IN')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
