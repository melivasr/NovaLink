import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  function addToCart(skill) {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === skill.id)
      if (exists) return prev
      return [...prev, { ...skill, quantity: 1 }]
    })
  }

  function removeFromCart(skillId) {
    setCart((prev) => prev.filter((i) => i.id !== skillId))
  }

  function clearCart() {
    setCart([])
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
