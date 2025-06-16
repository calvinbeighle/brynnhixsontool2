import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get("input")
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!input || !apiKey) {
    return NextResponse.json({ error: "Missing input or API key" }, { status: 400 })
  }

  try {
    const url = `https://places.googleapis.com/v1/places:autocomplete`

    const requestBody = {
      input: input,
      includedPrimaryTypes: ["street_address", "postal_code"],
      includedRegionCodes: ["us"],
      languageCode: "en",
    }

    console.log("🔍 New Places API Autocomplete request:", input)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("📡 New Places API Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ New Places API Error:", errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log("✅ New Places API Response:", data)

    // Get place details for each suggestion to ensure we have complete addresses with zip codes
    const predictions = []

    if (data.suggestions && data.suggestions.length > 0) {
      for (const suggestion of data.suggestions.slice(0, 5)) {
        if (suggestion.placePrediction) {
          try {
            // Get place details to get the complete formatted address with zip code
            const detailsUrl = `https://places.googleapis.com/v1/places/${suggestion.placePrediction.placeId}`

            const detailsResponse = await fetch(detailsUrl, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "formattedAddress,addressComponents",
              },
            })

            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json()

              let fullAddress = suggestion.placePrediction.text.text

              // Use formatted address if available (should include zip code)
              if (detailsData.formattedAddress) {
                fullAddress = detailsData.formattedAddress.replace(/, USA$/, "").replace(/, United States$/, "")
              }

              predictions.push({
                place_id: suggestion.placePrediction.placeId,
                description: fullAddress,
                structured_formatting: {
                  main_text: fullAddress.split(",")[0] || fullAddress,
                  secondary_text: fullAddress.split(",").slice(1).join(",").trim() || "",
                },
              })
            } else {
              // Fallback to original text if details fail
              const originalText = suggestion.placePrediction.text.text
              predictions.push({
                place_id: suggestion.placePrediction.placeId,
                description: originalText,
                structured_formatting: {
                  main_text: originalText.split(",")[0] || originalText,
                  secondary_text: originalText.split(",").slice(1).join(",").trim() || "",
                },
              })
            }
          } catch (error) {
            console.error("Error getting place details:", error)
            // Fallback to original text
            const originalText = suggestion.placePrediction.text.text
            predictions.push({
              place_id: suggestion.placePrediction.placeId,
              description: originalText,
              structured_formatting: {
                main_text: originalText.split(",")[0] || originalText,
                secondary_text: originalText.split(",").slice(1).join(",").trim() || "",
              },
            })
          }
        }
      }
    }

    console.log("📍 Final predictions with zip codes:", predictions.length)

    return NextResponse.json({ status: "OK", predictions })
  } catch (error) {
    console.error("🔥 New Places API Error:", error)
    return NextResponse.json({ error: "API request failed" }, { status: 500 })
  }
}
