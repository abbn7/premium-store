'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

// Force dynamic rendering to avoid build-time Supabase URL errors
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    clearCart();
  };

  if (isSuccess) {
    return (
      <div className="container py-20 text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-4xl font-bold">Order Placed Successfully!</h1>
        <p className="text-zinc-500 max-w-md mx-auto">
          Thank you for your purchase. We will contact you shortly to confirm your order and shipping details.
        </p>
        <Link href="/" className="btn btn-primary inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center space-y-6">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/products" className="btn btn-primary inline-block">
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Address</label>
              <textarea
                required
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 h-24"
                placeholder="Street name, Building number..."
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Payment Method</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                />
                <div>
                  <p className="font-medium">Cash on Delivery (COD)</p>
                  <p className="text-sm text-zinc-500">Pay when you receive your order</p>
                </div>
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full py-4 text-lg"
          >
            {isSubmitting ? 'Processing...' : `Place Order (${formatPrice(totalPrice)})`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-2xl h-fit space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Order Summary</h2>
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between gap-4">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {item.name} <span className="text-xs">x{item.quantity}</span>
                </span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
