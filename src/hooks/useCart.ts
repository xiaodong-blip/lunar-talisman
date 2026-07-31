import { create } from 'zustand'
import type { CrystalProduct } from '../data/products'

export interface CartItem {
  product: CrystalProduct
  quantity: number
}

type CartStore = {
  cart: CartItem[]
  toastMessage: string | null
  toastId: number
  addToCart: (product: CrystalProduct, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  dismissToast: () => void
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  toastMessage: null,
  toastId: 0,
  addToCart: (product, quantity = 1) =>
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id)
      const nextCart = existing
        ? state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...state.cart, { product, quantity }]

      return {
        cart: nextCart,
        toastMessage: `${product.name} 已加入购物车`,
        toastId: state.toastId + 1,
      }
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    })),
  clearCart: () => set({ cart: [] }),
  dismissToast: () => set({ toastMessage: null }),
}))

export function useCart() {
  const cart = useCartStore((state) => state.cart)
  const toastMessage = useCartStore((state) => state.toastMessage)
  const toastId = useCartStore((state) => state.toastId)
  const addToCart = useCartStore((state) => state.addToCart)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const dismissToast = useCartStore((state) => state.dismissToast)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    toastMessage,
    toastId,
    dismissToast,
  }
}
