"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Car, Plane, UtensilsCrossed, Hotel, MapPin, Wrench, Truck, ExternalLink, AlertCircle } from "lucide-react"
import type { ReimbursableData } from "../types/proposal"
import AddressInput from "./address-input"
import AirportSelector from "./airport-selector"
import { Separator } from "@/components/ui/separator"

interface Airport {
  code: string
  name: string
  city: string
  state: string
  address: string
}

interface ReimbursablesCalculatorProps {
  data: ReimbursableData
  onChange: (data: ReimbursableData) => void
  projectAddress?: string
  isReimbursablesNeeded: boolean
  onReimbursablesNeededChange: (needed: boolean) => void
}

// Distance lookup table for common locations from Alabaster, AL
const DISTANCE_LOOKUP = {
  // Alabama Cities
  birmingham: 25,
  hoover: 20,
  vestavia: 22,
  "mountain brook": 28,
  homewood: 25,
  tuscaloosa: 60,
  huntsville: 120,
  madison: 125,
  decatur: 110,
  florence: 140,
  mobile: 180,
  montgomery: 90,
  auburn: 85,
  opelika: 90,
  dothan: 140,
  gadsden: 75,
  anniston: 70,
  cullman: 65,
  jasper: 45,
  "gulf shores": 190,
  "orange beach": 195,
  "phenix city": 95,
  enterprise: 135,
  troy: 110,
  selma: 75,
  andalusia: 125,
  "fort payne": 100,
  scottsboro: 130,
  arab: 115,
  guntersville: 105,

  // Georgia
  atlanta: 150,
  columbus: 120,
  macon: 180,
  savannah: 280,
  augusta: 200,
  albany: 220,
  valdosta: 250,
  "warner robins": 190,
  roswell: 160,
  "sandy springs": 155,
  "johns creek": 165,
  alpharetta: 170,
  marietta: 145,
  smyrna: 140,
  dunwoody: 160,

  // Tennessee
  nashville: 200,
  memphis: 220,
  knoxville: 240,
  chattanooga: 120,
  clarksville: 230,
  murfreesboro: 210,
  franklin: 205,
  jackson: 200,
  "johnson city": 280,
  bartlett: 225,
  hendersonville: 205,
  kingsport: 290,
  collierville: 230,
  cleveland: 130,

  // Mississippi
  jackson: 160,
  gulfport: 170,
  biloxi: 175,
  hattiesburg: 140,
  meridian: 90,
  tupelo: 120,
  greenville: 180,
  vicksburg: 150,
  natchez: 170,
  columbus: 110,
  starkville: 100,
  oxford: 140,

  // Florida
  pensacola: 160,
  tallahassee: 200,
  "panama city": 180,
  jacksonville: 320,
  gainesville: 280,
  orlando: 380,
  tampa: 350,
  miami: 520,
  "fort lauderdale": 500,
  "west palm beach": 480,
  naples: 420,
  "fort myers": 400,
  sarasota: 360,
  clearwater: 340,
  "st. petersburg": 345,

  // Louisiana
  "new orleans": 200,
  "baton rouge": 180,
  shreveport: 280,
  lafayette: 220,
  "lake charles": 250,
  monroe: 240,
  alexandria: 220,

  // South Carolina
  charleston: 320,
  columbia: 280,
  greenville: 220,
  "rock hill": 240,
  "mount pleasant": 325,
  spartanburg: 210,

  // North Carolina
  charlotte: 260,
  raleigh: 380,
  greensboro: 340,
  durham: 385,
  "winston-salem": 320,
  fayetteville: 420,
  cary: 380,
  "high point": 335,
  concord: 265,
  gastonia: 250,

  // Kentucky
  louisville: 280,
  lexington: 320,
  "bowling green": 200,
  owensboro: 240,
  covington: 350,
  hopkinsville: 220,

  // Arkansas
  "little rock": 320,
  "fort smith": 380,
  fayetteville: 400,
  springdale: 410,
  jonesboro: 280,
  "pine bluff": 300,

  // Texas (Eastern)
  houston: 420,
  dallas: 480,
  austin: 520,
  "san antonio": 580,
  beaumont: 380,
  tyler: 450,
  longview: 420,
  texarkana: 360,
}

