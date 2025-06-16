"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Phone } from "lucide-react"

interface CompanyAddressPredictorProps {
  companyName: string
  onAddressSelect: (address: string) => void
  onPhoneSelect: (phone: string) => void
  className?: string
}

interface CompanyPrediction {
  name: string
  address: string
  phone?: string
  placeId?: string
}

export default function CompanyAddressPredictor({
  companyName,
  onAddressSelect,
  onPhoneSelect,
  className,
}: CompanyAddressPredictorProps) {
  const [predictions, setPredictions] = useState<CompanyPrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPredictions, setShowPredictions] = useState(true)

  useEffect(() => {
    if (companyName.length >= 3) {
      setShowPredictions(true)
      searchCompanyAddresses(companyName)
    } else {
      setPredictions([])
      setError(null)
      setShowPredictions(false)
    }
  }, [companyName])

  const searchCompanyAddresses = async (company: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const results = await searchWithNewGooglePlacesAPI(company)
      setPredictions(results)
    } catch (err: any) {
      console.error("Company search error:", err)
      setError("Unable to search for company information. Please enter details manually.")
      setPredictions([])
    } finally {
      setIsLoading(false)
    }
  }

  const searchWithNewGooglePlacesAPI = async (companyName: string): Promise<CompanyPrediction[]> => {
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
        throw new Error(errorData.error || "Search failed")
      }

      const searchData = await searchResponse.json()

      if (!searchData.places || searchData.places.length === 0) {
        return []
      }

      const results: CompanyPrediction[] = []

      for (const place of searchData.places) {
        const placeName = place.displayName?.text || ""
        const businessTypes = place.types || []

        // Filter for business-like results
        const isLikelyBusiness = businessTypes.some((type: string) =>
          [
            "point_of_interest",
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

      return results.slice(0, 4) // Limit to top 4 results
    } catch (error: any) {
      console.error("Google Places API error:", error)
      throw new Error("Failed to search for companies")
    }
  }

  if (!companyName || companyName.length < 3) {
    return null
  }

  return (
    <div className={className}>
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-600" />
          Searching for "{companyName}"...
        </div>
      )}

      {error && (
        <div className="text-sm text-amber-600 mb-2 p-2 bg-amber-50 rounded border border-amber-200">{error}</div>
      )}

      {showPredictions && predictions.length > 0 && (
        <Card className="p-3 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Building className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Found company locations:</span>
          </div>
          <div className="space-y-3">
            {predictions.map((prediction, index) => (
              <div key={prediction.placeId || index} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900 mb-1">{prediction.name}</div>
                  <div className="text-sm text-gray-700 mb-2">{prediction.address}</div>
                  {prediction.phone && <div className="text-sm text-gray-600 mb-2">📞 {prediction.phone}</div>}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onAddressSelect(prediction.address)
                      setShowPredictions(false)
                    }}
                    className="flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    Use Address
                  </Button>
                  {prediction.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onPhoneSelect(prediction.phone!)
                        setShowPredictions(false)
                      }}
                      className="flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      Use Phone
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!isLoading && !error && showPredictions && predictions.length === 0 && companyName.length >= 3 && (
        <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded border">
          No company listings found for "{companyName}". Please enter details manually below.
        </div>
      )}
    </div>
  )
}
