"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Phone, MapPin } from "lucide-react"

interface SuggestionDropdownProps {
  type: "address" | "phone"
  suggestions: string[]
  onSelect: (value: string) => void
  className?: string
}

export default function SuggestionDropdown({ type, suggestions, onSelect, className }: SuggestionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!suggestions || suggestions.length === 0) {
    return null
  }

  const icon = type === "address" ? <MapPin className="h-3 w-3" /> : <Phone className="h-3 w-3" />
  const label = type === "address" ? "View suggested addresses" : "View suggested phone numbers"

  return (
    <div className={`mt-2 ${className}`}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-slate-600 hover:text-slate-800 p-1 h-auto font-light flex items-center gap-1"
      >
        {icon}
        {label}
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      {isOpen && (
        <Card className="p-3 mt-1 border border-slate-200">
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                <span className="text-sm text-gray-900 flex-1 font-light">{suggestion}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onSelect(suggestion)
                    setIsOpen(false)
                  }}
                  className="font-light"
                >
                  Use
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
