"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Settings, Package, X } from "lucide-react"
import ProposalFormAccordion from "./components/proposal-form-accordion"
import ServicesManager from "./components/services-manager"
import type { ProposalData, Service, ReimbursableData, ServiceItem } from "./types/proposal"
import { services as initialServices } from "./data/services"

interface CompanyInfo {
  name: string
  address: string
  phone?: string
  placeId?: string
}

export default function ProposalGenerator() {
  const [showServiceLibrary, setShowServiceLibrary] = useState(false)

  const [proposalData, setProposalData] = useState<ProposalData>(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("proposalData")
      if (savedData) {
        return JSON.parse(savedData)
      }
    }
    return {
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
    }
  })

  useEffect(() => {
    localStorage.setItem("proposalData", JSON.stringify(proposalData))
  }, [proposalData])

  // UI state that should persist across tab switches
  const [selectedCompany, setSelectedCompany] = useState<CompanyInfo | null>(null)
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([])
  const [phoneSuggestions, setPhoneSuggestions] = useState<string[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false)

  const [services, setServices] = useState<Service[]>(() => {
    if (typeof window !== "undefined") {
      const savedServices = localStorage.getItem("services")
      if (savedServices) {
        return JSON.parse(savedServices)
      }
    }
    return initialServices
  })

  useEffect(() => {
    localStorage.setItem("services", JSON.stringify(services))
  }, [services])

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
