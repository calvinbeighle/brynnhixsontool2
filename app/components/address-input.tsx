"use client"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"
import { createPortal } from "react-dom"

interface AddressInputProps {
  value: string
  onChange: (address: string) => void
  placeholder?: string
  disabled?: boolean
  completed?: boolean
}

interface AddressSuggestion {
  place_id: string
  description: string
  structured_formatting?: {
    main_text: string
    secondary_text: string
  }
}

// Add validation function
const isValidAddress = (address: string): boolean => {
  // Check for minimum components
  const hasStreetNumber = /\d+/.test(address)
  const hasStreetName = /[a-zA-Z]/.test(address)
  const hasCity = /[a-zA-Z]+\s*,\s*[A-Z]{2}/.test(address)
  const hasZipCode = /\d{5}(-\d{4})?/.test(address)

  return hasStreetNumber && hasStreetName && hasCity && hasZipCode
}

export default function AddressInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  completed = false,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)
  const [popupStyle, setPopupStyle] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0})

  // Update validation state when value changes
  useEffect(() => {
    setIsValid(isValidAddress(value))
  }, [value])

  // Update popup position when input is focused or value changes
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setPopupStyle({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [showSuggestions, value])

  const searchAddresses = async (query: string): Promise<AddressSuggestion[]> => {
    if (query.length < 3) return []

    try {
      const response = await fetch(`/api/google-places-autocomplete?input=${encodeURIComponent(query)}`)

      if (!response.ok) return []

      const data = await response.json()
      return data.predictions || []
    } catch (error) {
      return []
    }
  }

  const performSearch = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    const results = await searchAddresses(query)
    setSuggestions(results)
    setShowSuggestions(results.length > 0 && isFocused)
    setIsLoading(false)
  }

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (value.length >= 3 && isFocused) {
      debounceRef.current = setTimeout(() => performSearch(value), 500)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value, isFocused])

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.description)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    setTimeout(() => setShowSuggestions(false), 300)
  }

  const handleInputFocus = () => {
    setIsFocused(true)
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setPopupStyle({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${
            completed && isValid ? "border-emerald-500 bg-emerald-50" : 
            completed && !isValid ? "border-amber-500 bg-amber-50" : ""
          }`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
          ) : (
            <MapPin className={`h-4 w-4 ${isValid ? "text-emerald-500" : "text-gray-400"}`} />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && typeof window !== 'undefined' && createPortal(
        <div
          className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{
            position: 'absolute',
            top: popupStyle.top,
            left: popupStyle.left,
            width: popupStyle.width
          }}
        >
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                {suggestion.structured_formatting ? (
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.structured_formatting.main_text}
                    </div>
                    <div className="text-xs text-gray-500">{suggestion.structured_formatting.secondary_text}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-900">{suggestion.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
