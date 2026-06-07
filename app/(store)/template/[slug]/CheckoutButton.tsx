"use client"

import { useState } from "react"
import { CheckoutModal } from "@/components/store/CheckoutModal"
import { Template } from "@/db/schema"





type CheckoutButtonTemplate = {
  id: string;
  title: string;
  slug: string;
  priceUsd: number;
  priceKes: number;
  isFree: boolean;
  thumbnailUrl: string;
};

interface CheckoutButtonProps {
  template: Template
}

export function CheckoutButton({ template }: CheckoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false)


  // Explicitly fallback if the database value comes back undefined
const isFree = Number(template.priceUsd) === 0 && Number(template.priceKes) === 0

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="block w-full rounded-lg bg-indigo-600 py-3 text-center text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        {isFree ? "Download Free" : "Get License"}
      </button>
      {isOpen && (
        <CheckoutModal
          // We cast or pass defaults to satisfy CheckoutModal's strict Template definition
          template={{
            ...template,
            isFree: isFree,
            thumbnailUrl: "",
            // If priceUsd/priceKes are stored as strings in DB, parse them cleanly to numbers
            priceUsd: Number(template.priceUsd),
            priceKes: Number(template.priceKes)
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}