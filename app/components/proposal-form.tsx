"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RotateCcw } from "lucide-react"
import type { ProposalData, Service } from "../types/proposal"
import AddressInput from "./address-input"
import CompanySelector from "./company-selector"
import SelectedCompanyDisplay from "./selected-company-display"
import FieldSuggestions from "./field-suggestions"
import ServiceMenu from "./service-menu"

interface ProposalFormProps {
  data: ProposalData
  onChange: (data: ProposalData) => void
  services: Service[]
  selectedCompany: CompanyInfo | null
  onSelectedCompanyChange: (company: CompanyInfo | null) => void
  addressSuggestions: string[]
  onAddressSuggestionsChange: (suggestions: string[]) => void
  phoneSuggestions: string[]
  onPhoneSuggestionsChange: (suggestions: string[]) => void
  showAddressSuggestions: boolean
  onShowAddressSuggestionsChange: (show: boolean) => void
  showPhoneSuggestions: boolean
  onShowPhoneSuggestionsChange: (show: boolean) => void
}

interface CompanyInfo {
  name: string
  address: string
  phone?: string
  placeId?: string
}

export default function ProposalForm({
  data,
  onChange,
  services,
  selectedCompany,
  onSelectedCompanyChange,
  addressSuggestions,
  onAddressSuggestionsChange,
  phoneSuggestions,
  onPhoneSuggestionsChange,
  showAddressSuggestions,
  onShowAddressSuggestionsChange,
  showPhoneSuggestions,
  onShowPhoneSuggestionsChange,
}: ProposalFormProps) {
  const [isUsingAddressSuggestion, setIsUsingAddressSuggestion] = useState(false)

  const proposalTypes = [
    { value: "water-testing", label: "New Water Testing Proposal" },
    { value: "visual-assessment", label: "New Visual Condition Assessment Proposal" },
  ]

  const paymentTypes = [
    { value: "hourly", label: "Hourly" },
    { value: "hourly-nte", label: "Hourly Not-to-Exceed" },
    { value: "cost-of-services", label: "Cost of Services" },
    { value: "lump-sum", label: "Lump Sum Fee Basis" },
  ]

  const updateData = (field: string, value: any) => {
    onChange({ ...data, [field]: value })
  }

  const updateClientInfo = (field: string, value: string) => {
    onChange({
      ...data,
      clientInfo: { ...data.clientInfo, [field]: value },
    })
  }

  const updateProjectInfo = (field: string, value: any) => {
    onChange({
      ...data,
      projectInfo: { ...data.projectInfo, [field]: value },
    })
  }

  const updateHeader = (field: string, value: string) => {
    onChange({
      ...data,
      header: { ...data.header, [field]: value },
    })
  }

  const handleCompanySelect = (company: CompanyInfo) => {
    onSelectedCompanyChange(company)

    // Set suggestions based on selected company
    const addresses = [company.address].filter(Boolean)
    const phones = company.phone ? [company.phone] : []

    onAddressSuggestionsChange(addresses)
    onPhoneSuggestionsChange(phones)

    // Update company name
    updateClientInfo("companyName", company.name)

    // Show suggestions initially
    onShowAddressSuggestionsChange(addresses.length > 0)
    onShowPhoneSuggestionsChange(phones.length > 0)
  }

  const handleEditCompany = () => {
    onSelectedCompanyChange(null)
    onAddressSuggestionsChange([])
    onPhoneSuggestionsChange([])
    onShowAddressSuggestionsChange(false)
    onShowPhoneSuggestionsChange(false)
  }

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Proposal Header</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="proposal-date">Proposal Date</Label>
            <Input
              id="proposal-date"
              type="date"
              value={data.header.date}
              onChange={(e) => updateHeader("date", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="proposal-title">Proposal Title</Label>
            <Input
              id="proposal-title"
              value={data.header.proposalTitle}
              onChange={(e) => updateHeader("proposalTitle", e.target.value)}
              placeholder="Proposal for Applied Technical Consulting Services"
            />
          </div>
        </div>
      </div>

      {/* Proposal Type */}
      <div className="grid gap-2">
        <Label htmlFor="proposal-type">Proposal Type</Label>
        <Select value={data.proposalType} onValueChange={(value) => updateData("proposalType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select proposal type" />
          </SelectTrigger>
          <SelectContent>
            {proposalTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payment Type */}
      <div className="grid gap-2">
        <Label htmlFor="payment-type">Payment Type</Label>
        <Select value={data.paymentType} onValueChange={(value) => updateData("paymentType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            {paymentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Client Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Client Information</h3>

        {/* Company Name with Company Selector or Selected Company Display */}
        <div className="grid gap-2">
          <Label htmlFor="company-name">Company Name</Label>
          {selectedCompany ? (
            <SelectedCompanyDisplay company={selectedCompany} onEdit={handleEditCompany} />
          ) : (
            <>
              <Input
                id="company-name"
                value={data.clientInfo.companyName}
                onChange={(e) => {
                  updateClientInfo("companyName", e.target.value)
                }}
                placeholder="Enter company name"
              />
              <CompanySelector companyName={data.clientInfo.companyName} onCompanySelect={handleCompanySelect} />
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="client-title">Title</Label>
            <Select
              value={data.clientInfo.clientTitle}
              onValueChange={(value) => updateClientInfo("clientTitle", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr.">Mr.</SelectItem>
                <SelectItem value="Ms.">Ms.</SelectItem>
                <SelectItem value="Dr.">Dr.</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              value={data.clientInfo.firstName}
              onChange={(e) => updateClientInfo("firstName", e.target.value)}
              placeholder="Enter first name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              value={data.clientInfo.lastName}
              onChange={(e) => updateClientInfo("lastName", e.target.value)}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              value={data.clientInfo.email}
              onChange={(e) => updateClientInfo("email", e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="client-phone">Phone</Label>
              {phoneSuggestions.length > 0 && !showPhoneSuggestions && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onShowPhoneSuggestionsChange(true)}
                  className="text-xs flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Show suggestions
                </Button>
              )}
            </div>
            <Input
              id="client-phone"
              type="tel"
              value={data.clientInfo.phone}
              onChange={(e) => updateClientInfo("phone", e.target.value)}
              placeholder="Enter phone number"
            />
            {showPhoneSuggestions && (
              <FieldSuggestions
                type="phone"
                suggestions={phoneSuggestions}
                onSelect={(phone) => updateClientInfo("phone", phone)}
                onDismiss={() => onShowPhoneSuggestionsChange(false)}
              />
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="client-address">Address</Label>
            {addressSuggestions.length > 0 && !showAddressSuggestions && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onShowAddressSuggestionsChange(true)}
                className="text-xs flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Show suggestions
              </Button>
            )}
          </div>
          <AddressInput
            value={data.clientInfo.address}
            onChange={(address) => {
              updateClientInfo("address", address)
              if (!isUsingAddressSuggestion) {
                setIsUsingAddressSuggestion(false)
              }
            }}
            placeholder="Enter client address"
            disabled={isUsingAddressSuggestion}
          />
          {showAddressSuggestions && (
            <FieldSuggestions
              type="address"
              suggestions={addressSuggestions}
              onSelect={(address) => {
                setIsUsingAddressSuggestion(true)
                updateClientInfo("address", address)
                setTimeout(() => setIsUsingAddressSuggestion(false), 100)
              }}
              onDismiss={() => onShowAddressSuggestionsChange(false)}
            />
          )}
        </div>
      </div>

      {/* Project Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Project Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={data.projectInfo.name}
              onChange={(e) => updateProjectInfo("name", e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-location">Project Location</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-company-address"
                  checked={data.projectInfo.useCompanyAddress}
                  onCheckedChange={(checked) => updateProjectInfo("useCompanyAddress", checked)}
                />
                <Label htmlFor="use-company-address" className="text-sm">
                  Same as company address
                </Label>
              </div>
              {!data.projectInfo.useCompanyAddress ? (
                <AddressInput
                  value={data.projectInfo.location}
                  onChange={(location) => updateProjectInfo("location", location)}
                  placeholder="Enter project location"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border text-sm text-gray-700">
                  {data.clientInfo.address || "Enter company address first"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Service Selection Menu - Always visible */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Services</h3>
        <ServiceMenu
          services={services}
          selectedServices={data.selectedServices}
          onServicesChange={(services) => updateData("selectedServices", services)}
          proposalType={data.proposalType}
        />
      </div>
    </div>
  )
}
