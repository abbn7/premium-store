'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer({ currencySymbol }: { currencySymbol: string }) {
  const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-900 z-[60] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="text-6xl">🛒</div>
                  <p className="text-zinc-500">Your cart is empty</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="btn btn-primary"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.name}</h3>
                      <p className="text-sm text-zinc-500 mb-2">
                        {formatPrice(item.price, currencySymbol)}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-sm font-medium border-x border-zinc-200 dark:border-zinc-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-medium">
                      {formatPrice(item.price * item.quantity, currencySymbol)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice, currencySymbol)}</span>
                </div>
                <p className="text-xs text-zinc-500 text-center">
                  Shipping and taxes calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="btn btn-primary w-full py-4 text-center text-lg"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
