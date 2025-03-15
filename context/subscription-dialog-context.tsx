"use client"

import React, { createContext, useContext, useState } from "react"

interface SubscriptionDialogContextType {
  isAddDialogOpen: boolean
  openAddDialog: () => void
  closeAddDialog: () => void
}

const SubscriptionDialogContext = createContext<SubscriptionDialogContextType | undefined>(undefined)

export function SubscriptionDialogProvider({ children }: { children: React.ReactNode }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const openAddDialog = () => setIsAddDialogOpen(true)
  const closeAddDialog = () => setIsAddDialogOpen(false)

  return (
    <SubscriptionDialogContext.Provider value={{ isAddDialogOpen, openAddDialog, closeAddDialog }}>
      {children}
    </SubscriptionDialogContext.Provider>
  )
}

export function useSubscriptionDialog() {
  const context = useContext(SubscriptionDialogContext)
  if (context === undefined) {
    throw new Error("useSubscriptionDialog must be used within a SubscriptionDialogProvider")
  }
  return context
} 