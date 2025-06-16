"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Settings, Package, X } from "lucide-react"
import ProposalFormAccordion from "./components/proposal-form-accordion"
import ServicesManager from "./components/services-manager"
import type { ProposalData, Service, ReimbursableData, ServiceItem } from "./types/proposal"

interface CompanyInfo {
  name: string
  address: string
  phone?: string
  placeId?: string
}

export default function ProposalGenerator() {
  const [showServiceLibrary, setShowServiceLibrary] = useState(false)

  const [proposalData, setProposalData] = useState<ProposalData>({
    header: {
      date: "",
      proposalTitle: "",
    },
    proposalType: "",
    paymentType: "",
    clientInfo: {
      companyName: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      clientTitle: "",
    },
    projectInfo: {
      name: "",
      location: "",
      useCompanyAddress: false,
    },
    selectedServices: [],
    reimbursables: {
      travel: 0,
      hotel: 0,
      meals: 0,
      equipment: 0,
      shipping: 0,
      printing: 0,
      miscMaterials: 0,
    },
    totalReimbursables: 0,
    retainerAmount: 2000,
    retainerPercentage: 15,
    additionalNotes: "",
  })

  // UI state that should persist across tab switches
  const [selectedCompany, setSelectedCompany] = useState<CompanyInfo | null>(null)
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const [phoneSuggestions, setPhoneSuggestions] = useState<string[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false)

  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Water Spray Testing and Condition Observation Site Visit",
      description:
        "Our applied technical building envelope services includes water spray testing of exterior walls and storefronts and curtain wall. The water spray testing will be performed by two (2) of HCI's consultants with a spray wand equipped with a Monarch B-25 spray nozzle. Other items possibly to be observed are as follows:\n• Exterior Wall Cladding System\n• Associated Flashing, Dampproofing, Caulking, Sealing and Waterproofing\n• Interface Detailing for Building Envelope Systems and Components Including Foundations and adjacent Paved Surfaces and Grades\n• Waterproofing\n• Determine Compatibility of Configuration with Desired Architectural Detailing\n• Address Miscellaneous Weathertightness Issues",
      category: "water-testing",
      price: 0,
      suggestedPrice: 3500,
      serviceType: "basic",
      proposalTypes: ["water-testing"],
    },
    {
      id: "2",
      name: "Site Visit Condition Observation Report",
      description:
        "Comprehensive written documentation of all site conditions observed during the inspection visit, including detailed findings, observations, and preliminary assessments of building envelope performance and potential issues.",
      category: "water-testing",
      price: 0,
      suggestedPrice: 1200,
      serviceType: "basic",
      proposalTypes: ["water-testing"],
    },
    {
      id: "3",
      name: "Captioned Photo Report",
      description:
        "Professional photographic documentation with detailed captions describing observed conditions, deficiencies, and areas of concern. Photos will be organized and labeled to correspond with written findings and recommendations.",
      category: "water-testing",
      price: 0,
      suggestedPrice: 800,
      serviceType: "basic",
      proposalTypes: ["water-testing"],
    },
    {
      id: "4",
      name: "Typical Phone, Video and E-mail Correspondence",
      description:
        "Ongoing communication and consultation services including phone calls, video conferences, and email correspondence to discuss findings, answer questions, and provide technical guidance throughout the project duration.",
      category: "water-testing",
      price: 0,
      suggestedPrice: 600,
      serviceType: "basic",
      proposalTypes: ["water-testing"],
    },
    {
      id: "5",
      name: "Visual Assessment",
      description: `A. Interview Individuals Knowledgeable of Roof Repairs and History. View the Underside of Decking Where Exposed and Current Roofing Conditions.
B. Captioned Condition Photo Report to Document Conditions Observed.
C. Concise Executive Summary Condition Observation Report to Offer Recommended Remedial Actions.
D. Discuss Condition Observations and Recommendations with Client and Answer Questions.
E. Typical Phone, Video, and Email Correspondence`,
      category: "visual-assessment",
      price: 0,
      suggestedPrice: 2500,
      serviceType: "basic",
      proposalTypes: ["visual-assessment"],
    },
    {
      id: "6",
      name: "Additional Service 1",
      description:
        "Placeholder service that can be customized for specific project requirements. Edit this service to match your project needs.",
      category: "additional",
      price: 0,
      suggestedPrice: 1000,
      serviceType: "additional",
      proposalTypes: [],
    },
    {
      id: "7",
      name: "Additional Service 2",
      description:
        "Another placeholder service for project-specific requirements. Customize the name, description, and pricing as needed.",
      category: "additional",
      price: 0,
      suggestedPrice: 1500,
      serviceType: "additional",
      proposalTypes: [],
    },
  ])

  const [reimbursables, setReimbursables] = useState<ReimbursableData>({
    mileage: { miles: 0, isFlying: false, flightCost: 0 },
    meals: { count: 0 },
    hotel: { cost: 0 },
    equipment: { cost: 0 },
    shipping: { cost: 0 },
  })

  // Auto-select services when proposal type changes
  useEffect(() => {
    if (proposalData.proposalType === "water-testing") {
      // Auto-select only water testing services
      const waterTestingServices: ServiceItem[] = services
        .filter((service) => 
          service.proposalTypes.includes("water-testing") && 
          service.serviceType === "basic"
        )
        .map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.suggestedPrice || 0,
          category: service.category,
          isSelected: true,
          originalDescription: service.description,
          originalPrice: service.suggestedPrice || 0,
          serviceType: service.serviceType,
          proposalTypes: service.proposalTypes,
        }))

      setProposalData((prev) => ({
        ...prev,
        selectedServices: waterTestingServices,
      }))
    } else if (proposalData.proposalType === "visual-assessment") {
      // Auto-select only visual assessment services
      const visualAssessmentService: ServiceItem[] = services
        .filter((service) => 
          service.proposalTypes.includes("visual-assessment") && 
          service.serviceType === "basic"
        )
        .map((service) => ({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.suggestedPrice || 0,
          category: service.category,
          isSelected: true,
          originalDescription: service.description,
          originalPrice: service.suggestedPrice || 0,
          serviceType: service.serviceType,
          proposalTypes: service.proposalTypes,
        }))

      setProposalData((prev) => ({
        ...prev,
        selectedServices: visualAssessmentService,
      }))
    } else if (proposalData.proposalType === "") {
      // Clear services when no proposal type is selected
      setProposalData((prev) => ({
        ...prev,
        selectedServices: [],
      }))
    }
  }, [proposalData.proposalType, services])

  const handleProposalDataChange = (newData: ProposalData) => {
    setProposalData(newData)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Main Proposal Creation */}
        {!showServiceLibrary && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-medium">
                  <FileText className="h-5 w-5" />
                  AI Proposal Generator
                </CardTitle>
                <Button variant="outline" onClick={() => setShowServiceLibrary(true)} className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Services
                  <Badge variant="secondary" className="ml-1">
                    {services.length}
                  </Badge>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ProposalFormAccordion
                data={proposalData}
                onChange={handleProposalDataChange}
                services={services}
                selectedCompany={selectedCompany}
                onSelectedCompanyChange={setSelectedCompany}
                addressSuggestions={addressSuggestions}
                onAddressSuggestionsChange={setAddressSuggestions}
                phoneSuggestions={phoneSuggestions}
                onPhoneSuggestionsChange={setPhoneSuggestions}
                showAddressSuggestions={showAddressSuggestions}
                onShowAddressSuggestionsChange={setShowAddressSuggestions}
                showPhoneSuggestions={showPhoneSuggestions}
                onShowPhoneSuggestionsChange={setShowPhoneSuggestions}
                reimbursables={reimbursables}
                onReimbursablesChange={setReimbursables}
              />
            </CardContent>
          </Card>
        )}

        {/* Service Library Management Modal/Overlay */}
        {showServiceLibrary && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-medium">
                    <Package className="h-5 w-5" />
                    Service Library Management
                  </CardTitle>
                  <CardDescription className="font-normal">
                    Manage your service descriptions, pricing, and categories. These services will be available when
                    creating proposals.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowServiceLibrary(false)}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Back to Proposal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ServicesManager services={services} onChange={setServices} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
