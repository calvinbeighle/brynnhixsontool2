import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json()

    if (!origin || !destination) {
      return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    console.log("🗺️ Calculating distance between:", origin, "and", destination)

    // Get coordinates for both addresses using Google Places API
    const originCoords = await getCoordinatesFromAddress(origin, apiKey)
    const destinationCoords = await getCoordinatesFromAddress(destination, apiKey)

    if (!originCoords || !destinationCoords) {
      throw new Error("Could not geocode one or both addresses")
    }

    // Calculate distance using Haversine formula
    const distance = calculateHaversineDistance(
      originCoords.lat,
      originCoords.lng,
      destinationCoords.lat,
      destinationCoords.lng,
    )

    console.log("✅ Distance calculated:", distance, "miles")

    return NextResponse.json({
      distance: {
        text: `${distance} mi`,
        value: distance * 1609.34, // Convert miles to meters for consistency
      },
      duration: {
        text: `${Math.round((distance / 60) * 60)} min`, // Rough estimate at 60 mph
        value: Math.round((distance / 60) * 3600), // Convert to seconds
      },
      origin: origin,
      destination: destination,
    })
  } catch (error) {
    console.error("Distance calculation error:", error)
    return NextResponse.json(
      { error: "Failed to calculate distance. Please enter distance manually." },
      { status: 500 },
    )
  }
}

async function getCoordinatesFromAddress(address: string, apiKey: string) {
  try {
    const searchPayload = {
      textQuery: address,
      maxResultCount: 1,
      languageCode: "en",
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.location",
      },
      body: JSON.stringify(searchPayload),
    })

    if (!response.ok) {
      console.error("Places API error:", response.status, await response.text())
      return null
    }

    const data = await response.json()

    if (data.places && data.places.length > 0 && data.places[0].location) {
      const location = data.places[0].location
      return {
        lat: location.latitude,
        lng: location.longitude,
      }
    }

    return null
  } catch (error) {
    console.error("Geocoding error:", error)
    return null
  }
}

function calculateHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance)
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}
