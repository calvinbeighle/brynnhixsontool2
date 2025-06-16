import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { action, payload, placeId } = await request.json()

    console.log("Google Places New API called with action:", action)

    // Get API key from server environment variables
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("Google Maps API key not found")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    let url: string
    let requestBody: any
    let headers: Record<string, string>

    if (action === "searchText") {
      // New Places API - Text Search
      url = `https://places.googleapis.com/v1/places:searchText`
      requestBody = payload
      headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.businessStatus,places.types,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri",
      }
    } else if (action === "getDetails") {
      // New Places API - Place Details
      url = `https://places.googleapis.com/v1/places/${placeId}`
      requestBody = null
      headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,businessStatus,types,rating,userRatingCount,nationalPhoneNumber,websiteUri",
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const fetchOptions: RequestInit = {
      method: requestBody ? "POST" : "GET",
      headers,
    }

    if (requestBody) {
      fetchOptions.body = JSON.stringify(requestBody)
    }

    console.log("Making request to:", url.replace(apiKey, "API_KEY_HIDDEN"))

    const response = await fetch(url, fetchOptions)

    console.log("Google Places New API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google Places New API error:", response.status, errorText)

      let errorMessage = `HTTP error! status: ${response.status}`

      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          errorMessage = errorData.error.message
        }
      } catch (e) {
        errorMessage = errorText || response.statusText
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = await response.json()
    console.log("Google Places New API success, places found:", data.places?.length || 0)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Google Places New API proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch data from Google Places API" }, { status: 500 })
  }
}
