"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import type { Service, ServiceItem } from "../types/proposal"

interface ServiceSelectorProps {
  services: Service[]
  selectedServices: ServiceItem[]
  onServicesChange: (services: ServiceItem[]) => void
  proposalType: string
  showAllServices: boolean
}

export default function ServiceSelector({
  services,
  selectedServices,
  onServicesChange,
  proposalType,
  showAllServices,
}: ServiceSelectorProps) {
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({})

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some((s) => s.id === serviceId)
  }

  const getServicePrice = (serviceId: string) => {
    return servicePrices[serviceId] || 0
  }

  const toggleService = (service: Service) => {
    const isSelected = isServiceSelected(service.id)

    if (isSelected) {
      // Remove service
      onServicesChange(selectedServices.filter((s) => s.id !== service.id))
    } else {
      // Add service
      const newService: ServiceItem = {
        id: service.id,
        name: service.name,
        description: service.description,
        price: servicePrices[service.id] || service.suggestedPrice || 0,
        category: service.category,
        isSelected: true,
      }
      onServicesChange([...selectedServices, newService])
    }
  }

  const updateServicePrice = (serviceId: string, price: number) => {
    setServicePrices((prev) => ({ ...prev, [serviceId]: price }))

    // Update the selected service price if it's already selected
    const updatedServices = selectedServices.map((service) =>
      service.id === serviceId ? { ...service, price } : service,
    )
    onServicesChange(updatedServices)
  }

  const getServicesByType = (serviceType: "basic" | "additional") => {
    return services.filter((service) => service.serviceType === serviceType)
  }

  const renderServiceGroup = (title: string, services: Service[], badgeVariant: "default" | "secondary") => {
    if (services.length === 0) return null

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <Badge variant={badgeVariant}>{services.length}</Badge>
        </div>
        <div className="space-y-3">
          {services.map((service) => {
            const isSelected = isServiceSelected(service.id)
            const currentPrice = getServicePrice(service.id)
            const isRelevantToProposal = service.proposalTypes.includes(proposalType)

            return (
              <Card
                key={service.id}
                className={`transition-colors ${
                  isSelected ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"
                } ${!isRelevantToProposal && showAllServices ? "opacity-75" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={service.id}
                      checked={isSelected}
                      onCheckedChange={() => toggleService(service)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Label htmlFor={service.id} className="font-medium cursor-pointer text-base">
                            {service.name}
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {service.category.replace("-", " ")}
                            </Badge>
                            {!isRelevantToProposal && showAllServices && (
                              <Badge variant="secondary" className="text-xs">
                                Additional
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {service.suggestedPrice && service.suggestedPrice > 0 && (
                            <div className="text-xs text-gray-500">
                              Suggested: ${service.suggestedPrice.toLocaleString()}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              value={currentPrice}
                              onChange={(e) => updateServicePrice(service.id, Number.parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-24 h-8 text-sm"
                              min="0"
                              step="100"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const basicServices = getServicesByType("basic")
  const additionalServices = getServicesByType("additional")

  return (
    <div className="space-y-6">
      {renderServiceGroup("Basic Services", basicServices, "default")}
      {renderServiceGroup("Additional Services", additionalServices, "secondary")}
    </div>
  )
}
