"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  CheckCircle,
  Circle,
  AlertCircle,
  Calendar,
  FileText,
  User,
  Building2,
  Package,
  Calculator,
  Droplets,
  Eye,
  Home,
  Clock,
  Timer,
  DollarSign,
  Banknote,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { ProposalData, Service } from "../types/proposal"
import AddressInput from "./address-input"
import CompanySelector from "./company-selector"
import SelectedCompanyDisplay from "./selected-company-display"
import FieldSuggestions from "./field-suggestions"
import SuggestionDropdown from "./suggestion-dropdown"
import ServiceMenu from "./service-menu"
import ReimbursablesCalculator from "./reimbursables-calculator"
import type { ReimbursableData } from "../types/proposal"
import PDFGenerator from "./pdf-generator"
import { Button } from "@/components/ui/button"
import { type NextRequest, NextResponse } from "next/server"
import { formatPhoneNumber, isValidEmail } from "@/lib/utils"

interface ProposalFormAccordionProps {
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
  reimbursables: ReimbursableData
  onReimbursablesChange: (data: ReimbursableData) => void
}

interface CompanyInfo {
  name: string
  address: string
  phone?: string
  placeId?: string
}

interface SectionValidation {
  isValid: boolean
  isComplete: boolean
  requiredFields: string[]
  completedFields: string[]
}

// Add validation function
const isValidAddress = (address: string): boolean => {
  if (!address) return false
  // Check for minimum components
  const hasStreetNumber = /\d+/.test(address)
  const hasStreetName = /[a-zA-Z]/.test(address)
  const hasCity = /[a-zA-Z]+\s*,\s*[A-Z]{2}/.test(address)
  const hasZipCode = /\d{5}(-\d{4})?/.test(address)

  return hasStreetNumber && hasStreetName && hasCity && hasZipCode
}

