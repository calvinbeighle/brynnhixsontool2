"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pencil, Plus, Save, X } from "lucide-react"
import type { Service } from "../types/proposal"

interface ServicesManagerProps {
  services: Service[]
  onChange: (services: Service[]) => void
}

export default function ServicesManager({ services, onChange }: ServicesManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newService, setNewService] = useState<Omit<Service, "id">>({
    name: "",
    description: "",
    category: "",
    price: 0,
    suggestedPrice: 0,
    serviceType: "basic",
    proposalTypes: [],
  })

  const categories = [
    { value: "water-testing", label: "Water Testing" },
    { value: "visual-assessment", label: "Visual Assessment" },
    { value: "total-envelope", label: "Total Building Envelope" },
    { value: "reporting", label: "Reporting" },
    { value: "consultation", label: "Consultation" },
  ]

  const proposalTypeOptions = [
    { value: "water-testing", label: "Water Testing", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "visual-assessment", label: "Visual Assessment", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "total-envelope", label: "Total Envelope", color: "bg-purple-100 text-purple-800 border-purple-200" },
  ]

  const serviceTypes = [
    { value: "basic", label: "Basic Service" },
    { value: "additional", label: "Additional Service" },
  ]

  const updateService = (id: string, field: keyof Service, value: any) => {
    onChange(services.map((service) => (service.id === id ? { ...service, [field]: value } : service)))
  }

  const addService = () => {
    if (newService.name && newService.description && newService.category) {
      const id = Date.now().toString()
      onChange([...services, { ...newService, id }])
      setNewService({
        name: "",
        description: "",
        category: "",
        price: 0,
        suggestedPrice: 0,
        serviceType: "basic",
        proposalTypes: [],
      })
      setIsAdding(false)
    }
  }

  const deleteService = (id: string) => {
    onChange(services.filter((service) => service.id !== id))
  }

  const toggleProposalType = (serviceId: string, proposalType: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    const currentTypes = service.proposalTypes
    const newTypes = currentTypes.includes(proposalType)
      ? currentTypes.filter((type) => type !== proposalType)
      : [...currentTypes, proposalType]

    updateService(serviceId, "proposalTypes", newTypes)
  }

  const toggleNewServiceProposalType = (proposalType: string) => {
    const currentTypes = newService.proposalTypes
    const newTypes = currentTypes.includes(proposalType)
      ? currentTypes.filter((type) => type !== proposalType)
      : [...currentTypes, proposalType]

    setNewService({ ...newService, proposalTypes: newTypes })
  }

  const getProposalTypeColor = (proposalType: string) => {
    return proposalTypeOptions.find((option) => option.value === proposalType)?.color || "bg-gray-100 text-gray-800"
  }

  const getProposalTypeLabel = (proposalType: string) => {
    return proposalTypeOptions.find((option) => option.value === proposalType)?.label || proposalType
  }

  const renderProposalTypeTags = (serviceId: string, proposalTypes: string[], isEditing: boolean) => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Proposal Types</Label>
          <div className="flex flex-wrap gap-2">
            {proposalTypeOptions.map((option) => {
              const isSelected = proposalTypes.includes(option.value)
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${isSelected ? option.color : "hover:bg-gray-100"}`}
                  onClick={() => toggleProposalType(serviceId, option.value)}
                >
                  {option.label}
                </Badge>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {proposalTypes.map((type) => (
          <Badge key={type} className={`text-xs ${getProposalTypeColor(type)}`}>
            {getProposalTypeLabel(type)}
          </Badge>
        ))}
      </div>
    )
  }

  const renderNewServiceProposalTypeTags = () => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Proposal Types</Label>
        <div className="flex flex-wrap gap-2">
          {proposalTypeOptions.map((option) => {
            const isSelected = newService.proposalTypes.includes(option.value)
            return (
              <Badge
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${isSelected ? option.color : "hover:bg-gray-100"}`}
                onClick={() => toggleNewServiceProposalType(option.value)}
              >
                {option.label}
              </Badge>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Service Library</h3>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Add New Service Form */}
      {isAdding && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Add New Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Service Name</Label>
              <Input
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="Enter service name"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={newService.category}
                  onValueChange={(value) => setNewService({ ...newService, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Service Type</Label>
                <Select
                  value={newService.serviceType}
                  onValueChange={(value: "basic" | "additional") =>
                    setNewService({ ...newService, serviceType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Suggested Price ($)</Label>
              <Input
                type="number"
                value={newService.suggestedPrice}
                onChange={(e) =>
                  setNewService({ ...newService, suggestedPrice: Number.parseFloat(e.target.value) || 0 })
                }
                placeholder="Enter suggested price"
              />
            </div>
            {renderNewServiceProposalTypeTags()}
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Enter service description"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addService} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)} size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Services */}
      <div className="space-y-3">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-4">
              {editingId === service.id ? (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Service Name</Label>
                    <Input value={service.name} onChange={(e) => updateService(service.id, "name", e.target.value)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Category</Label>
                      <Select
                        value={service.category}
                        onValueChange={(value) => updateService(service.id, "category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Service Type</Label>
                      <Select
                        value={service.serviceType}
                        onValueChange={(value: "basic" | "additional") =>
                          updateService(service.id, "serviceType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Suggested Price ($)</Label>
                    <Input
                      type="number"
                      value={service.suggestedPrice}
                      onChange={(e) =>
                        updateService(service.id, "suggestedPrice", Number.parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  {renderProposalTypeTags(service.id, service.proposalTypes, true)}
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <Textarea
                      value={service.description}
                      onChange={(e) => updateService(service.id, "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setEditingId(null)} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)} size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {service.serviceType}
                        </Badge>
                        {service.suggestedPrice > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            ${service.suggestedPrice.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{service.category.replace("-", " ")}</span>
                      {renderProposalTypeTags(service.id, service.proposalTypes, false)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(service.id)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteService(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