export default function ReimbursablesCalculator({
  data,
  onChange,
  projectAddress,
  isReimbursablesNeeded,
  onReimbursablesNeededChange,
}: ReimbursablesCalculatorProps) {
  const [calculations, setCalculations] = useState({
    mileageTotal: 0,
    mealsTotal: 0,
    hotelTotal: 0,
    equipmentTotal: 0,
    shippingTotal: 0,
    grandTotal: 0,
  })

  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null)
  const [matchedLocation, setMatchedLocation] = useState<string>("")
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)
  const [calculatedMileage, setCalculatedMileage] = useState<{
    airportToHotel: number
    hotelToProject: number
    totalLocal: number
  } | null>(null)
  const [isCalculatingMileage, setIsCalculatingMileage] = useState(false)
  const [mileageCalculationError, setMileageCalculationError] = useState<string | null>(null)
  const [googleFlightsUrl, setGoogleFlightsUrl] = useState<string>("")

  // Hixson Consultants office address
  const hixsonAddress = "947 1st Avenue West, Alabaster, Alabama 35007"
  const originAirport = "BHM" // Birmingham airport (closest to Alabaster, AL)

  useEffect(() => {
    // Calculate mileage
    let mileageTotal = 0
    if (data.mileage.isFlying) {
      // Flight cost divided by 0.9
      const flightCost = (data.mileage.flightCost || 0) / 0.9

      // Local mileage calculation with multipliers
      const airportToHotel = (data.mileage.airportToHotel || 0) * (data.mileage.airportToHotelMultiplier || 1)
      const hotelToProject = (data.mileage.hotelToProject || 0) * (data.mileage.hotelToProjectMultiplier || 1)
      const totalLocalMiles = airportToHotel + hotelToProject
      const localMileageCost = (totalLocalMiles * 0.7) / 0.9

      mileageTotal = flightCost + localMileageCost
    } else {
      const roundTripMiles = (data.mileage.miles || 0) * 2
      mileageTotal = (roundTripMiles * 0.7) / 0.9
    }

    // Calculate meals
    const mealsTotal = (data.meals.count || 0) * 25

    // Calculate hotel
    const hotelTotal = (data.hotel.cost || 0) / 0.9

    // Calculate equipment
    const equipmentTotal = (data.equipment.cost || 0) / 0.9

    // Calculate shipping
    const shippingTotal = (data.shipping.cost || 0) / 0.9

    // Calculate grand total
    const grandTotal = mileageTotal + mealsTotal + hotelTotal + equipmentTotal + shippingTotal

    setCalculations({
      mileageTotal,
      mealsTotal,
      hotelTotal,
      equipmentTotal,
      shippingTotal,
      grandTotal,
    })
  }, [data])

  useEffect(() => {
    // Auto-estimate distance when project address changes
    if (projectAddress && projectAddress.trim().length > 10) {
      if (data.mileage.isFlying) {
        generateGoogleFlightsUrl()
      } else {
        estimateDistanceFromAddress(projectAddress)
      }
    } else {
      setEstimatedDistance(null)
      setMatchedLocation("")
      setGoogleFlightsUrl("")
      setCalculatedMileage(null)
    }
  }, [projectAddress, data.mileage.isFlying, data.mileage.selectedAirport])

  // Calculate mileage when airport, hotel address, or project address changes in flying mode
  useEffect(() => {
    if (data.mileage.isFlying && data.mileage.selectedAirport && data.mileage.hotelAddress && projectAddress) {
      // Add validation to ensure we have complete addresses
      const hasCompleteHotelAddress = data.mileage.hotelAddress.split(',').length >= 3; // Should have street, city, state
      const hasCompleteProjectAddress = projectAddress.split(',').length >= 3;
      
      if (hasCompleteHotelAddress && hasCompleteProjectAddress) {
        // Add debounce to prevent rapid calculations while typing
        const timeoutId = setTimeout(() => {
          calculateFlightMileage();
        }, 1000); // Wait 1 second after last change
        
        return () => clearTimeout(timeoutId);
      }
    } else {
      setCalculatedMileage(null);
      setMileageCalculationError(null);
    }
  }, [data.mileage.selectedAirport, data.mileage.hotelAddress, projectAddress, data.mileage.isFlying]);

  const generateGoogleFlightsUrl = () => {
    if (!data.mileage.selectedAirport) return

    const today = new Date()
    const departDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
    const returnDate = new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000) // 1 day later

    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0]
    }

    const url = `https://www.google.com/travel/flights?q=Flights%20from%20${originAirport}%20to%20${data.mileage.selectedAirport.code}%20on%20${formatDate(departDate)}%20through%20${formatDate(returnDate)}`
    setGoogleFlightsUrl(url)
  }

  const calculateFlightMileage = async () => {
    if (!data.mileage.selectedAirport || !data.mileage.hotelAddress || !projectAddress || !data.mileage.isFlying) {
      setCalculatedMileage(null);
      setMileageCalculationError(null);
      return;
    }

    // Add validation to ensure we have complete addresses
    const hasCompleteHotelAddress = data.mileage.hotelAddress.split(',').length >= 3;
    const hasCompleteProjectAddress = projectAddress.split(',').length >= 3;
    
    if (!hasCompleteHotelAddress || !hasCompleteProjectAddress) {
      setCalculatedMileage(null);
      setMileageCalculationError("Please enter complete addresses with city and state");
      return;
    }

    setIsCalculatingMileage(true);
    setMileageCalculationError(null);

    try {
      console.log("🧮 Starting distance calculations...");

      // Calculate airport to hotel distance
      const airportToHotelDistance = await calculateDistanceBetweenAddresses(
        data.mileage.selectedAirport.address,
        data.mileage.hotelAddress,
      )

      // Calculate hotel to project distance
      const hotelToProjectDistance = await calculateDistanceBetweenAddresses(data.mileage.hotelAddress, projectAddress)

      if (airportToHotelDistance && hotelToProjectDistance) {
        const totalLocal = airportToHotelDistance + hotelToProjectDistance
        setCalculatedMileage({
          airportToHotel: airportToHotelDistance,
          hotelToProject: hotelToProjectDistance,
          totalLocal,
        })
        console.log("✅ Distance calculations completed successfully")
      } else {
        setCalculatedMileage(null)
        setMileageCalculationError("Could not calculate one or both distances. Please enter manually.")
      }
    } catch (error) {
      console.error("Mileage calculation error:", error)
      setCalculatedMileage(null)
      setMileageCalculationError("Distance calculation failed. Please enter distances manually.")
    } finally {
      setIsCalculatingMileage(false)
    }
  }

  const calculateDistanceBetweenAddresses = async (origin: string, destination: string): Promise<number | null> => {
    try {
      console.log("📍 Calculating distance from:", origin, "to:", destination)

      const response = await fetch("/api/calculate-distance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ origin, destination }),
      })

      if (response.ok) {
        const data = await response.json()
        // Convert meters to miles and round
        const miles = Math.round(data.distance.value * 0.000621371)
        console.log("✅ Distance calculated:", miles, "miles")
        return miles
      } else {
        const errorData = await response.json()
        console.error("❌ Distance API error:", errorData)
        throw new Error(errorData.error || "Distance calculation failed")
      }
    } catch (error) {
      console.error("❌ Distance calculation error:", error)
      throw error
    }
  }

  const estimateDistanceFromAddress = async (address: string) => {
    if (!address || address.trim().length < 10) {
      setEstimatedDistance(null)
      setMatchedLocation("")
      return
    }

    setIsCalculatingDistance(true)

    try {
      // Calculate driving distance using Google Maps Distance Matrix API
      const distance = await calculateDistanceBetweenAddresses(hixsonAddress, address)
      
      if (distance) {
        setEstimatedDistance(distance)
        setMatchedLocation("Calculated from driving distance")
      } else {
        // Fallback to text-based matching
        const result = estimateDistanceFromAddressText(address)
        if (result) {
          setEstimatedDistance(result.miles)
          setMatchedLocation(result.location)
        } else {
          setEstimatedDistance(null)
          setMatchedLocation("")
        }
      }
    } catch (error) {
      console.error("Distance estimation error:", error)
      // Fallback to text-based matching
      const result = estimateDistanceFromAddressText(address)
      if (result) {
        setEstimatedDistance(result.miles)
        setMatchedLocation(result.location)
      } else {
        setEstimatedDistance(null)
        setMatchedLocation("")
      }
    } finally {
      setIsCalculatingDistance(false)
    }
  }

  const estimateDistanceFromAddressText = (address: string): { miles: number; location: string } | null => {
    if (!address) return null

    const addressLower = address.toLowerCase()

    // Direct city matches
    for (const [city, miles] of Object.entries(DISTANCE_LOOKUP)) {
      if (addressLower.includes(city)) {
        return { miles, location: city.charAt(0).toUpperCase() + city.slice(1) }
      }
    }

    // State-based estimates for unknown cities
    if (addressLower.includes("alabama") || addressLower.includes(" al ") || addressLower.includes(", al")) {
      return { miles: 75, location: "Alabama (estimated)" }
    }
    if (addressLower.includes("georgia") || addressLower.includes(" ga ") || addressLower.includes(", ga")) {
      return { miles: 180, location: "Georgia (estimated)" }
    }
    if (addressLower.includes("tennessee") || addressLower.includes(" tn ") || addressLower.includes(", tn")) {
      return { miles: 200, location: "Tennessee (estimated)" }
    }
    if (addressLower.includes("mississippi") || addressLower.includes(" ms ") || addressLower.includes(", ms")) {
      return { miles: 140, location: "Mississippi (estimated)" }
    }
    if (addressLower.includes("florida") || addressLower.includes(" fl ") || addressLower.includes(", fl")) {
      return { miles: 300, location: "Florida (estimated)" }
    }
    if (addressLower.includes("louisiana") || addressLower.includes(" la ") || addressLower.includes(", la")) {
      return { miles: 220, location: "Louisiana (estimated)" }
    }
    if (addressLower.includes("south carolina") || addressLower.includes(" sc ") || addressLower.includes(", sc")) {
      return { miles: 280, location: "South Carolina (estimated)" }
    }
    if (addressLower.includes("north carolina") || addressLower.includes(" nc ") || addressLower.includes(", nc")) {
      return { miles: 320, location: "North Carolina (estimated)" }
    }
    if (addressLower.includes("kentucky") || addressLower.includes(" ky ") || addressLower.includes(", ky")) {
      return { miles: 280, location: "Kentucky (estimated)" }
    }
    if (addressLower.includes("arkansas") || addressLower.includes(" ar ") || addressLower.includes(", ar")) {
      return { miles: 350, location: "Arkansas (estimated)" }
    }
    if (addressLower.includes("texas") || addressLower.includes(" tx ") || addressLower.includes(", tx")) {
      return { miles: 450, location: "Texas (estimated)" }
    }

    return null
  }

  const updateMileage = (field: keyof typeof data.mileage, value: any) => {
    onChange({
      ...data,
      mileage: { ...data.mileage, [field]: value },
    })
  }

  const updateMeals = (field: keyof typeof data.meals, value: any) => {
    onChange({
      ...data,
      meals: { ...data.meals, [field]: value },
    })
  }

  const updateHotel = (field: keyof typeof data.hotel, value: any) => {
    onChange({
      ...data,
      hotel: { ...data.hotel, [field]: value },
    })
  }

  const updateEquipment = (field: keyof typeof data.equipment, value: any) => {
    onChange({
      ...data,
      equipment: { ...data.equipment, [field]: value },
    })
  }

  const updateShipping = (field: keyof typeof data.shipping, value: any) => {
    onChange({
      ...data,
      shipping: { ...data.shipping, [field]: value },
    })
  }

  const useEstimatedDistance = () => {
    if (estimatedDistance) {
      updateMileage("miles", estimatedDistance)
    }
  }

  const useCalculatedMileage = () => {
    if (calculatedMileage) {
      // Update both fields in a single state update to ensure consistency
      onChange({
        ...data,
        mileage: {
          ...data.mileage,
          airportToHotel: calculatedMileage.airportToHotel,
          hotelToProject: calculatedMileage.hotelToProject,
        },
      })
    }
  }

  return (
    <div className="space-y-6 font-light">
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-normal text-slate-900">
                Travel & Expense Calculator
              </Label>
              <p className="text-sm text-slate-500 font-light">
                Reimbursables are included in Hourly, Hourly Not-to-Exceed, and Cost of Services proposals.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="reimbursables-toggle"
                checked={isReimbursablesNeeded}
                onCheckedChange={onReimbursablesNeededChange}
              />
              <Label htmlFor="reimbursables-toggle" className="font-light text-slate-700">
                Enable Reimbursables
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {isReimbursablesNeeded && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Travel, Hotel, Meals */}
            <div className="space-y-6">
              <h4 className="text-base font-normal text-slate-800 border-b border-slate-200 pb-2">
                Travel & Accommodation
              </h4>

              {/* Mileage/Travel Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-normal flex items-center gap-2 text-slate-900">
                    {data.mileage.isFlying ? (
                      <Plane className="w-4 h-4 text-slate-600" strokeWidth={1} />
                    ) : (
                      <Car className="w-4 h-4 text-slate-600" strokeWidth={1} />
                    )}
                    Travel Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* All existing travel content */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="flying-mode"
                      checked={data.mileage.isFlying}
                      onCheckedChange={(checked) => updateMileage("isFlying", checked)}
                    />
                    <Label htmlFor="flying-mode" className="font-light text-slate-700">
                      Flying instead of driving
                    </Label>
                  </div>

                  {/* Keep all existing travel logic exactly as is */}
                  {data.mileage.isFlying ? (
                    <div className="space-y-4">
                      {/* All existing flight content */}
                      <div className="grid gap-2">
                        <Label className="text-slate-700 font-light">Destination Airport</Label>
                        <AirportSelector
                          selectedAirport={data.mileage.selectedAirport}
                          onAirportSelect={(airport) => updateMileage("selectedAirport", airport)}
                        />
                      </div>

                      {googleFlightsUrl && data.mileage.selectedAirport && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(googleFlightsUrl, "_blank")}
                            className="w-full flex items-center gap-2 text-green-700 border-green-300 hover:bg-green-100"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Search Google Flights: BHM → {data.mileage.selectedAirport.code}
                          </Button>
                        </div>
                      )}

                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="flight-cost" className="text-slate-700 font-light">
                            Flight Cost ($)
                          </Label>
                          <Input
                            id="flight-cost"
                            type="text"
                            inputMode="decimal"
                            value={data.mileage.flightCost || ""}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                updateMileage("flightCost", value === "" ? 0 : Number.parseFloat(value))
                              }
                            }}
                            placeholder="Enter flight cost"
                            className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                              data.mileage.flightCost && data.mileage.flightCost > 0
                                ? "border-emerald-500 bg-emerald-50"
                                : ""
                            }`}
                          />
                          <p className="text-xs text-slate-500 font-light">Formula: Flight cost ÷ 0.9</p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="hotel-address" className="text-slate-700 font-light">
                            Hotel Address
                          </Label>
                          <AddressInput
                            value={data.mileage.hotelAddress || ""}
                            onChange={(address) => updateMileage("hotelAddress", address)}
                            placeholder="Enter hotel address"
                          />
                          <p className="text-xs text-slate-500 font-light">
                            Used to calculate airport to hotel and hotel to project distances
                          </p>
                        </div>

                        {/* Keep all existing calculated mileage display logic */}
                        {isCalculatingMileage && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                              <span className="text-sm text-blue-900">Calculating distances...</span>
                            </div>
                          </div>
                        )}

                        {mileageCalculationError && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                              <span className="text-sm text-amber-900">{mileageCalculationError}</span>
                            </div>
                          </div>
                        )}

                        {calculatedMileage && !isCalculatingMileage && !mileageCalculationError && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="space-y-3">
                              <div className="text-sm font-medium text-green-900 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Calculated Distances
                              </div>
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div>
                                    <div className="text-xs text-gray-600">Airport to Hotel</div>
                                    <div className="font-medium">{calculatedMileage.airportToHotel} miles</div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateMileage("airportToHotel", calculatedMileage.airportToHotel)}
                                    className="text-xs"
                                  >
                                    Use
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div>
                                    <div className="text-xs text-gray-600">Hotel to Project</div>
                                    <div className="font-medium">{calculatedMileage.hotelToProject} miles</div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateMileage("hotelToProject", calculatedMileage.hotelToProject)}
                                    className="text-xs"
                                  >
                                    Use
                                  </Button>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-green-200">
                                <Button
                                  size="sm"
                                  onClick={useCalculatedMileage}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  Use Both Distances
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="airport-to-hotel" className="text-slate-700 font-light">
                                Airport to Hotel (miles)
                              </Label>
                              {calculatedMileage &&
                                calculatedMileage.airportToHotel !== (data.mileage.airportToHotel || 0) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => updateMileage("airportToHotel", calculatedMileage.airportToHotel)}
                                    className="text-xs text-green-600 hover:text-green-700"
                                  >
                                    Suggested: {calculatedMileage.airportToHotel}
                                  </Button>
                                )}
                            </div>
                            <Input
                              id="airport-to-hotel"
                              type="text"
                              inputMode="decimal"
                              value={data.mileage.airportToHotel || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                  updateMileage("airportToHotel", value === "" ? 0 : Number.parseFloat(value))
                                }
                              }}
                              placeholder="Enter miles"
                              className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                                data.mileage.airportToHotel && data.mileage.airportToHotel > 0
                                  ? "border-emerald-500 bg-emerald-50"
                                  : ""
                              }`}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="airport-to-hotel-multiplier" className="text-slate-700 font-light">
                              Times Traveled
                            </Label>
                            <Input
                              id="airport-to-hotel-multiplier"
                              type="text"
                              inputMode="decimal"
                              value={data.mileage.airportToHotelMultiplier || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                  updateMileage("airportToHotelMultiplier", value === "" ? 1 : Number.parseFloat(value))
                                }
                              }}
                              placeholder="2"
                              className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                                data.mileage.airportToHotelMultiplier && data.mileage.airportToHotelMultiplier > 0
                                  ? "border-emerald-500 bg-emerald-50"
                                  : ""
                              }`}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="hotel-to-project" className="text-slate-700 font-light">
                                Hotel to Project (miles)
                              </Label>
                              {calculatedMileage &&
                                calculatedMileage.hotelToProject !== (data.mileage.hotelToProject || 0) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => updateMileage("hotelToProject", calculatedMileage.hotelToProject)}
                                    className="text-xs text-green-600 hover:text-green-700"
                                  >
                                    Suggested: {calculatedMileage.hotelToProject}
                                  </Button>
                                )}
                            </div>
                            <Input
                              id="hotel-to-project"
                              type="text"
                              inputMode="decimal"
                              value={data.mileage.hotelToProject || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                  updateMileage("hotelToProject", value === "" ? 0 : Number.parseFloat(value))
                                }
                              }}
                              placeholder="Enter miles"
                              className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                                data.mileage.hotelToProject && data.mileage.hotelToProject > 0
                                  ? "border-emerald-500 bg-emerald-50"
                                  : ""
                              }`}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="hotel-to-project-multiplier" className="text-slate-700 font-light">
                              Times Traveled
                            </Label>
                            <Input
                              id="hotel-to-project-multiplier"
                              type="text"
                              inputMode="decimal"
                              value={data.mileage.hotelToProjectMultiplier || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                  updateMileage("hotelToProjectMultiplier", value === "" ? 1 : Number.parseFloat(value))
                                }
                              }}
                              placeholder="2"
                              className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                                data.mileage.hotelToProjectMultiplier && data.mileage.hotelToProjectMultiplier > 0
                                  ? "border-emerald-500 bg-emerald-50"
                                  : ""
                              }`}
                            />
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 font-light">
                          Local mileage formula: (Airport to Hotel × Times) + (Hotel to Project × Times) × $0.70 ÷ 0.9
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Keep all existing driving content */}
                      {isCalculatingDistance && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                            <span className="text-sm text-blue-900">Calculating distance to project site...</span>
                          </div>
                        </div>
                      )}

                      {estimatedDistance && !isCalculatingDistance && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-green-900 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Distance Estimated: {estimatedDistance} miles
                              </div>
                              <div className="text-xs text-green-700 mt-1">
                                Method: {matchedLocation}
                                <br />
                                From: {hixsonAddress}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={useEstimatedDistance}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Use This Distance
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-2">
                        <Label htmlFor="miles" className="text-slate-700 font-light">
                          Miles (one way)
                        </Label>
                        <Input
                          id="miles"
                          type="text"
                          inputMode="decimal"
                          value={data.mileage.miles || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                              updateMileage("miles", value === "" ? 0 : Number.parseFloat(value))
                            }
                          }}
                          placeholder="Enter miles from office to project"
                          className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                            data.mileage.miles && data.mileage.miles > 0 ? "border-emerald-500 bg-emerald-50" : ""
                          }`}
                        />
                        <p className="text-xs text-slate-500 font-light">
                          Formula: (Miles × 2 × $0.70) ÷ 0.9 | From: {hixsonAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hotel Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-normal flex items-center gap-2 text-slate-900">
                    <Hotel className="w-4 h-4 text-slate-600" strokeWidth={1} />
                    Hotel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Label htmlFor="hotel-cost" className="text-slate-700 font-light">
                      Hotel Cost ($)
                    </Label>
                    <Input
                      id="hotel-cost"
                      type="text"
                      inputMode="decimal"
                      value={data.hotel.cost || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          updateHotel("cost", value === "" ? 0 : Number.parseFloat(value))
                        }
                      }}
                      placeholder="Enter hotel cost"
                      className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                        data.hotel.cost && data.hotel.cost > 0 ? "border-emerald-500 bg-emerald-50" : ""
                      }`}
                    />
                    <p className="text-xs text-slate-500 font-light">Formula: Hotel cost ÷ 0.9</p>
                  </div>
                </CardContent>
              </Card>

              {/* Meals Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-normal flex items-center gap-2 text-slate-900">
                    <UtensilsCrossed className="w-4 h-4 text-slate-600" strokeWidth={1} />
                    Meals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Label htmlFor="meal-count" className="text-slate-700 font-light">
                      Number of Meals
                    </Label>
                    <Input
                      id="meal-count"
                      type="text"
                      inputMode="numeric"
                      value={data.meals.count || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "" || /^\d*$/.test(value)) {
                          updateMeals("count", value === "" ? 0 : Number.parseInt(value))
                        }
                      }}
                      placeholder="Enter number of meals"
                      className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                        data.meals.count && data.meals.count > 0 ? "border-emerald-500 bg-emerald-50" : ""
                      }`}
                    />
                    <p className="text-xs text-slate-500 font-light">Rate: $25 per meal</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Equipment & Shipping */}
            <div className="space-y-6">
              <h4 className="text-base font-normal text-slate-800 border-b border-slate-200 pb-2">
                Equipment & Materials
              </h4>

              {/* Equipment Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-normal flex items-center gap-2 text-slate-900">
                    <Wrench className="w-4 h-4 text-slate-600" strokeWidth={1} />
                    Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Label htmlFor="equipment-cost" className="text-slate-700 font-light">
                      Equipment Cost ($)
                    </Label>
                    <Input
                      id="equipment-cost"
                      type="text"
                      inputMode="decimal"
                      value={data.equipment.cost || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          updateEquipment("cost", value === "" ? 0 : Number.parseFloat(value))
                        }
                      }}
                      placeholder="Enter equipment cost"
                      className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                        data.equipment.cost && data.equipment.cost > 0 ? "border-emerald-500 bg-emerald-50" : ""
                      }`}
                    />
                    <p className="text-xs text-slate-500 font-light">Formula: Equipment cost ÷ 0.9</p>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Card */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-normal flex items-center gap-2 text-slate-900">
                    <Truck className="w-4 h-4 text-slate-600" strokeWidth={1} />
                    Shipping/Transport of Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Label htmlFor="shipping-cost" className="text-slate-700 font-light">
                      Shipping/Transport Cost ($)
                    </Label>
                    <Input
                      id="shipping-cost"
                      type="text"
                      inputMode="decimal"
                      value={data.shipping.cost || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          updateShipping("cost", value === "" ? 0 : Number.parseFloat(value))
                        }
                      }}
                      placeholder="Enter shipping/transport cost"
                      className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                        data.shipping.cost && data.shipping.cost > 0 ? "border-emerald-500 bg-emerald-50" : ""
                      }`}
                    />
                    <p className="text-xs text-slate-500 font-light">Formula: Shipping cost ÷ 0.9</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Total Section - Full Width Below */}
          <div className="mt-8">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-normal text-slate-900">Calculated Reimbursables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Travel:</span>
                    <span className="font-mono">${calculations.mileageTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Meals:</span>
                    <span className="font-mono">${calculations.mealsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Hotel:</span>
                    <span className="font-mono">${calculations.hotelTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Equipment:</span>
                    <span className="font-mono">${calculations.equipmentTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Shipping/Transport:</span>
                    <span className="font-mono">${calculations.shippingTotal.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-slate-800">Total Reimbursables:</span>
                    <span className="font-mono">${calculations.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Breakdown Details */}
                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-slate-800">Calculation Details:</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    {data.mileage.isFlying ? (
                      <div className="space-y-1">
                        <div>
                          Flight: ${data.mileage.flightCost || 0} ÷ 0.9 = $
                          {((data.mileage.flightCost || 0) / 0.9).toFixed(2)}
                        </div>
                        <div>
                          Airport to Hotel: {data.mileage.airportToHotel || 0} ×{" "}
                          {data.mileage.airportToHotelMultiplier || 1} ={" "}
                          {(data.mileage.airportToHotel || 0) * (data.mileage.airportToHotelMultiplier || 1)} miles
                        </div>
                        <div>
                          Hotel to Project: {data.mileage.hotelToProject || 0} ×{" "}
                          {data.mileage.hotelToProjectMultiplier || 1} ={" "}
                          {(data.mileage.hotelToProject || 0) * (data.mileage.hotelToProjectMultiplier || 1)} miles
                        </div>
                        <div>
                          Local Mileage:{" "}
                          {(data.mileage.airportToHotel || 0) * (data.mileage.airportToHotelMultiplier || 1) +
                            (data.mileage.hotelToProject || 0) * (data.mileage.hotelToProjectMultiplier || 1)}{" "}
                          × $0.70 ÷ 0.9 = $
                          {(
                            (((data.mileage.airportToHotel || 0) * (data.mileage.airportToHotelMultiplier || 1) +
                              (data.mileage.hotelToProject || 0) * (data.mileage.hotelToProjectMultiplier || 1)) *
                              0.7) /
                            0.9
                          ).toFixed(2)}
                        </div>
                        <div>Total Travel: ${calculations.mileageTotal.toFixed(2)}</div>
                      </div>
                    ) : (
                      <div>
                        Mileage: {data.mileage.miles || 0} × 2 × $0.70 ÷ 0.9 = ${calculations.mileageTotal.toFixed(2)}
                      </div>
                    )}
                    <div>
                      Meals: {data.meals.count || 0} × $25 = ${calculations.mealsTotal.toFixed(2)}
                    </div>
                    <div>
                      Hotel: ${data.hotel.cost || 0} ÷ 0.9 = ${calculations.hotelTotal.toFixed(2)}
                    </div>
                    <div>
                      Equipment: ${data.equipment.cost || 0} ÷ 0.9 = ${calculations.equipmentTotal.toFixed(2)}
                    </div>
                    <div>
                      Shipping: ${data.shipping.cost || 0} ÷ 0.9 = ${calculations.shippingTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
