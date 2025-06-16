"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Phone } from "lucide-react"

interface FieldSuggestionsProps {
  type: "address" | "phone"
  suggestions: string[]
  onSelect: (value: string) => void
  onDismiss: () => void
  className?: string
}

export default function FieldSuggestions({ type, suggestions, onSelect, onDismiss, className }: FieldSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null
  }

  const icon = type === "address" ? <MapPin className="h-3 w-3" /> : <Phone className="h-3 w-3" />
  const label = type === "address" ? "Suggested addresses:" : "Suggested phone numbers:"

  const handleSelect = (suggestion: string) => {
    onSelect(suggestion)
    // Don't call onDismiss here - let parent handle it
  }

  return (
    <Card className={`p-3 mt-2 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={onDismiss} className="text-xs">
          Dismiss
        </Button>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
            <span className="text-sm text-gray-900 flex-1">{suggestion}</span>
            <Button size="sm" variant="outline" onClick={() => handleSelect(suggestion)}>
              Use
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
