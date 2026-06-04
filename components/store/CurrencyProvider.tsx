"use client"

import { createContext, useContext, ReactNode } from "react"

interface CurrencyContextType {
  isKenyan: boolean
}

const CurrencyContext = createContext<CurrencyContextType>({ isKenyan: false })

export function CurrencyProvider({ 
  children, 
  isKenyan 
}: { 
  children: ReactNode
  isKenyan: boolean 
}) {
  return (
    <CurrencyContext.Provider value={{ isKenyan }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}