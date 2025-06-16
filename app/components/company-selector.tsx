"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Check } from "lucide-react"

interface CompanySelectorProps {
  companyName: string
  onCompanySelect: (company: CompanyInfo) => void
  className?: string
}

interface CompanyInfo {
  name: string
  address: string
  phone?: string
  placeId?: string
}

export default function CompanySelector({ companyName, onCompanySelect, className }: CompanySelectorProps) {
  const [suggestions, setSuggestions] = useState<CompanyInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)

  useEffect(() => {
    if (companyName.length >= 3) {
      setShowSuggestions(true)
      searchCompanies(companyName)
    } else {
      setSuggestions([])
      setError(null)
      setShowSuggestions(false)
    }
  }, [companyName])

  const searchCompanies = async (company: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const results = await searchWithNewGooglePlacesAPI(company)
      setSuggestions(results)
    } catch (err: any) {
      console.error("Company search error:", err)
      setError("Unable to search for companies. You can still enter details manually.")
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const searchWithNewGooglePlacesAPI = async (companyName: string): Promise<CompanyInfo[]> => {
    try {
      const searchPayload = {
        textQuery: companyName,
        maxResultCount: 5,
        locationBias: {
          rectangle: {
            low: { latitude: 24.396308, longitude: -125.0 },
            high: { latitude: 49.384358, longitude: -66.93457 },
          },
        },
        languageCode: "en",
      }

      console.log("🏢 Searching for companies with New Places API:", companyName)

      const searchResponse = await fetch("/api/google-places-new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "searchText",
          payload: searchPayload,
        }),
      })

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json()
        console.error("❌ Company search API error:", errorData)
        throw new Error(errorData.error || "Search failed")
      }

      const searchData = await searchResponse.json()
      console.log("✅ Company search results:", searchData.places?.length || 0)

      if (!searchData.places || searchData.places.length === 0) {
        return []
      }

      const results: CompanyInfo[] = []

      for (const place of searchData.places) {
        const placeName = place.displayName?.text || ""
        const businessTypes = place.types || []

        // Filter for business-like results
        const isLikelyBusiness = businessTypes.some((type: string) =>
          [
            "point_of_interest",
            "establishment",
            "store",
            "restaurant",
            "food",
            "finance",
            "health",
            "lodging",
            "shopping_mall",
            "gas_station",
            "car_dealer",
            "bank",
            "hospital",
            "pharmacy",
            "real_estate_agency",
            "insurance_agency",
            "lawyer",
            "accounting",
            "dentist",
            "doctor",
            "veterinary_care",
          ].includes(type),
        )

        if (businessTypes.length > 0 && !isLikelyBusiness) {
          continue
        }

        results.push({
          name: placeName || companyName,
          address: place.formattedAddress || "",
          phone: place.nationalPhoneNumber,
          placeId: place.id,
        })
      }

      return results.slice(0, 4)
    } catch (error: any) {
      console.error("🔥 New Places API company search error:", error)
      throw new Error("Failed to search for companies using New Places API")
    }
  }

  const handleCompanySelect = (company: CompanyInfo) => {
    onCompanySelect(company)
    setShowSuggestions(false)
  }

  if (!companyName || companyName.length < 3) {
    return null
  }

  return (
    <div className={className}>
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-600" />
          Searching for companies using New Places API...
        </div>
      )}

      {error && (
        <div className="text-sm text-amber-600 mb-2 p-2 bg-amber-50 rounded border border-amber-200">{error}</div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <Card className="p-3 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Building className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Select company (New Places API):</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((company, index) => (
              <div
                key={company.placeId || index}
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleCompanySelect(company)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">{company.name}</div>
                    <div className="text-xs text-gray-600">{company.address}</div>
                    {company.phone && <div className="text-xs text-gray-600">📞 {company.phone}</div>}
                  </div>
                  <Button size="sm" variant="ghost" className="ml-2">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!isLoading && !error && showSuggestions && suggestions.length === 0 && companyName.length >= 3 && (
        <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded border">
          No companies found for "{companyName}" using New Places API. You can continue entering details manually.
        </div>
      )}
    </div>
  )
}
