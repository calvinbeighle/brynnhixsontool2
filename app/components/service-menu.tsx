"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Search, Package, Check, Edit3, Save, X, ChevronDown } from "lucide-react"
import type { Service, ServiceItem } from "../types/proposal"
import { Textarea } from "@/components/ui/textarea"

interface ServiceMenuProps {
  services: Service[]
  selectedServices: ServiceItem[]
  onServicesChange: (services: ServiceItem[]) => void
  proposalType: string
}

export default function ServiceMenu({ services, selectedServices, onServicesChange, proposalType }: ServiceMenuProps) {
  const [isAvailableServicesOpen, setIsAvailableServicesOpen] = useState(false)
  const [availableSearchTerm, setAvailableSearchTerm] = useState("")
  const [editingService, setEditingService] = useState<string | null>(null)
  const [aiInput, setAiInput] = useState("")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const addService = (service: Service) => {
    const newService: ServiceItem = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.suggestedPrice || 0,
      category: service.category,
      isSelected: true,
      originalDescription: service.description,
      originalPrice: service.suggestedPrice || 0,
      serviceType: service.serviceType,
      proposalTypes: service.proposalTypes
    }
    onServicesChange([...selectedServices, newService])
  }

  useEffect(() => {
    // Auto-select recommended basic services when proposal type is selected
    if (proposalType) {
      const recommendedBasicServices = services.filter(
        (service) => service.proposalTypes.includes(proposalType) && service.serviceType === "basic",
      )

      recommendedBasicServices.forEach((service) => {
        if (!isServiceSelected(service.id)) {
          addService(service)
        }
      })
    }
  }, [proposalType, services])

  const getProposalTypeColor = (proposalType: string) => {
    const colors = {
      "water-testing": "bg-blue-100 text-blue-800 border-blue-200",
      "visual-assessment": "bg-green-100 text-green-800 border-green-200",
      "total-envelope": "bg-purple-100 text-purple-800 border-purple-200",
    }
    return colors[proposalType as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getProposalTypeLabel = (proposalType: string) => {
    const labels = {
      "water-testing": "Water Testing",
      "visual-assessment": "Visual Assessment",
    }
    return labels[proposalType as keyof typeof labels] || proposalType
  }

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some((s) => s.id === serviceId)
  }

  const removeService = (serviceId: string) => {
    onServicesChange(selectedServices.filter((s) => s.id !== serviceId))
  }

  const updateSelectedService = (serviceId: string, field: keyof ServiceItem, value: any) => {
    const updatedServices = selectedServices.map((service) =>
      service.id === serviceId ? { ...service, [field]: value } : service,
    )
    onServicesChange(updatedServices)
  }

  const getBasicServices = () => {
    if (!proposalType) return []
    return services.filter(service => 
      service.serviceType === "basic" && 
      service.proposalTypes.includes(proposalType)
    )
  }

  const getAdditionalServices = () => {
    if (!proposalType) return []
    return selectedServices.filter(service => {
      const originalService = services.find(s => s.id === service.id)
      return originalService && (
        originalService.serviceType === "additional" || 
        !originalService.proposalTypes.includes(proposalType)
      )
    })
  }

  const getAvailableServices = () => {
    let filtered = services.filter(service => 
      !selectedServices.some(selected => selected.id === service.id)
    )

    if (availableSearchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(availableSearchTerm.toLowerCase()),
      )
    }

    return filtered
  }

  const renderBasicService = (service: Service | ServiceItem) => {
    const isSelected = isServiceSelected(service.id)
    const selectedService = selectedServices.find((s) => s.id === service.id)
    const isEditing = editingService === service.id
    const originalService = services.find(s => s.id === service.id)

    if (!isSelected) {
      return (
        <Card
          key={service.id}
          className="transition-all duration-200 hover:border-slate-300 hover:shadow-sm border-slate-200"
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-normal text-base mb-2 text-slate-900">{service.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="text-xs font-light border-slate-300">
                      {originalService?.serviceType === "basic" ? "Basic" : "Additional"}
                    </Badge>
                    {originalService?.proposalTypes.map((type) => (
                      <Badge key={type} className={`text-xs font-light ${getProposalTypeColor(type)}`}>
                        {getProposalTypeLabel(type)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-light">
                    {service.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {originalService?.suggestedPrice && originalService.suggestedPrice > 0 && (
                    <span className="text-sm font-normal text-slate-900">
                      ${originalService.suggestedPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => addService(originalService!)}
                  className="flex items-center gap-1 font-light bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="h-3 w-3" />
                  Select
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Selected service card with editing capability
    return (
      <Card
        key={service.id}
        className="transition-all duration-200 hover:border-slate-300 hover:shadow-sm border-emerald-500 bg-emerald-50"
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-normal text-base mb-2 text-slate-900">{selectedService?.name || service.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="text-xs font-light border-slate-300">
                    {originalService?.serviceType === "basic" ? "Basic" : "Additional"}
                  </Badge>
                  {originalService?.proposalTypes.map((type) => (
                    <Badge key={type} className={`text-xs font-light ${getProposalTypeColor(type)}`}>
                      {getProposalTypeLabel(type)}
                    </Badge>
                  ))}
                  {selectedService &&
                    (selectedService.description !== selectedService.originalDescription ||
                      selectedService.price !== selectedService.originalPrice) && (
                      <Badge className="text-xs font-light">
                        Modified
                      </Badge>
                    )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1 block">Description</label>
                      <Textarea
                        value={selectedService?.description || ""}
                        onChange={(e) => updateSelectedService(service.id, "description", e.target.value)}
                        className="text-sm leading-relaxed font-light resize-none"
                        style={{
                          minHeight: "60px",
                          height: `${Math.max(60, (selectedService?.description || "").split("\n").length * 20 + 20)}px`,
                        }}
                      />
                    </div>

                    {selectedService?.description !== selectedService?.originalDescription && (
                      <div className="bg-slate-50 p-2 rounded border">
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Original Description</label>
                        <p className="text-xs text-slate-600 leading-relaxed">{selectedService?.originalDescription}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1 block">Cost</label>
                      <Input
                        type="number"
                        value={selectedService?.price || 0}
                        onChange={(e) =>
                          updateSelectedService(service.id, "price", Number.parseFloat(e.target.value) || 0)
                        }
                        className="text-sm font-light w-32"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-light">
                    {selectedService?.description || service.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedService?.price && selectedService.price > 0 && (
                  <span className="text-sm font-normal text-slate-900">
                    ${selectedService.price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={() => setEditingService(null)}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Save className="h-3 w-3" />
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setEditingService(service.id)}
                      className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => removeService(service.id)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderAvailableService = (service: Service) => {
    const isSelected = isServiceSelected(service.id)
    const isRelevantToProposal = service.proposalTypes.includes(proposalType)

    if (isSelected) return null // Don't show selected services in available list

    return (
      <Card
        key={service.id}
        className={`transition-all duration-200 hover:border-gray-300 hover:shadow-sm ${
          !isRelevantToProposal ? "opacity-75" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-base mb-2">{service.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="text-xs">
                    {service.serviceType === "basic" ? "Basic" : "Additional"}
                  </Badge>
                  {service.proposalTypes.map((type) => (
                    <Badge key={type} className={`text-xs ${getProposalTypeColor(type)}`}>
                      {getProposalTypeLabel(type)}
                    </Badge>
                  ))}
                  {!isRelevantToProposal && (
                    <Badge className="text-xs">
                      Other
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{service.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {service.suggestedPrice && service.suggestedPrice > 0 && (
                  <span className="text-sm font-medium">${service.suggestedPrice.toLocaleString()}</span>
                )}
              </div>

              <Button
                onClick={() => addService(service)}
                className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                <Plus className="h-3 w-3" />
                Add to Proposal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Basic Services Section */}
      {proposalType && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900">Basic Services</h3>
          {getBasicServices().length > 0 ? (
            <div className="grid gap-4">
              {getBasicServices().map((service) => renderBasicService(service))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No basic services found</p>
            </div>
          )}
        </div>
      )}

      {/* Additional Services Section */}
      {proposalType && getAdditionalServices().length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900">Additional Services</h3>
          <div className="grid gap-4">
            {getAdditionalServices().map((service) => renderBasicService(service))}
          </div>
        </div>
      )}

      {/* Available Services Section */}
      <div className="space-y-4">
        <Button
          onClick={() => setIsAvailableServicesOpen(!isAvailableServicesOpen)}
          className="w-full flex items-center justify-between bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Additional Services
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isAvailableServicesOpen ? 'transform rotate-180' : ''}`} />
        </Button>
        
        {isAvailableServicesOpen && (
          <>
            <div className="flex items-center gap-2 w-64">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search available services..."
                value={availableSearchTerm}
                onChange={(e) => setAvailableSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            {getAvailableServices().length > 0 ? (
              <div className="grid gap-4">
                {getAvailableServices().map((service) => renderAvailableService(service))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No available services found</p>
              </div>
            )}
          </>
        )}
      </div>

      {!proposalType && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Select a proposal type to see available services</p>
        </div>
      )}
    </div>
  )
}
