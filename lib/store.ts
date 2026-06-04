"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Subscriber } from "@/types"

interface StoreState {
  subscribers: Subscriber[]
  addSubscriber: (email: string, source: "free_download" | "newsletter", templateId?: string) => void
  hasSubscriber: (email: string) => boolean
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      subscribers: [],
      addSubscriber: (email, source, templateId) => {
        const normalizedEmail = email.toLowerCase().trim()
        if (get().hasSubscriber(normalizedEmail)) return

        const subscriber: Subscriber = {
          id: crypto.randomUUID(),
          email: normalizedEmail,
          source,
          templateId,
          createdAt: new Date(),
        }
        set((state) => ({
          subscribers: [...state.subscribers, subscriber],
        }))
      },
      hasSubscriber: (email) => {
        return get().subscribers.some((s) => s.email === email.toLowerCase().trim())
      },
    }),
    {
      name: "devcraft-store",
    }
  )
)