export default function ProposalFormAccordion({
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
  reimbursables,
  onReimbursablesChange,
}: ProposalFormAccordionProps) {
  const [isUsingAddressSuggestion, setIsUsingAddressSuggestion] = useState(false)
  const [hasUsedPhoneSuggestion, setHasUsedPhoneSuggestion] = useState(false)
  const [hasUsedAddressSuggestion, setHasUsedAddressSuggestion] = useState(false)
  const [isReimbursablesNeeded, setIsReimbursablesNeeded] = useState(true)
  const [isServicesComplete, setIsServicesComplete] = useState(false)
  const [isCompanySelected, setIsCompanySelected] = useState(false)

  const [openSections, setOpenSections] = useState<string[]>([])

  const proposalTypes = [
    { value: "water-testing", label: "Water Testing Proposal", icon: Droplets },
    { value: "visual-assessment", label: "Visual Condition Assessment", icon: Eye },
  ]

  const paymentTypes = [
    { value: "hourly", label: "Hourly", icon: Clock },
    { value: "hourly-nte", label: "Hourly Not-to-Exceed", icon: Timer },
    { value: "cost-of-services", label: "Cost of Services", icon: DollarSign },
    { value: "lump-sum", label: "Lump Sum Fee", icon: Banknote },
  ]

  // Validation logic for each section
  const validateSection = (sectionId: string): SectionValidation => {
    switch (sectionId) {
      case "header":
        const headerRequired = ["date", "proposalTitle"]
        const headerCompleted = [
          data.header.date ? "date" : null,
          data.header.proposalTitle ? "proposalTitle" : null,
        ].filter(Boolean)
        return {
          isValid: headerCompleted.length >= 1,
          isComplete: headerCompleted.length === headerRequired.length,
          requiredFields: headerRequired,
          completedFields: headerCompleted as string[],
        }

      case "proposal-type":
        const proposalRequired = ["proposalType", "paymentType"]
        const proposalCompleted = [
          data.proposalType ? "proposalType" : null,
          data.paymentType ? "paymentType" : null,
        ].filter(Boolean)
        return {
          isValid: proposalCompleted.length >= 1,
          isComplete: proposalCompleted.length === proposalRequired.length,
          requiredFields: proposalRequired,
          completedFields: proposalCompleted as string[],
        }

      case "client":
        const clientRequired = ["companyName", "clientTitle", "firstName", "lastName", "email", "address"]
        const clientCompleted = [
          data.clientInfo.companyName ? "companyName" : null,
          data.clientInfo.clientTitle ? "clientTitle" : null,
          data.clientInfo.firstName ? "firstName" : null,
          data.clientInfo.lastName ? "lastName" : null,
          isValidEmail(data.clientInfo.email) ? "email" : null,
          isValidAddress(data.clientInfo.address) ? "address" : null,
        ].filter(Boolean)
        return {
          isValid: clientCompleted.length >= 3,
          isComplete: clientCompleted.length === clientRequired.length,
          requiredFields: clientRequired,
          completedFields: clientCompleted as string[],
        }

      case "project":
        const projectRequired = ["name", "location"]
        const projectCompleted = [
          data.projectInfo.name ? "name" : null,
          data.projectInfo.useCompanyAddress || isValidAddress(data.projectInfo.location) ? "location" : null,
        ].filter(Boolean)
        return {
          isValid: projectCompleted.length >= 1,
          isComplete: projectCompleted.length === projectRequired.length,
          requiredFields: projectRequired,
          completedFields: projectCompleted as string[],
        }

      case "services":
        // Services section is complete if there are any selected services
        return {
          isValid: data.selectedServices.length > 0,
          isComplete: data.selectedServices.length > 0,
          requiredFields: ["selectedServices"],
          completedFields: data.selectedServices.length > 0 ? ["selectedServices"] : [],
        }
      case "reimbursables":
        if (!isReimbursablesNeeded) {
          return { isValid: true, isComplete: true, requiredFields: [], completedFields: [] }
        }
        const hasReimbursables = Object.values(reimbursables).some((val) => {
          if (typeof val === "number") return val > 0
          if (typeof val === "object" && val !== null) {
            return (val.miles ?? 0) > 0 || (val.isFlying && (val.flightCost ?? 0) > 0)
          }
          return false
        })
        return {
          isValid: hasReimbursables,
          isComplete: hasReimbursables,
          requiredFields: ["reimbursables"],
          completedFields: hasReimbursables ? ["reimbursables"] : [],
        }

      case "generate":
        const otherSections = sections.filter((s) => s.id !== "generate")
        const completedOtherSections = otherSections.filter((s) => validateSection(s.id).isComplete)
        const allOtherSectionsComplete = completedOtherSections.length === otherSections.length

        return {
          isValid: allOtherSectionsComplete,
          isComplete: false,
          requiredFields: otherSections.map((s) => s.id),
          completedFields: completedOtherSections.map((s) => s.id),
        }

      default:
        return {
          isValid: false,
          isComplete: false,
          requiredFields: [],
          completedFields: [],
        }
    }
  }

  const sections = [
    {
      id: "header",
      title: "Header Information",
      icon: Calendar,
    },
    {
      id: "proposal-type",
      title: "Proposal Type & Payment",
      icon: FileText,
    },
    {
      id: "client",
      title: "Client Information",
      icon: User,
    },
    {
      id: "project",
      title: "Project Information",
      icon: Building2,
    },
    {
      id: "services",
      title: "Service Selection",
      icon: Package,
    },
    {
      id: "reimbursables",
      title: "Reimbursables Calculator",
      icon: Calculator,
    },
    {
      id: "generate",
      title: "Generate PDF & Additional Details",
      icon: FileText,
    },
  ]

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    )
  }

  // Effect to open the first section when the component mounts - DISABLED
  // useEffect(() => {
  //   if (sections.length > 0) {
  //     setOpenSections([sections[0].id])
  //   }
  // }, [])

  // Calculate overall progress
  const overallProgress = () => {
    const totalSections = sections.length
    const completedSections = sections.filter((s) => validateSection(s.id).isComplete).length
    return Math.round((completedSections / totalSections) * 100)
  }

  // Smart navigation - auto-open next incomplete section
  const navigateToNextSection = (currentSectionId: string) => {
    const currentIndex = sections.findIndex((s) => s.id === currentSectionId)
    const nextSection = sections[currentIndex + 1]

    if (nextSection && !validateSection(nextSection.id).isComplete) {
      setOpenSections((prev) => {
        if (!prev.includes(nextSection.id)) {
          return [...prev, nextSection.id]
        }
        return prev
      })
    }
  }

  // Auto-open reimbursables when services section is opened - DISABLED
  // useEffect(() => {
  //   if (openSections.includes("services")) {
  //     setOpenSections((prev) => {
  //       if (!prev.includes("reimbursables")) {
  //         return [...prev, "reimbursables"]
  //       }
  //       return prev
  //     })
  //   }
  // }, [openSections])

  // Auto-open services when project information is in progress - DISABLED
  // useEffect(() => {
  //   const projectValidation = validateSection("project")
  //   if (projectValidation.isValid && !projectValidation.isComplete) {
  //     setOpenSections((prev) => {
  //       if (!prev.includes("services")) {
  //         return [...prev, "services"]
  //       }
  //       return prev
  //     })
  //   }
  // }, [data.projectInfo])

  // Auto-open next section when current becomes valid - DISABLED
  // useEffect(() => {
  //   sections.forEach((section, index) => {
  //     const validation = validateSection(section.id)
  //     if (validation.isValid && index < sections.length - 1) {
  //       const nextSection = sections[index + 1]
  //       if (!validateSection(nextSection.id).isComplete) {
  //         setTimeout(() => {
  //           setOpenSections((prev) => {
  //             if (!prev.includes(nextSection.id)) {
  //               return [...prev, nextSection.id]
  //             }
  //             return prev
  //           })
  //         }, 300)
  //       }
  //     }
  //   })
  // }, [data, reimbursables, isReimbursablesNeeded])

  // Auto-toggle reimbursables based on payment type
  useEffect(() => {
    // Reimbursables are not needed only for "Lump Sum Fee"
    if (data.paymentType === "lump-sum") {
      setIsReimbursablesNeeded(false)
    } else {
      setIsReimbursablesNeeded(true)
    }
  }, [data.paymentType])

  // Auto-open PDF generation when reimbursables become complete - DISABLED
  // useEffect(() => {
  //   const reimbursablesValidation = validateSection("reimbursables")
  //   if (reimbursablesValidation.isComplete) {
  //     setTimeout(() => {
  //       setOpenSections((prev) => {
  //         if (!prev.includes("generate")) {
  //           return [...prev, "generate"]
  //         }
  //         return prev
  //       })
  //     }, 300)
  //   }
  // }, [isReimbursablesNeeded, reimbursables])

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
    const addresses = [company.address].filter(Boolean)
    const phones = company.phone ? [company.phone] : []
    onAddressSuggestionsChange(addresses)
    onPhoneSuggestionsChange(phones)
    updateClientInfo("companyName", company.name)
    onShowAddressSuggestionsChange(addresses.length > 0)
    onShowPhoneSuggestionsChange(phones.length > 0)
    setIsCompanySelected(true)
  }

  const handleEditCompany = () => {
    onSelectedCompanyChange(null)
    onAddressSuggestionsChange([])
    onPhoneSuggestionsChange([])
    onShowAddressSuggestionsChange(false)
    onShowPhoneSuggestionsChange(false)
    setHasUsedPhoneSuggestion(false)
    setHasUsedAddressSuggestion(false)
    setIsCompanySelected(false)
  }

  const renderSectionIcon = (section: any) => {
    const validation = validateSection(section.id)
    const IconComponent = section.icon

    if (validation.isComplete) {
      return <CheckCircle className="h-5 w-5 text-emerald-600" strokeWidth={1} />
    } else if (validation.isValid) {
      return <AlertCircle className="h-5 w-5 text-amber-500" strokeWidth={1} />
    } else {
      return <Circle className="h-5 w-5 text-gray-400" strokeWidth={1} />
    }
  }

  const getProjectAddress = () => {
    if (data.projectInfo.useCompanyAddress) {
      return data.clientInfo.address
    }
    return data.projectInfo.location
  }

  return (
    <div className="space-y-6 font-light">
      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSections}
        className="space-y-4"
      >
        {sections.map((section, index) => {
          const { isValid, isComplete, requiredFields, completedFields } = validateSection(section.id)
          const isLocked = index > 0 && !validateSection(sections[index - 1].id).isComplete
          const Icon = section.icon

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-blue-950 to-slate-900 text-white hover:from-blue-950 hover:to-slate-800 [&[data-state=open]]:rounded-b-none">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex items-center gap-3">
                    {renderSectionIcon(section)}
                    <Icon className="h-5 w-5 text-slate-300" strokeWidth={1} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-light text-white">{section.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isComplete && (
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-light">Complete</Badge>
                    )}
                    {!isComplete && isValid && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-light">In Progress</Badge>
                    )}
                    <div className="text-xs text-slate-400 font-light">
                      {completedFields.length}/{requiredFields.length}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-6 py-6 bg-white">
                {section.id === "header" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="proposal-date" className="text-slate-700 font-light">
                          Proposal Date *
                        </Label>
                        <Input
                          id="proposal-date"
                          type="date"
                          value={data.header.date}
                          onChange={(e) => updateHeader("date", e.target.value)}
                          className="font-light"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="proposal-title" className="text-slate-700 font-light">
                          Proposal Title *
                        </Label>
                        <Input
                          id="proposal-title"
                          value={data.header.proposalTitle}
                          onChange={(e) => updateHeader("proposalTitle", e.target.value)}
                          placeholder="Proposal for Applied Technical Consulting Services"
                          className="font-light"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {section.id === "proposal-type" && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-slate-700 font-light text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" strokeWidth={1} />
                        Proposal Type *
                      </Label>
                      <div className="space-y-2">
                        {proposalTypes.map((type) => {
                          const IconComponent = type.icon
                          return (
                            <div
                              key={type.value}
                              className={`relative cursor-pointer rounded-lg border transition-all hover:shadow-sm ${
                                data.proposalType === type.value
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                              onClick={() => updateData("proposalType", type.value)}
                            >
                              <div className="flex items-center gap-3 p-3">
                                <IconComponent
                                  className={`h-5 w-5 ${
                                    data.proposalType === type.value ? "text-emerald-600" : "text-slate-400"
                                  }`}
                                  strokeWidth={1}
                                />
                                <div className="flex-1">
                                  <h3
                                    className={`font-light text-sm ${
                                      data.proposalType === type.value ? "text-emerald-900" : "text-slate-900"
                                    }`}
                                  >
                                    {type.label}
                                  </h3>
                                </div>
                                <div
                                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                    data.proposalType === type.value
                                      ? "border-emerald-500 bg-emerald-500"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {data.proposalType === type.value && (
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-700 font-light text-base flex items-center gap-2">
                        <Package className="h-4 w-4" strokeWidth={1} />
                        Payment Type *
                      </Label>
                      <div className="space-y-2">
                        {paymentTypes.map((type) => {
                          const IconComponent = type.icon
                          return (
                            <div
                              key={type.value}
                              className={`relative cursor-pointer rounded-lg border transition-all hover:shadow-sm ${
                                data.paymentType === type.value
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                              onClick={() => updateData("paymentType", type.value)}
                            >
                              <div className="flex items-center gap-3 p-3">
                                <IconComponent
                                  className={`h-5 w-5 ${
                                    data.paymentType === type.value ? "text-emerald-600" : "text-slate-400"
                                  }`}
                                  strokeWidth={1}
                                />
                                <div className="flex-1">
                                  <h3
                                    className={`font-light text-sm ${
                                      data.paymentType === type.value ? "text-emerald-900" : "text-slate-900"
                                    }`}
                                  >
                                    {type.label}
                                  </h3>
                                </div>
                                <div
                                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                    data.paymentType === type.value
                                      ? "border-emerald-500 bg-emerald-500"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {data.paymentType === type.value && <div className="h-2 w-2 rounded-full bg-white" />}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {section.id === "client" && (
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column - Company Information */}
                    <div className="space-y-4">
                      <h4 className="text-base font-normal text-slate-800 border-b border-slate-200 pb-2">
                        Company Information
                      </h4>
                      <div className="grid gap-2">
                        <Label htmlFor="company-name" className="text-slate-700 font-light">
                          Company Name *
                        </Label>
                        {selectedCompany ? (
                          <SelectedCompanyDisplay company={selectedCompany} onEdit={handleEditCompany} />
                        ) : (
                          <>
                            <Input
                              id="company-name"
                              value={data.clientInfo.companyName}
                              onChange={(e) => updateClientInfo("companyName", e.target.value)}
                              placeholder="Enter company name"
                              className={`font-light ${
                                isCompanySelected ? "border-emerald-500 bg-emerald-50" : ""
                              }`}
                            />
                            <CompanySelector
                              companyName={data.clientInfo.companyName}
                              onCompanySelect={handleCompanySelect}
                            />
                          </>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="client-address" className="text-slate-700 font-light">
                          Address
                        </Label>
                        <AddressInput
                          value={data.clientInfo.address}
                          onChange={(address) => updateClientInfo("address", address)}
                          placeholder="Enter address"
                          completed={!!data.clientInfo.address}
                        />
                        {addressSuggestions.length > 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onShowAddressSuggestionsChange(!showAddressSuggestions)}
                            className="text-xs flex items-center gap-1 mt-1 font-light"
                          >
                            {showAddressSuggestions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            Suggestions
                          </Button>
                        )}
                        {showAddressSuggestions && (
                          <FieldSuggestions
                            type="address"
                            suggestions={addressSuggestions}
                            onSelect={(address) => {
                              updateClientInfo("address", address)
                              onShowAddressSuggestionsChange(false)
                            }}
                            onDismiss={() => onShowAddressSuggestionsChange(false)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Right Column - Contact Information */}
                    <div className="space-y-4">
                      <h4 className="text-base font-normal text-slate-800 border-b border-slate-200 pb-2">
                        Contact Information
                      </h4>

                      <div className="grid gap-2">
                        <Label htmlFor="client-title" className="text-slate-700 font-light">
                          Title
                        </Label>
                        <Select
                          value={data.clientInfo.clientTitle}
                          onValueChange={(value: string) => updateClientInfo("clientTitle", value)}
                        >
                          <SelectTrigger
                            className="font-light"
                          >
                            <SelectValue placeholder="Select title (required)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mr.">Mr.</SelectItem>
                            <SelectItem value="Ms.">Ms.</SelectItem>
                            <SelectItem value="Mrs.">Mrs.</SelectItem>
                            <SelectItem value="Dr.">Dr.</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-4 grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="first-name" className="text-slate-700 font-light">
                            First Name *
                          </Label>
                          <Input
                            id="first-name"
                            value={data.clientInfo.firstName}
                            onChange={(e) => updateClientInfo("firstName", e.target.value)}
                            placeholder="Enter first name"
                            className="font-light"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="last-name" className="text-slate-700 font-light">
                            Last Name *
                          </Label>
                          <Input
                            id="last-name"
                            value={data.clientInfo.lastName}
                            onChange={(e) => updateClientInfo("lastName", e.target.value)}
                            placeholder="Enter last name"
                            className="font-light"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="client-email" className="text-slate-700 font-light">
                          Email *
                        </Label>
                        <Input
                          id="client-email"
                          type="email"
                          value={data.clientInfo.email}
                          onChange={(e) => updateClientInfo("email", e.target.value)}
                          placeholder="Enter email address"
                          className={`font-light ${
                            data.clientInfo.email && !isValidEmail(data.clientInfo.email)
                              ? "border-amber-500 bg-amber-50"
                              : ""
                          }`}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="client-phone" className="text-slate-700 font-light">
                          Phone
                        </Label>
                        <Input
                          id="client-phone"
                          type="tel"
                          value={data.clientInfo.phone}
                          onChange={(e) => updateClientInfo("phone", formatPhoneNumber(e.target.value))}
                          placeholder="Enter phone number"
                          className="font-light"
                        />
                        {phoneSuggestions.length > 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onShowPhoneSuggestionsChange(!showPhoneSuggestions)}
                            className="text-xs flex items-center gap-1 mt-1 font-light"
                          >
                            {showPhoneSuggestions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            Suggestions
                          </Button>
                        )}
                        {showPhoneSuggestions && (
                          <FieldSuggestions
                            type="phone"
                            suggestions={phoneSuggestions}
                            onSelect={(phone) => {
                              updateClientInfo("phone", phone)
                              onShowPhoneSuggestionsChange(false)
                            }}
                            onDismiss={() => onShowPhoneSuggestionsChange(false)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {section.id === "project" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="project-name" className="text-slate-700 font-light">
                          Project Name *
                        </Label>
                        <Input
                          id="project-name"
                          value={data.projectInfo.name}
                          onChange={(e) => updateProjectInfo("name", e.target.value)}
                          placeholder="Enter project name"
                          className="font-light"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="project-location" className="text-slate-700 font-light">
                          Project Location
                        </Label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="use-company-address"
                              checked={data.projectInfo.useCompanyAddress}
                              onCheckedChange={(checked: boolean) => updateProjectInfo("useCompanyAddress", checked)}
                            />
                            <Label htmlFor="use-company-address" className="text-sm text-slate-600 font-light">
                              Same as company address
                            </Label>
                          </div>
                          {!data.projectInfo.useCompanyAddress ? (
                            <AddressInput
                              value={data.projectInfo.location}
                              onChange={(location) => updateProjectInfo("location", location)}
                              placeholder="Enter project location"
                              completed={!!data.projectInfo.location}
                            />
                          ) : (
                            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-sm text-slate-700 font-light">
                              {data.clientInfo.address || "Enter company address first"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {section.id === "services" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="h-5 w-5 text-slate-600" strokeWidth={1} />
                      <h4 className="text-base font-normal text-slate-800">Available Services</h4>
                    </div>
                    <ServiceMenu
                      services={services}
                      selectedServices={data.selectedServices}
                      onServicesChange={(services) => updateData("selectedServices", services)}
                      proposalType={data.proposalType}
                    />
                  </div>
                )}
                {section.id === "reimbursables" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calculator className="h-5 w-5 text-slate-600" strokeWidth={1} />
                      <h4 className="text-base font-normal text-slate-800">Travel & Expense Calculator</h4>
                    </div>
                    <ReimbursablesCalculator
                      data={reimbursables}
                      onChange={onReimbursablesChange}
                      projectAddress={getProjectAddress()}
                      isReimbursablesNeeded={isReimbursablesNeeded}
                      onReimbursablesNeededChange={setIsReimbursablesNeeded}
                    />
                  </div>
                )}
                {section.id === "generate" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-slate-600" strokeWidth={1} />
                      <h4 className="text-base font-normal text-slate-800">PDF Generation & Configuration</h4>
                    </div>
                    <PDFGenerator 
                      proposalData={data} 
                      services={services} 
                      reimbursables={reimbursables} 
                      isReimbursablesNeeded={isReimbursablesNeeded}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
