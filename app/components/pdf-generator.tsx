"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye } from "lucide-react"
import type { ProposalData, HourlyRates, ReimbursableData } from "../types/proposal"

interface PDFGeneratorProps {
  proposalData: ProposalData
  services: any[]
  reimbursables: ReimbursableData
  isReimbursablesNeeded: boolean
}

export default function PDFGenerator({ proposalData, services, reimbursables, isReimbursablesNeeded }: PDFGeneratorProps) {
  const [hourlyRates, setHourlyRates] = useState<HourlyRates>({
    principal: 325,
    srAssociate: 300,
    srProjectConsultant: 275,
    srConsultant: 250,
    consultant: 200,
    srTechnician: 150,
    fieldTechnician: 135,
    cad: 135,
    administrative: 90,
  })

  const [riskAllocationAmount, setRiskAllocationAmount] = useState<string>("1000000")

  const [isGenerating, setIsGenerating] = useState(false)

  // Company info
  const companyInfo = {
    name: "Hixson Consultants",
    corporatePhone: "205-663-2220",
    tennesseePhone: "615-540-9977",
    address: "947 1st Avenue West, Alabaster, Alabama 35007",
    tagline: "Building Envelope Services",
  }

  const riskAllocationOptions = [
    { value: "1000000", label: "$1,000,000", display: "$1,000,000" },
    { value: "500000", label: "$500,000", display: "$500,000" },
    { value: "100000", label: "$100,000", display: "$100,000" },
  ]

  const getPaymentTypeText = (paymentType: string) => {
    const paymentTypeMap = {
      hourly: "Hourly Services Proposal",
      "hourly-nte": "Hourly Not-to-Exceed Proposal",
      "cost-of-services": "Cost of Services Proposal",
      "lump-sum": "Lump Sum Fee Proposal",
    }
    return paymentTypeMap[paymentType as keyof typeof paymentTypeMap] || "Cost of Services Proposal"
  }

  const shouldIncludeReimbursables = (paymentType: string) => {
    return ["hourly", "hourly-nte", "cost-of-services"].includes(paymentType)
  }

  const getProposalTypeText = (proposalType: string) => {
    const proposalTypeMap = {
      "water-testing": "Water Testing Services",
      "visual-assessment": "Visual Assessment Services",
    }
    return proposalTypeMap[proposalType as keyof typeof proposalTypeMap] || "Building Envelope Consulting Services"
  }

  const getRiskAllocationDisplay = () => {
    const option = riskAllocationOptions.find((opt) => opt.value === riskAllocationAmount)
    return option?.display || "$1,000,000"
  }

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      let yPosition = 20
      let currentPage = 1
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const leftMargin = 20
      const rightMargin = 20
      const contentWidth = pageWidth - leftMargin - rightMargin
      const maxY = pageHeight - 30

      // Helper function to check if we need a new page
      const checkNewPage = (spaceNeeded = 15) => {
        if (yPosition + spaceNeeded > maxY) {
          doc.addPage()
          currentPage++
          yPosition = 20

          // Add page header for subsequent pages
          if (currentPage > 1) {
            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.text("HCI Building Envelope Services Proposal", leftMargin, 15)
            doc.text(`Page ${currentPage}`, pageWidth - rightMargin - 20, 15)

            const projectLocation = proposalData.projectInfo.useCompanyAddress
              ? proposalData.clientInfo.address
              : proposalData.projectInfo.location

            doc.setFont("helvetica", "normal")
            doc.text(`${proposalData.projectInfo.name} – ${projectLocation}`, leftMargin, 25)
            doc.text(proposalData.header.date, pageWidth - rightMargin - 30, 25)

            doc.setLineWidth(0.5)
            doc.line(leftMargin, 30, pageWidth - rightMargin, 30)
            yPosition = 40
          }
        }
      }

      // Helper function to add text with proper wrapping and consistent margins
      const addText = (text: string, fontSize = 10, isBold = false, align = "left") => {
        checkNewPage()

        doc.setFontSize(fontSize)
        doc.setFont("helvetica", isBold ? "bold" : "normal")

        const lines = doc.splitTextToSize(text, contentWidth)

        if (align === "center") {
          doc.text(lines, pageWidth / 2, yPosition, { align: "center" })
        } else if (align === "right") {
          doc.text(lines, pageWidth - rightMargin, yPosition, { align: "right" })
        } else {
          doc.text(lines, leftMargin, yPosition)
        }

        yPosition += lines.length * (fontSize * 0.4) + 3
      }

      // Helper function to add mixed text with bold formatting - completely rewritten
      const addMixedText = (text: string, fontSize = 10, align = "left") => {
        checkNewPage()

        doc.setFontSize(fontSize)

        // Remove ** markers and track which parts should be bold
        const processedText = text.replace(/\*\*/g, "")

        // Find bold sections by tracking ** positions in original text
        const boldSections = []
        let searchPos = 0
        const textPos = 0

        while (searchPos < text.length) {
          const startMarker = text.indexOf("**", searchPos)
          if (startMarker === -1) break

          const endMarker = text.indexOf("**", startMarker + 2)
          if (endMarker === -1) break

          // Calculate positions in processed text (without markers)
          const boldStart = startMarker - boldSections.length * 4 // Each ** pair removes 4 chars
          const boldEnd = endMarker - boldSections.length * 4 - 2 // -2 for the opening **

          boldSections.push({ start: boldStart, end: boldEnd })
          searchPos = endMarker + 2
        }

        // Split processed text into lines that fit
        const lines = doc.splitTextToSize(processedText, contentWidth)

        // Render each line
        lines.forEach((line, lineIndex) => {
          let currentX = leftMargin
          if (align === "center") {
            currentX = pageWidth / 2 - doc.getTextWidth(line) / 2
          } else if (align === "right") {
            currentX = pageWidth - rightMargin - doc.getTextWidth(line)
          }

          // Find the character position of this line in the full text
          let lineStartPos = 0
          for (let i = 0; i < lineIndex; i++) {
            lineStartPos += lines[i].length
          }
          const lineEndPos = lineStartPos + line.length

          // Check if any bold sections intersect with this line
          let currentPos = 0

          while (currentPos < line.length) {
            // Find if current position should be bold
            const absolutePos = lineStartPos + currentPos
            const isBold = boldSections.some((section) => absolutePos >= section.start && absolutePos < section.end)

            // Find the end of the current formatting (bold or normal)
            let endPos = currentPos + 1
            while (endPos < line.length) {
              const nextAbsolutePos = lineStartPos + endPos
              const nextIsBold = boldSections.some(
                (section) => nextAbsolutePos >= section.start && nextAbsolutePos < section.end,
              )
              if (nextIsBold !== isBold) break
              endPos++
            }

            // Render the text segment
            const segment = line.substring(currentPos, endPos)
            doc.setFont("helvetica", isBold ? "bold" : "normal")
            doc.text(segment, currentX, yPosition)

            // Move X position for next segment
            currentX += doc.getTextWidth(segment)
            currentPos = endPos
          }

          yPosition += fontSize * 0.4 + 1
        })

        yPosition += 2
      }

      // Helper function to add space
      const addSpace = (space = 5) => {
        yPosition += space
      }

      // First page header
      addText("Hixson Consultants", 18, true, "center")
      addText("Building Envelope Services", 12, false, "center")
      addSpace(3)
      addText(
        `Corporate: ${companyInfo.corporatePhone} | Tennessee: ${companyInfo.tennesseePhone}`,
        10,
        false,
        "center",
      )
      addText(companyInfo.address, 10, false, "center")
      addSpace(10)

      // Horizontal line
      doc.setLineWidth(0.5)
      doc.line(leftMargin, yPosition, pageWidth - rightMargin, yPosition)
      addSpace(10)

      // Date
      addText(proposalData.header.date, 10, false, "right")
      addSpace(5)

      // Title
      addText(proposalData.header.proposalTitle, 14, true, "center")
      addSpace(10)

      // Project Information
      const projectLocation = proposalData.projectInfo.useCompanyAddress
        ? proposalData.clientInfo.address
        : proposalData.projectInfo.location

      addText(proposalData.projectInfo.name, 12, true)
      addText(projectLocation, 10)
      addSpace(10)

      // Client Information
      addText("Contact / Proposal Addressed To:", 12, true)
      addSpace(3)
      addText(proposalData.clientInfo.companyName, 10, true)
      addText(`${proposalData.clientInfo.firstName} ${proposalData.clientInfo.lastName}`, 10)
      addText(proposalData.clientInfo.address, 10)
      addText(`Phone: ${proposalData.clientInfo.phone}`, 10)
      addText(`Email: ${proposalData.clientInfo.email}`, 10)
      addSpace(10)

      // Introduction Section
      const cityState = extractCityState(proposalData.clientInfo.address)
      const servicesText = getSelectedServicesText()
      const paymentTypeText = getPaymentTypeText(proposalData.paymentType)
      const proposalTypeText = getProposalTypeText(proposalData.proposalType)

      addText(`${proposalData.clientInfo.clientTitle} ${proposalData.clientInfo.lastName},`, 10)
      addSpace(3)

      const introText = `We appreciate this opportunity to submit our Hixson Consultants, Inc., HCI, project-specific proposal for requested **${proposalTypeText}**. HCI's services include **${servicesText}** for **${proposalData.clientInfo.companyName}** in **${cityState}**. We are submitting our **${paymentTypeText}** in keeping with your request to assist with applied technical building envelope services.`
      addMixedText(introText, 10)
      addSpace(10)

      // Services Section
      addText("Proposed Services", 12, true)
      addSpace(5)

      const selectedServices = services.filter((service) =>
        proposalData.selectedServices.some((selected) => selected.id === service.id),
      )

      const basicServices = selectedServices.filter((service) => service.serviceType === "basic")
      const additionalServices = selectedServices.filter((service) => service.serviceType === "additional")

      let serviceIndex = 1

      // Basic Services
      if (basicServices.length > 0) {
        addText("Basic Services", 11, true)
        addSpace(3)

        basicServices.forEach((service) => {
          const selectedService = proposalData.selectedServices.find((s) => s.id === service.id)

          addText(`${serviceIndex}. ${service.name}`, 11, true)

          if (selectedService?.price && selectedService.price > 0) {
            addText(`$${selectedService.price.toLocaleString()}`, 10, true)
          }

          const description = selectedService?.description || service.description
          addText(description, 10)
          addSpace(5)
          serviceIndex++
        })
      }

      // Additional Services
      if (additionalServices.length > 0) {
        addText("Additional Services", 11, true)
        addSpace(3)

        additionalServices.forEach((service) => {
          const selectedService = proposalData.selectedServices.find((s) => s.id === service.id)

          addText(`${serviceIndex}. ${service.name}`, 11, true)

          if (selectedService?.price && selectedService.price > 0) {
            addText(`$${selectedService.price.toLocaleString()}`, 10, true)
          }

          const description = selectedService?.description || service.description
          addText(description, 10)
          addSpace(5)
          serviceIndex++
        })
      }

      // Total Service Cost
      const totalServiceCost = proposalData.selectedServices.reduce((sum, service) => sum + (service.price || 0), 0)
      if (totalServiceCost > 0) {
        addSpace(5)
        addText(`Total Service Cost: $${totalServiceCost.toLocaleString()}`, 12, true)
        addSpace(10)
      }

      // Qualifications and Limitations Section
      addText("Qualifications and Limitations of Services", 12, true)
      addSpace(5)

      // Calculate reimbursables
      const calculateReimbursables = () => {
        let mileageTotal = 0
        if (reimbursables.mileage.isFlying) {
          mileageTotal = reimbursables.mileage.flightCost / 0.9
        } else {
          const roundTripMiles = reimbursables.mileage.miles * 2
          mileageTotal = (roundTripMiles * 0.7) / 0.9
        }

        const mealsTotal = reimbursables.meals.count * 25
        const hotelTotal = reimbursables.hotel.cost / 0.9
        const equipmentTotal = reimbursables.equipment.cost / 0.9
        const shippingTotal = reimbursables.shipping.cost / 0.9
        const grandTotal = mileageTotal + mealsTotal + hotelTotal + equipmentTotal + shippingTotal

        return {
          travel: mileageTotal,
          hotel: hotelTotal,
          meals: mealsTotal,
          equipment: equipmentTotal,
          shipping: shippingTotal,
          total: grandTotal,
        }
      }

      // Qualifications text with proper bold formatting
      const qualifications = [
        `1. HCI is offering our Applied Technical Consulting Services on a ${getPaymentTypeText(proposalData.paymentType)} based upon experience and historical costs of services. An estimated range for the cost of services may or may not be possible to create with limited information.${shouldIncludeReimbursables(proposalData.paymentType) ? " Estimated reimbursable expenses are not included and will be invoiced at cost plus **10% markup**." : ""} Costs of expenses are estimated to the best of our ability but, if actual expenses are more than the estimate, the overage will be invoiced.`,
      ]

      // Only add reimbursables section if reimbursables are needed
      if (shouldIncludeReimbursables(proposalData.paymentType)) {
        const reimbursableAmounts = calculateReimbursables()
        qualifications.push(
          `**A.** The reimbursable **$${reimbursableAmounts.total.toFixed(0)}** expense cost breakdown is as follows:\n **1)** Travel-related expenses (portal to portal, mileage) - **$${reimbursableAmounts.travel.toFixed(0)}**\n **2)** Hotel - **$${reimbursableAmounts.hotel.toFixed(0)}**\n **3)** Meals - **$${reimbursableAmounts.meals.toFixed(0)}**\n **4)** Equipment - **$${reimbursableAmounts.equipment.toFixed(0)}**\n **5)** Shipping/Transport of Equipment - **$${reimbursableAmounts.shipping.toFixed(0)}**`
        )
      }

      qualifications.push(
        `If fuel costs escalate more than **15%**, HCI reserves the right to pass on the increase. Any work over the services quoted above will be invoiced at our regular Hourly Fee rates below.`,
        `2. When listed services have been completed, Additional Services will be billed at an hourly rate (rates listed below) unless an Additional Services Proposal is requested and approved.`
      )

      qualifications.forEach((text) => {
        addMixedText(text, 10)
        addSpace(3)
      })

      // Hourly Rates Section
      addSpace(5)
      addText("Hourly Rates for Additional Services:", 12, true)
      addSpace(5)

      const rateEntries = [
        ["Principal", hourlyRates.principal],
        ["Sr. Associate", hourlyRates.srAssociate],
        ["Sr. Project Consultant", hourlyRates.srProjectConsultant],
        ["Sr. Consultant", hourlyRates.srConsultant],
        ["Consultant", hourlyRates.consultant],
        ["Sr. Technician", hourlyRates.srTechnician],
        ["Field Technician", hourlyRates.fieldTechnician],
        ["CAD", hourlyRates.cad],
        ["Administrative", hourlyRates.administrative],
      ]

      // Format rates in two columns like the preview
      const leftColumn = rateEntries.slice(0, 5)
      const rightColumn = rateEntries.slice(5)
      const columnWidth = contentWidth / 2 - 10

      checkNewPage(leftColumn.length * 4 + 10)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      // Left column
      let leftY = yPosition
      leftColumn.forEach(([title, rate]) => {
        doc.text(`${title}:`, leftMargin, leftY)
        doc.setFont("helvetica", "bold")
        doc.text(`$${rate}/hr`, leftMargin + 80, leftY)
        doc.setFont("helvetica", "normal")
        leftY += 4
      })

      // Right column
      let rightY = yPosition
      rightColumn.forEach(([title, rate]) => {
        doc.text(`${title}:`, leftMargin + columnWidth + 20, rightY)
        doc.setFont("helvetica", "bold")
        doc.text(`$${rate}/hr`, leftMargin + columnWidth + 100, rightY)
        doc.setFont("helvetica", "normal")
        rightY += 4
      })

      yPosition = Math.max(leftY, rightY) + 5

      addMixedText(
        "Should this work be performed when HCI hourly fee rates have changed, HCI reserves the right to invoice at the higher rate. Reimbursable expenses are not included and will be invoiced at cost plus **10% markup**. Additional Services expenses are billed in addition to hourly rates.",
        10,
      )
      addSpace(3)
      addMixedText(
        "Additional Services may be required or requested because of discovery of concealed conditions, the non-performance of others or conditions of the work not previously considered, additional site visits and additional meetings, excessive correspondence or lengthy conference calls (exceeding a quarter of an hour duration).",
        10,
      )

      // Closing Section
      addSpace(10)
      addText(
        "We welcome discussing our services in detail at your convenience. Should further information be required, please contact our office. May we have your valued business, and continue to build a strong, successful, and mutually beneficial relationship?",
        10,
      )
      addSpace(5)
      addText("Sincerely,", 10)
      addText("Hixson Consultants, Inc.", 10)
      addSpace(5)
      addText("Ben Hixson", 10, true)
      addText("Ben Hixson, Principal / CIT, CCS, CCCA, QCxP, Professional IIBEC Member", 10)
      addText("Roofing Wall Systems Waterproofing Thermography Commissioning", 10)
      addSpace(5)
      addText(
        "cc: Tony Wright, Sr. Associate, Professional IIBEC Member, Roofing, Wall Systems, Waterproofing and Thermography",
        10,
      )
      addText("Greg Cunningham, Sr. Project Consultant, Glazing, Fenestration Systems, Wall Assemblies", 10)
      addText("Mike Ray, Sr. Project Consultant, Professional IIBEC Member", 10)
      addText("Tyler Mayhew, Consultant, CxA + BE, BECxP, CIT, CEI-TN, Professional IIBEC Member", 10)
      addText("Tony Fields, Sr. Field Technician, Professional IIBEC Member", 10)
      addText("Wesley Paul, Field Technician, Professional IIBEC Member", 10)

      // Agreement Page
      doc.addPage()
      currentPage++
      yPosition = 20

      // Agreement Page Header
      addText("AGREEMENT", 14, true, "center")
      addSpace(15)

      // Agreement Text
      const agreementText = `HCI is offering our Applied Technical Consulting Services on an **${getPaymentTypeText(proposalData.paymentType)}** basis based upon experience and historical cost of services. Reimbursable expenses are not included and will be invoiced at cost plus **10% markup**. Any work over the services quoted above will be billed at our regular Hourly Fee rates cited above. HCI will not commence work on this project without a Signed Agreement. I have read and agree to the Terms and Conditions attached.`
      addMixedText(agreementText, 10)
      addSpace(15)

      // Agreed to by section
      addText("Agreed to by:", 12, true)
      addSpace(10)

      // Signature fields with proper spacing
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const fieldWidth = (contentWidth - 40) / 2

      // First row - Name and Email
      doc.text("Printed Name", leftMargin, yPosition)
      doc.text("E-mail Address", leftMargin + fieldWidth + 40, yPosition)
      yPosition += 5
      doc.setLineWidth(0.5)
      doc.line(leftMargin, yPosition, leftMargin + fieldWidth, yPosition)
      doc.line(leftMargin + fieldWidth + 40, yPosition, pageWidth - rightMargin, yPosition)
      yPosition += 15

      // Second row - Signature and Phone
      doc.text("Signature", leftMargin, yPosition)
      doc.text("Telephone Number", leftMargin + fieldWidth + 40, yPosition)
      yPosition += 5
      doc.setLineWidth(0.5)
      doc.line(leftMargin, yPosition, leftMargin + fieldWidth, yPosition)
      doc.line(leftMargin + fieldWidth + 40, yPosition, pageWidth - rightMargin, yPosition)
      yPosition += 15

      // Third row - Title and Fax
      doc.text("Title", leftMargin, yPosition)
      doc.text("Fax Number", leftMargin + fieldWidth + 40, yPosition)
      yPosition += 5
      doc.setLineWidth(0.5)
      doc.line(leftMargin, yPosition, leftMargin + fieldWidth, yPosition)
      doc.line(leftMargin + fieldWidth + 40, yPosition, pageWidth - rightMargin, yPosition)
      yPosition += 15

      // Date field
      doc.text("Date", leftMargin, yPosition)
      yPosition += 5
      doc.line(leftMargin, yPosition, leftMargin + 100, yPosition)
      yPosition += 25

      // Accounts Payable section
      addText("HCI Invoices will be distributed via e-mail. Please provide contact for Accounts Payable below.", 10)
      addSpace(10)

      // AP Contact fields
      doc.text("Printed Name of Person Authorized for Payment", leftMargin, yPosition)
      doc.text("E-mail Address", leftMargin + fieldWidth + 40, yPosition)
      yPosition += 5
      doc.setLineWidth(0.5)
      doc.line(leftMargin, yPosition, leftMargin + fieldWidth, yPosition)
      doc.line(leftMargin + fieldWidth + 40, yPosition, pageWidth - rightMargin, yPosition)
      yPosition += 20

      // Billing Address section
      addText("Billing Address:", 11, true)
      addSpace(10)

      // Address fields
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Street or PO Box", leftMargin, yPosition)
      doc.text("Direct Telephone Number", leftMargin + fieldWidth + 40, yPosition)
      yPosition += 5
      doc.setLineWidth(0.5)
      doc.line(leftMargin, yPosition, leftMargin + fieldWidth, yPosition)
      doc.line(leftMargin + fieldWidth + 40, yPosition, pageWidth - rightMargin, yPosition)
      yPosition += 15

      doc.text("City, State, Zip Code", leftMargin, yPosition)
      doc.text("Fax Number", leftMargin + fieldWidth + 40, yPosition)
      yPosition += 5
      doc.setLineWidth(0.5)
      doc.line(leftMargin, yPosition, leftMargin + fieldWidth, yPosition)
      doc.line(leftMargin + fieldWidth + 40, yPosition, pageWidth - rightMargin, yPosition)

      // Terms and Conditions Page
      doc.addPage()
      currentPage++
      yPosition = 20

      // Terms and Conditions Header
      addText("CONSULTING SERVICES TERMS AND CONDITIONS", 14, true, "center")
      addSpace(15)

      // Full Terms and Conditions Text
      const consultingTerms = [
        "I.  COMPENSATION",
        "A. Fee compensation to Hixson Consultants, Inc. hereafter also HCI, for Basic Services shall be invoiced monthly based on actual hours expended by HCI at our prevailing rates.",
        "B. The budget amount represents the estimated cost to our Client limited to the Basic Services (excluding any / all reimbursable expenses) as outlined in the agreement and is conditional upon all of the terms and conditions stated herein.  HCI shall endeavor to provide the Basic Services within the estimated budget and shall also endeavor to notify the Client prior to exceeding this budget; however, in all circumstances, the Client agrees and accepts to compensate HCI for all hours expended in the interest of the project.",
        "C. Reimbursable Expenses are in addition to fee compensation for services and include actual expenditures made/incurred by HCI and/or its agents in the interest of the project and resulting directly from the performance of services under the Agreement.  Unless prepaid, reimbursable expenses are invoiced at cost plus 10% and include but are not limited to:",
        "1. Portal-to-portal travel plus subsistence.",
        "2. Long-distance telephone, cellular telephone use, telex, telecopy.",
        "3. Expense of courier service, shipping, postage, and delivery service.",
        "4. Expense of any / all reproduction of drawings, specifications, photographs, calculations, reports, correspondence, expense backup, etc.",
        "5. Fees and expenses of a Registered Professional Consulting Engineer, Registered Architect, or Construction Manager.",
        "6. Cost of staging, scaffolding, ladders, or other equipment.",
        "D. Compensation to HCI for the performance of authorized Additional Services where the scope is defined may be a lump sum amount if mutually agreed upon in advance and shall be in addition to the Basic Services fee amount or shall be otherwise billed at our prevailing hourly rates.",
        "E. Overtime requested by the Client of HCI in an effort to recover and/or to maintain the overall schedule due to slippage by others shall be compensated at 1 ½ times the above rates for time on weekdays and Saturdays and at 2 times the standard hourly rates for Sundays and holidays.",
        "F. Portal to Portal travel time is chargeable from the scheduled departure time to the scheduled return arrival time.  Time zone differences will be adjusted to actual hours.  Non-travel and after-hours time out of town on overnight and/or extended trips are not chargeable.",
        "II. PAYMENT",
        "A. Payment on account of authorized services and/or expenses shall be made monthly in the amount of HCI's monthly invoice for services performed and/or expenses incurred.  Payment of HCI's invoices is not contingent upon the Client's receipt of funds.  The invoice shall be considered past due if not paid within 30 days of the invoice date.  In lieu of a signed copy, authorization to proceed, or payment of Hixson Consultants, Inc., HCI, invoice(s) constitutes acceptance of this proposal.",
        "B. Client shall notify HCI in writing within twenty (20) days from the invoice of any incorrect or disputed item on the invoice or such invoice shall be deemed complete and correct and fully due and owing.",
        "C. If this assignment is suspended for more than one (1) month or abandoned in whole or in part, by the Client or Third Party, HCI shall be paid within 30 days its compensation for services performed and expenses incurred prior to receipt of written notice of such suspension or abandonment.",
        "D. Payments are due and payable upon receipt of the invoice.  The Client agrees to pay invoices in a timely manner.  On the thirty-fifth (35th) day following the invoice date and on each successive thirtieth (30th) day thereafter, a late charge in the amount of one and one-half percent (1.50 %) may be added to and become due on all unpaid principal amounts due.  Finance charges accrue from the original date of the invoice.  Payment received will first be applied to any accrued late fees and then to the balance of the original invoice(s).",
        "E. In the event that payment is not made, the Client agrees to pay all collection costs and expenses incurred by HCI to collect the amount due including a reasonable attorney's fee whether or not the suit is instituted.",
        "III. GENERAL PROVISIONS",
        "A. Record of expenses and hourly rate-based services performed will be kept on the basis of General Accepted Accounting Principles (GAAP) and will be available to the Client in HCI's office during normal business hours.",
        "B. Reports, photos, specifications, drawings, calculations, and related documents prepared by HCI are for the exclusive use of the Client for this project.  Client's and HCI's responsibility and liability with respect to these drawings and documents are limited solely to this project.",
        "C. This agreement may be terminated by either party upon seven (7) days' written notice should the other party substantially fail to perform in accordance with its provisions through no substantial fault of the other.  In the event of termination, HCI shall be paid within 30 days its compensation for services performed to the termination date, including reimbursable expenses, in full.  Upon receipt by HCI of said payment in full, HCI shall deliver to Client one reproducible copy of documents prepared by HCI to the termination date.  HCI shall have no responsibility whatsoever for subsequent changes or additions and/or for the use of these documents by Client and/or by others.",
        "D. Client agrees that HCI is entitled to rely on it exclusively for the accuracy and timeliness of the information it provides HCI with respect to the project unless HCI knows or has reason to believe such information is in error. The Client shall provide HCI with drawings, specifications, reports, field measurements, surveys, warranty coverage, leak history, and any other requested data that may be obtainable in order for HCI to perform its services. When advised by HCI, investigation of conditions concealed by existing finishes shall be authorized and paid for by the Client.  Where investigation is NOT authorized, HCI shall not be responsible for the condition of the existing structure (except where verification can be made by simple visual discovery), or envelope performance.",
        "E. HCI is providing only technical consulting services in an advisory capacity under this Agreement and is not providing (nor profiting from) any products, materials, shop fabrication, and/or field installation.  It is understood and agreed that the final responsibility for checking and verifying the accuracy of and for use of all documents/recommendations provided by HCI under this Agreement is and shall remain solely with the Client.",
        "F. The total extent of responsibility and liability for any and all errors and/or omissions by HCI in work provided under this Agreement shall be limited to insurance coverage. Client agrees and accepts that it is prohibited as a condition of this Agreement from making deductions or 'back charging' HCI's compensation for any reason whatsoever except for proven HCI errors and omissions.  HCI assumes no responsibility for material costs and/or labor costs by others due to services provided by HCI under this Agreement.  We can provide for a charge of $1 Million Errors and Omissions (E&O) insurance for our work and more coverage than this is specifically excluded from the terms of our Agreement unless cited as a line-item additional cost.  In recognition of the relative risks, rewards, and benefits of the project to both the Client and HCI, except for HCI errors and omissions the Client assumes entire responsibility and liability for any and all damage or injury of any kind or nature whatsoever to all persons and to all property caused by, resulting from, arising out of, or occurring in connection with the work and/or HCI's services performed under the Agreement; and if any persons shall make a claim for any damage or injury as hereinabove described, the Client agrees to indemnify and hold HCI harmless from and against any and all loss, expense, damage or injury that may result of any such claim.",
        "HIXSON CONSULTANTS, INC. ASSUMES NO CONSEQUENTIAL DAMAGES AND LIMITS ANY OTHER DAMAGES WHATSOEVER TO THE PROVIDED INSURANCE COVERAGE.  HIXSON CONSULTANTS, INC. DISCLAIMS ANY WARRANTY OF FITNESS FOR A PARTICULAR PURPOSE AND ANY AND ALL OTHER CONSEQUENTIAL DAMAGES.  HCI OFFERS \"BEST EFFORT-GOOD FAITH\" SERVICES INTENDED TO STOP MOISTURE INTRUSION AND CONDENSATION FORMATION.",
        "G. It is understood and agreed that the Agreement is conditional, based upon a comprehensive schedule mutually agreed upon prior to HCI beginning work, for services to be provided by HCI.  Any deviation from this schedule resulting from any action or inaction by other than HCI may result in Additional Service costs and/or HCI being unable to recover to maintain said overall schedule.  Such inability to recover shall not constitute just cause for termination of the Agreement by Client.",
        "H. HCI shall endeavor to maintain scheduled deliverables; however, it is understood and agreed that the only liability assumed by HCI for its nonperformance, resulting in failure to maintain schedule, shall be absolutely limited to providing/increasing over time and/or staff at no additional cost to Client, regardless of circumstances outside HCI control and/or Client's exposure.",
        "I. HCI reports are for the exclusive use of our Client and are not intended for any other purpose.  Reports are based on the information available to us at the time of the report.  Should additional information become available at a later date, we reserve the right to determine the impact, if any, the new information may have on our discovery and recommendations and to revise our opinions and conclusions if necessary and warranted.",
        "J. HCI maintains statutory Employee's Insurance, including Worker's Compensation, Employer's Liability, and Comprehensive General Liability, and will provide a current Certificate of Insurance to our client upon request.",
        "K. HCI is an independent contractor in the performance of its duties under the Agreement.  The detailed methods and manner of conducting the services shall be under the complete control and direction of HCI.",
        "L. All persons performing any part of the services will be employees or agents of HCI and not employees or agents of the Client.  HCI will be fully responsible for all applicable federal, state, and local taxes arising out of HCI's activities under this Agreement, including by way of illustration but not by way of limitation, federal income tax, social security tax, unemployment compensation contribution, and all other taxes, contributions, or business license fees as required (excluding any international fees, duties, or taxes).",
        "M. HCI will not have control over, or charge of, and will not be responsible for construction means, methods, techniques, sequences, or procedures, or for safety precautions and programs in connection with the work; these are solely a Client / Contractor responsibility.  HCI will not be responsible for the Client/Contractor's failure to carry out the work in accordance with the project Contract Documents.",
        "N. HCI will not have control over, or charge of, and will not be responsible for acts or omissions of Client or Contractor, Subcontractors or their agents or employees, or of any persons performing services or portions of the work.",
        "O. HCI will comply with all applicable federal and state laws and regulations with respect to non-discrimination and equal opportunity in employment.",
        "P. Client agrees to resolve by mediation any and all disputes, claims, or controversies arising from or related to any work performed for Client by HCI including disputes related to the breadth or scope of this provision.  Mediation shall be conducted in Birmingham, AL.  This provision, however, does not require the mediation of disputes where the fees paid to HCI are less than $10,000 or the amount sought does not exceed $10,000.",
        "Q. The prevailing party in any mediation, or any other final, binding dispute proceeding upon which the parties may agree, may be awarded reasonable attorneys' fees and expenses incurred by such party upon a finding that the other party initiated or continued to assert a clearly frivolous, unreasonable, or groundless claim or defense.",
        "R. The Agreement constitutes the entire Agreement by and between Client and Hixson Consultants, Inc. pertaining to Technical Consulting Services for the referenced assignment.  The terms and conditions herein shall supersede and take precedence over any / all terms and conditions which may be embodied in Client's purchase order or similar documents.  The Agreement may be amended only by mutual agreement in writing signed by both parties and attached hereto.  The laws of the State of Alabama will govern the Agreement."
      ]

      consultingTerms.forEach((text) => {
        addText(text, 10)
        addSpace(3)
      })

      // Save the PDF
      doc.save(`${proposalData.projectInfo.name || "Proposal"}_${proposalData.header.date}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateHourlyRates = (field: keyof HourlyRates, value: number) => {
    setHourlyRates((prev) => ({ ...prev, [field]: value }))
  }

  const extractCityState = (address: string) => {
    if (!address) return ""

    // Split by commas and clean up whitespace
    const parts = address.split(",").map((part) => part.trim())

    if (parts.length >= 3) {
      // Format: "Street, City, State ZIP" or "Street, City, State ZIP, Country"
      const city = parts[parts.length - 3] // Third from end is city
      const stateZipPart = parts[parts.length - 2] // Second from end is "State ZIP"

      // Extract just the state (first word before ZIP)
      const state = stateZipPart.split(" ")[0]

      return `${city}, ${state}`
    } else if (parts.length === 2) {
      // Format: "City, State ZIP"
      const city = parts[0]
      const stateZipPart = parts[1]
      const state = stateZipPart.split(" ")[0]

      return `${city}, ${state}`
    }

    return address // Fallback to original if we can't parse it
  }

  const getSelectedServicesText = () => {
    // Filter to only include basic services, not additional services
    const basicServiceNames = proposalData.selectedServices
      .filter((selectedService) => {
        const originalService = services.find((s) => s.id === selectedService.id)
        return originalService?.serviceType === "basic"
      })
      .map((service) => service.name.toLowerCase())

    if (basicServiceNames.length === 0) return "building envelope consulting services"
    if (basicServiceNames.length === 1) return basicServiceNames[0]
    if (basicServiceNames.length === 2) return basicServiceNames.join(" and ")
    return basicServiceNames.slice(0, -1).join(", ") + ", and " + basicServiceNames[basicServiceNames.length - 1]
  }

  // Create preview content that shows page breaks
  const createPreviewContent = () => {
    const selectedServices = services.filter((service) =>
      proposalData.selectedServices.some((selected) => selected.id === service.id),
    )

    const projectLocation = proposalData.projectInfo.useCompanyAddress
      ? proposalData.clientInfo.address
      : proposalData.projectInfo.location

    const totalServiceCost = proposalData.selectedServices.reduce((sum, service) => sum + (service.price || 0), 0)

    const rateEntries = [
      ["Principal", hourlyRates.principal],
      ["Sr. Associate", hourlyRates.srAssociate],
      ["Sr. Project Consultant", hourlyRates.srProjectConsultant],
      ["Sr. Consultant", hourlyRates.srConsultant],
      ["Consultant", hourlyRates.consultant],
      ["Sr. Technician", hourlyRates.srTechnician],
      ["Field Technician", hourlyRates.fieldTechnician],
      ["CAD", hourlyRates.cad],
      ["Administrative", hourlyRates.administrative],
    ]

    const leftColumn = rateEntries.slice(0, 5)
    const rightColumn = rateEntries.slice(5)

    // Separate basic and additional services for preview
    const basicServices = selectedServices.filter((service) => service.serviceType === "basic")
    const additionalServices = selectedServices.filter((service) => service.serviceType === "additional")

    // Helper function to render bold text in preview
    const renderBoldText = (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*)/g)
      return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>
        }
        return part
      })
    }

    return (
      <div className="space-y-8">
        {/* Page 1 */}
        <div
          className="min-h-[600px] space-y-4 leading-tight"
          style={{ fontFamily: "Arial, sans-serif", fontSize: "10pt", lineHeight: "1.2" }}
        >
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b border-gray-300">
            <div style={{ fontSize: "18pt", fontWeight: "bold" }}>Hixson Consultants</div>
            <div style={{ fontSize: "12pt" }}>Building Envelope Services</div>
            <div style={{ fontSize: "10pt" }}>
              Corporate: {companyInfo.corporatePhone} | Tennessee: {companyInfo.tennesseePhone}
            </div>
            <div style={{ fontSize: "10pt" }}>{companyInfo.address}</div>
          </div>

          {/* Date */}
          <div className="text-right" style={{ fontSize: "10pt" }}>
            {proposalData.header.date}
          </div>

          {/* Title */}
          <div className="text-center" style={{ fontSize: "14pt", fontWeight: "bold" }}>
            {proposalData.header.proposalTitle}
          </div>

          {/* Project Information */}
          <div className="space-y-1">
            <div style={{ fontSize: "12pt", fontWeight: "bold" }}>{proposalData.projectInfo.name}</div>
            <div style={{ fontSize: "10pt" }}>{projectLocation}</div>
          </div>

          {/* Client Information */}
          <div className="space-y-1">
            <div style={{ fontSize: "12pt", fontWeight: "bold" }}>Contact / Proposal Addressed To:</div>
            <div className="space-y-1">
              <div style={{ fontSize: "10pt", fontWeight: "bold" }}>{proposalData.clientInfo.companyName}</div>
              <div style={{ fontSize: "10pt" }}>
                {proposalData.clientInfo.firstName} {proposalData.clientInfo.lastName}
              </div>
              <div style={{ fontSize: "10pt" }}>{proposalData.clientInfo.address}</div>
              <div style={{ fontSize: "10pt" }}>Phone: {proposalData.clientInfo.phone}</div>
              <div style={{ fontSize: "10pt" }}>Email: {proposalData.clientInfo.email}</div>
            </div>
          </div>

          {/* Introduction Section */}
          <div className="space-y-2">
            <div style={{ fontSize: "10pt" }}>
              {proposalData.clientInfo.clientTitle} {proposalData.clientInfo.lastName || "_______"},
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              We appreciate this opportunity to submit our Hixson Consultants, Inc., HCI, project-specific proposal for
              requested <strong>{getProposalTypeText(proposalData.proposalType)}</strong>. HCI's services include{" "}
              <strong>{getSelectedServicesText()}</strong> for{" "}
              <strong>{proposalData.clientInfo.companyName || "_______________"}</strong> in{" "}
              <strong>{extractCityState(proposalData.clientInfo.address) || "_______________,________________"}</strong>
              . We are submitting our <strong>{getPaymentTypeText(proposalData.paymentType)}</strong> in keeping with
              your request to assist with applied technical building envelope services.
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-3">
            <div style={{ fontSize: "12pt", fontWeight: "bold" }}>Proposed Services</div>

            {/* Basic Services */}
            {basicServices.length > 0 && (
              <div className="space-y-3">
                <div style={{ fontSize: "11pt", fontWeight: "bold" }}>Basic Services</div>
                <div className="space-y-3">
                  {basicServices.map((service, index) => {
                    const selectedService = proposalData.selectedServices.find((s) => s.id === service.id)
                    return (
                      <div key={service.id} className="space-y-1">
                        <div style={{ fontSize: "11pt", fontWeight: "bold" }}>
                          {index + 1}. {service.name}
                        </div>
                        {selectedService?.price && selectedService.price > 0 && (
                          <div style={{ fontSize: "10pt", fontWeight: "bold" }}>
                            ${selectedService.price.toLocaleString()}
                          </div>
                        )}
                        <div style={{ fontSize: "10pt", lineHeight: "1.2" }}>
                          {selectedService?.description || service.description}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Additional Services */}
            {additionalServices.length > 0 && (
              <div className="space-y-3">
                <div style={{ fontSize: "11pt", fontWeight: "bold" }}>Additional Services</div>
                <div className="space-y-3">
                  {additionalServices.map((service, index) => {
                    const selectedService = proposalData.selectedServices.find((s) => s.id === service.id)
                    const serviceNumber = basicServices.length + index + 1
                    return (
                      <div key={service.id} className="space-y-1">
                        <div style={{ fontSize: "11pt", fontWeight: "bold" }}>
                          {serviceNumber}. {service.name}
                        </div>
                        {selectedService?.price && selectedService.price > 0 && (
                          <div style={{ fontSize: "10pt", fontWeight: "bold" }}>
                            ${selectedService.price.toLocaleString()}
                          </div>
                        )}
                        <div style={{ fontSize: "10pt", lineHeight: "1.2" }}>
                          {selectedService?.description || service.description}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Total Service Cost */}
          {totalServiceCost > 0 && (
            <div style={{ fontSize: "12pt", fontWeight: "bold", marginTop: "1em" }}>
              Total Service Cost: ${totalServiceCost.toLocaleString()}
            </div>
          )}

          {/* Qualifications and Limitations Section */}
          <div className="space-y-3">
            <div style={{ fontSize: "12pt", fontWeight: "bold" }}>Qualifications and Limitations of Services</div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              1. HCI is offering our Applied Technical Consulting Services on a{" "}
              {getPaymentTypeText(proposalData.paymentType)} based upon experience and historical costs of services. An
              estimated range for the cost of services may or may not be possible to create with limited information.
              {shouldIncludeReimbursables(proposalData.paymentType) && " Estimated reimbursable expenses are not included and will be invoiced at cost plus "}
              {shouldIncludeReimbursables(proposalData.paymentType) && renderBoldText("**10% markup**")}
              {shouldIncludeReimbursables(proposalData.paymentType) && ". "}
              Costs of expenses are estimated to the best of our ability but, if actual expenses are more than the estimate, the overage will be invoiced.
            </div>
            {shouldIncludeReimbursables(proposalData.paymentType) && (
              <div style={{ fontSize: "10pt", lineHeight: "1.4", marginLeft: "20px" }}>
                <div style={{ fontWeight: "bold" }}>
                  A. The reimbursable ${(() => {
                    // Calculate reimbursables for preview
                    let mileageTotal = 0
                    if (reimbursables.mileage.isFlying) {
                      mileageTotal = reimbursables.mileage.flightCost / 0.9
                    } else {
                      const roundTripMiles = reimbursables.mileage.miles * 2
                      mileageTotal = (roundTripMiles * 0.7) / 0.9
                    }
                    const mealsTotal = reimbursables.meals.count * 25
                    const hotelTotal = reimbursables.hotel.cost / 0.9
                    const equipmentTotal = reimbursables.equipment.cost / 0.9
                    const shippingTotal = reimbursables.shipping.cost / 0.9
                    const grandTotal = mileageTotal + mealsTotal + hotelTotal + equipmentTotal + shippingTotal
                    return grandTotal.toFixed(0)
                  })()} expense cost breakdown is as follows:
                </div>
                <div style={{ marginLeft: "20px", lineHeight: "1.3" }}>
                  1) Travel-related expenses (portal to portal, mileage) -{" "}
                  <strong>
                    ${(() => {
                      if (reimbursables.mileage.isFlying) {
                        return (reimbursables.mileage.flightCost / 0.9).toFixed(0)
                      } else {
                        const roundTripMiles = reimbursables.mileage.miles * 2
                        return ((roundTripMiles * 0.7) / 0.9).toFixed(0)
                      }
                    })()}
                  </strong>
                  <br />
                  2) Hotel - <strong>${(reimbursables.hotel.cost / 0.9).toFixed(0)}</strong>
                  <br />
                  3) Meals - <strong>${(reimbursables.meals.count * 25).toFixed(0)}</strong>
                  <br />
                  4) Equipment - <strong>${(reimbursables.equipment.cost / 0.9).toFixed(0)}</strong>
                  <br />
                  5) Shipping/Transport of Equipment - <strong>${(reimbursables.shipping.cost / 0.9).toFixed(0)}</strong>
                </div>
              </div>
            )}
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              If fuel costs escalate more than {renderBoldText("**15%**")}, HCI reserves the right to pass on the
              increase. Any work over the services quoted above will be invoiced at our regular Hourly Fee rates below.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              2. When listed services have been completed, Additional Services will be billed at an hourly rate (rates
              listed below) unless an Additional Services Proposal is requested and approved.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              3. A {(() => {
                if (proposalData.paymentType === "hourly" || proposalData.paymentType === "hourly-nte") {
                  return renderBoldText("**$2,000** minimum retainer for Hourly Fee Proposals")
                } else {
                  return renderBoldText("**15%** minimum retainer for a Lump Sum / Fixed Fee Proposal")
                }
              })()} needs to be paid prior to HCI commencing requested and authorized Services. HCI will notify our
              Client when we have invested the services in keeping with the original Services Agreement Proposal.
              Additional Agreement Proposals will be sent and signed Agreement Proposals will be due prior to HCI
              performing subsequent requested Additional Services.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              4. Site Visits will be followed with captioned condition observation photo reports indicating work in
              progress, deficiencies, and action items. If requested, a Concise Written Report may be created at an
              Additional Cost.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              5. HCI will need Client or Contractor's furnished access for observations.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              6. Hixson Consultants, Inc. carries General Liability, Workers' Compensation and E&O insurance.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              7. Hixson Consultants, Inc. will perform our services using that degree of care and skill ordinarily
              exercised under similar conditions by reputable members of our profession practicing in the same or
              similar locality at the time of service. Our intent is to perform visual assessments in a good faith –
              best effort attempt to avoid or solve moisture intrusion, thermal and wind force issues, to address
              damaged materials, and to identify incorrect installation configurations. HCI does not offer any warranty
              or guarantee.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              8. Client agrees that Hixson Consultants, Inc. shall provide only the services set out herein and that
              Hixson Consultants, Inc. offers no warranties, expressed or implied in our Proposal or our oral or written
              reports, with respect to products of their fitness for a particular purpose. Client agrees to look solely
              to the warranties made by the Contractors and/or Manufacturer of said products, including, without
              limitation, consequential damages out of the use of said products.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              9. Any representations, recommendations, opinions, or conclusions relating to the work performed by Hixson
              Consultants, Inc. must be made in writing by duly authorized Hixson Consultants, Inc. representatives.
              Hixson Consultants, Inc. will not be bound by any oral representations, recommendations, opinions, or
              conclusions. The Client agrees to indemnify Hixson Consultants, Inc. for any expenses that Hixson
              Consultants, Inc. may incur because of the Client's negligence or negligence of any Contractor(s) and
              Subcontractor(s) hired by the Client.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              10. Hixson Consultants, Inc. shall not be liable or responsible for, and shall be saved and held harmless
              by Client from and against any and all claims and damages of every kind, for injury to or death of any
              person or persons and for any damage to or loss of property, arising out of or attributed directly or
              indirectly to the performance of this Contract.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              11. All comments made of documents reviewed and of work installed are presented for information and
              recommendation only and are based on our past considerable experience and our desire to facilitate
              long-term performance with minimal expected maintenance burden to the Building Owner. We do not assume
              authority for the means and methods and to make unauthorized changes to the Work or to the Installer's
              (Envelope Subcontractor's) scope.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              12. Our Standard Terms and Conditions included apply to this work and all service delivery.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              13. HCI does not perform destructive discovery demolition work or repair conditions. HCI can observe,
              document, and make recommendations based upon destructive discovery work and repairs performed by Others.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              14. HCI delivers knowledgeable applied technical consulting services to avoid or solve building envelope
              performance issues. HCI does not practice Architecture, Engineering or Construction Management. If these
              services are required, they would need to be provided by Others.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              15. Additional Costs: HCI will need to be compensated for printing costs at cost plus{" "}
              {renderBoldText("**10% markup**")} if print copies of new construction are not available for HCI. HCI will
              need to be compensated for portal-to-portal travel related costs at cost plus{" "}
              {renderBoldText("**10% markup**")}.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              16. HCI Invoices are due upon receipt. Accounts unpaid for {renderBoldText("**sixty (60) days**")} from
              the date of Invoice will be cause for HCI to suspend performance under this Agreement upon a{" "}
              {renderBoldText("**fourteen (14) day**")} written notice, unless payment in full is received within{" "}
              {renderBoldText("**fourteen (14) days**")} from the date of the written notice; i.e., paid no later than
              when the account has been due for {renderBoldText("**sixty (60) days**")}. In the event of suspension of
              services, HCI shall have no liability for any delay or other damage, contractual or otherwise, caused by
              or arising out of the suspension of services for nonpayment.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              17. Accounts unpaid for {renderBoldText("**sixty (60) days**")} from the date of Invoice will be cause for
              HCI to charge and be paid {renderBoldText("**1-1/2% interest per month**")} until the account past due
              amount and applicable accrued interest are paid in full.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              18. Acceptance by HCI of any payment more than {renderBoldText("**sixty (60) days**")} old shall not serve
              as a waiver of HCI's contractual right to suspend services for nonpayment. Failure to make payment within{" "}
              {renderBoldText("**thirty (30) days**")} of Invoice shall constitute a release of HCI from any and all
              claims which the Client may have, either in tort or in Contract, and whether known or unknown at the time.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              19. This pricing is good for {renderBoldText("**thirty (30) days**")}.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              20. The Client is to share all Project documents affecting the Building Envelope with HCI in a timely
              manner, including but not limited to Drawings and Specifications, Submittals, Shop Drawings, RFIs and
              Quality Assurance Site Visit deliverable(s) {renderBoldText("**one (1) week**")} prior to the requested
              deliverable. Where applicable, the anticipated Construction schedule and schedule updates shall also be
              shared with HCI in a timely manner for HCI to perform the Contracted Services.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              21. If HCI can be paid for invoices sent, there will be no additional charge for bookkeeping. If the
              Client has a proprietary billing and payment software program and data entry is necessary on HCI's part,
              there will be a {renderBoldText("**$100 per hour**")} charge to accommodate this requirement if the
              requirement is not shared with HCI prior to our creating services proposals.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              22. Risk Allocations: In recognition of the relative risks, rewards, and benefits of the project to both
              the Client and HCI, the risks have been allocated so that the Client agrees that, to the fullest extent
              permitted by the law, HCI's total liability to the Client, for any and all injuries, claims, losses,
              expenses, damages, or claim expenses arising out of this agreement, from any cause or causes, shall be
              limited to insurance coverage and not exceed the total amount of{" "}
              <strong>{getRiskAllocationDisplay()}</strong>. Such causes include and are limited to HCI's errors,
              omissions, strict liability, or breach of contract.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              23. Additional Services that may be requested can include additional Site Visits, additional meetings,
              infrared thermographic imaging, dielectric impedance testing, water hose water pressure hose nozzle and
              chamber water pressure testing and if necessary, additional services monitoring of waterproofing, roofing,
              flashing penetrations and perimeters, and joint sealant installations. An additional HCI Services
              Agreement proposal will need to be signed to authorize our continuing to perform the initial requested
              services and to perform additional requested services that may or may not differ from the original
              services.
            </div>
          </div>

          {/* Hourly Rates */}
          <div className="space-y-3">
            <div style={{ fontSize: "12pt", fontWeight: "bold" }}>Hourly Rates for Additional Services:</div>
            <div className="grid grid-cols-2 gap-x-8" style={{ fontSize: "10pt" }}>
              <div className="space-y-1">
                {leftColumn.map(([title, rate]) => (
                  <div key={title} className="flex justify-between">
                    <span>{title}</span>
                    <span style={{ fontWeight: "bold" }}>${rate}/hr</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {rightColumn.map(([title, rate]) => (
                  <div key={title} className="flex justify-between">
                    <span>{title}</span>
                    <span style={{ fontWeight: "bold" }}>${rate}/hr</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Rates Text */}
          <div className="space-y-3">
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              Should this work be performed when HCI hourly fee rates have changed, HCI reserves the right to invoice at
              the higher rate. Reimbursable expenses are not included and will be invoiced at cost plus{" "}
              {renderBoldText("**10% markup**")}. Additional Services expenses are billed in addition to hourly rates.
            </div>
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              Additional Services may be required or requested because of discovery of concealed conditions, the
              non-performance of others or conditions of the work not previously considered, additional site visits and
              additional meetings, excessive correspondence or lengthy conference calls (exceeding a quarter of an hour
              duration).
            </div>
          </div>

          {/* Closing Section */}
          <div className="space-y-4 mt-8">
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              We welcome discussing our services in detail at your convenience. Should further information be required,
              please contact our office. May we have your valued business, and continue to build a strong, successful,
              and mutually beneficial relationship?
            </div>

            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              Sincerely,
              <br />
              Hixson Consultants, Inc.
            </div>

            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              <strong>Ben Hixson</strong>
              <br />
              Ben Hixson, Principal / CIT, CCS, CCCA, QCxP, Professional IIBEC Member
              <br />
              Roofing Wall Systems Waterproofing Thermography Commissioning
            </div>

            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              <strong>cc:</strong> Tony Wright, Sr. Associate, Professional IIBEC Member, Roofing, Wall Systems,
              Waterproofing and Thermography
              <br />
              Greg Cunningham, Sr. Project Consultant, Glazing, Fenestration Systems, Wall Assemblies
              <br />
              Mike Ray, Sr. Project Consultant, Professional IIBEC Member
              <br />
              Tyler Mayhew, Consultant, CxA + BE, BECxP, CIT, CEI-TN, Professional IIBEC Member
              <br />
              Tony Fields, Sr. Field Technician, Professional IIBEC Member
              <br />
              Wesley Paul, Field Technician, Professional IIBEC Member
            </div>
          </div>
        </div>

        {/* Page Break Indicator - only show if content would actually span multiple pages */}
        {selectedServices.length > 4 && (
          <>
            <div className="border-t-2 border-dashed border-blue-300 mt-8 pt-4 text-center text-blue-600 text-sm font-medium">
              📄 Page Break - Page 2 follows
            </div>

            {/* Page 2 - Additional content if needed */}
            <div
              className="min-h-[600px] space-y-4 leading-tight"
              style={{ fontFamily: "Arial, sans-serif", fontSize: "10pt", lineHeight: "1.2" }}
            >
              {/* Page header */}
              <div className="border-b border-gray-300 pb-2">
                <div className="flex justify-between items-center">
                  <div style={{ fontSize: "10pt", fontWeight: "bold" }}>HCI Building Envelope Services Proposal</div>
                  <div style={{ fontSize: "10pt", fontWeight: "bold" }}>Page 2</div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div style={{ fontSize: "10pt" }}>
                    {proposalData.projectInfo.name} – {projectLocation}
                  </div>
                  <div style={{ fontSize: "10pt" }}>{proposalData.header.date}</div>
                </div>
              </div>

              <div className="text-center text-gray-500 py-8">
                <p>Additional content would appear here if the proposal extends beyond one page.</p>
                <p className="text-sm">The actual PDF will handle page breaks automatically based on content length.</p>
              </div>
            </div>
          </>
        )}

        {/* Agreement Page Preview */}
        <div className="min-h-[600px] space-y-4 leading-tight border-t border-gray-300 pt-8 mt-8">
          <div className="text-center" style={{ fontSize: "14pt", fontWeight: "bold" }}>
            AGREEMENT
          </div>
          <div className="space-y-4">
            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              HCI is offering our Applied Technical Consulting Services on an{" "}
              <strong>{getPaymentTypeText(proposalData.paymentType)}</strong> basis based upon experience and historical
              cost of services. Reimbursable expenses are not included and will be invoiced at cost plus{" "}
              <strong>10% markup</strong>. Any work over the services quoted above will be billed at our regular Hourly
              Fee rates cited above. HCI will not commence work on this project without a Signed Agreement. I have read
              and agree to the Terms and Conditions attached.
            </div>

            <div style={{ fontSize: "12pt", fontWeight: "bold" }}>Agreed to by:</div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <div style={{ fontSize: "10pt" }}>Printed Name</div>
                  <div className="border-b border-gray-300 h-6"></div>
                </div>
                <div>
                  <div style={{ fontSize: "10pt" }}>Signature</div>
                  <div className="border-b border-gray-300 h-6"></div>
                </div>
                <div>
                  <div style={{ fontSize: "10pt" }}>Title</div>
                  <div className="border-b border-gray-300 h-6"></div>
                </div>
                <div>
                  <div style={{ fontSize: "10pt" }}>Date</div>
                  <div className="border-b border-gray-300 h-6 w-24"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div style={{ fontSize: "10pt" }}>E-mail Address</div>
                  <div className="border-b border-gray-300 h-6"></div>
                </div>
                <div>
                  <div style={{ fontSize: "10pt" }}>Telephone Number</div>
                  <div className="border-b border-gray-300 h-6"></div>
                </div>
                <div>
                  <div style={{ fontSize: "10pt" }}>Fax Number</div>
                  <div className="border-b border-gray-300 h-6"></div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: "10pt", lineHeight: "1.4" }}>
              HCI Invoices will be distributed via e-mail. Please provide contact for Accounts Payable below.
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <div style={{ fontSize: "10pt" }}>Printed Name of Person Authorized for Payment</div>
                <div className="border-b border-gray-300 h-6"></div>
              </div>
              <div>
                <div style={{ fontSize: "10pt" }}>E-mail Address</div>
                <div className="border-b border-gray-300 h-6"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions Page Preview */}
        <div className="min-h-[600px] space-y-4 leading-tight border-t border-gray-300 pt-8 mt-8">
          <div className="text-center" style={{ fontSize: "14pt", fontWeight: "bold" }}>
            CONSULTING SERVICES TERMS AND CONDITIONS
          </div>
          <div className="space-y-3">
            {[
              "I.  COMPENSATION",
              "A. Fee compensation to Hixson Consultants, Inc. hereafter also HCI, for Basic Services shall be invoiced monthly based on actual hours expended by HCI at our prevailing rates.",
              "B. The budget amount represents the estimated cost to our Client limited to the Basic Services (excluding any / all reimbursable expenses) as outlined in the agreement and is conditional upon all of the terms and conditions stated herein.  HCI shall endeavor to provide the Basic Services within the estimated budget and shall also endeavor to notify the Client prior to exceeding this budget; however, in all circumstances, the Client agrees and accepts to compensate HCI for all hours expended in the interest of the project.",
              "C. Reimbursable Expenses are in addition to fee compensation for services and include actual expenditures made/incurred by HCI and/or its agents in the interest of the project and resulting directly from the performance of services under the Agreement.  Unless prepaid, reimbursable expenses are invoiced at cost plus 10% and include but are not limited to:",
              "1. Portal-to-portal travel plus subsistence.",
              "2. Long-distance telephone, cellular telephone use, telex, telecopy.",
              "3. Expense of courier service, shipping, postage, and delivery service.",
              "4. Expense of any / all reproduction of drawings, specifications, photographs, calculations, reports, correspondence, expense backup, etc.",
              "5. Fees and expenses of a Registered Professional Consulting Engineer, Registered Architect, or Construction Manager.",
              "6. Cost of staging, scaffolding, ladders, or other equipment.",
              "D. Compensation to HCI for the performance of authorized Additional Services where the scope is defined may be a lump sum amount if mutually agreed upon in advance and shall be in addition to the Basic Services fee amount or shall be otherwise billed at our prevailing hourly rates.",
              "E. Overtime requested by the Client of HCI in an effort to recover and/or to maintain the overall schedule due to slippage by others shall be compensated at 1 ½ times the above rates for time on weekdays and Saturdays and at 2 times the standard hourly rates for Sundays and holidays.",
              "F. Portal to Portal travel time is chargeable from the scheduled departure time to the scheduled return arrival time.  Time zone differences will be adjusted to actual hours.  Non-travel and after-hours time out of town on overnight and/or extended trips are not chargeable.",
              "II. PAYMENT",
              "A. Payment on account of authorized services and/or expenses shall be made monthly in the amount of HCI's monthly invoice for services performed and/or expenses incurred.  Payment of HCI's invoices is not contingent upon the Client's receipt of funds.  The invoice shall be considered past due if not paid within 30 days of the invoice date.  In lieu of a signed copy, authorization to proceed, or payment of Hixson Consultants, Inc., HCI, invoice(s) constitutes acceptance of this proposal.",
              "B. Client shall notify HCI in writing within twenty (20) days from the invoice of any incorrect or disputed item on the invoice or such invoice shall be deemed complete and correct and fully due and owing.",
              "C. If this assignment is suspended for more than one (1) month or abandoned in whole or in part, by the Client or Third Party, HCI shall be paid within 30 days its compensation for services performed and expenses incurred prior to receipt of written notice of such suspension or abandonment.",
              "D. Payments are due and payable upon receipt of the invoice.  The Client agrees to pay invoices in a timely manner.  On the thirty-fifth (35th) day following the invoice date and on each successive thirtieth (30th) day thereafter, a late charge in the amount of one and one-half percent (1.50 %) may be added to and become due on all unpaid principal amounts due.  Finance charges accrue from the original date of the invoice.  Payment received will first be applied to any accrued late fees and then to the balance of the original invoice(s).",
              "E. In the event that payment is not made, the Client agrees to pay all collection costs and expenses incurred by HCI to collect the amount due including a reasonable attorney's fee whether or not the suit is instituted.",
              "III. GENERAL PROVISIONS",
              "A. Record of expenses and hourly rate-based services performed will be kept on the basis of General Accepted Accounting Principles (GAAP) and will be available to the Client in HCI's office during normal business hours.",
              "B. Reports, photos, specifications, drawings, calculations, and related documents prepared by HCI are for the exclusive use of the Client for this project.  Client's and HCI's responsibility and liability with respect to these drawings and documents are limited solely to this project.",
              "C. This agreement may be terminated by either party upon seven (7) days' written notice should the other party substantially fail to perform in accordance with its provisions through no substantial fault of the other.  In the event of termination, HCI shall be paid within 30 days its compensation for services performed to the termination date, including reimbursable expenses, in full.  Upon receipt by HCI of said payment in full, HCI shall deliver to Client one reproducible copy of documents prepared by HCI to the termination date.  HCI shall have no responsibility whatsoever for subsequent changes or additions and/or for the use of these documents by Client and/or by others.",
              "D. Client agrees that HCI is entitled to rely on it exclusively for the accuracy and timeliness of the information it provides HCI with respect to the project unless HCI knows or has reason to believe such information is in error. The Client shall provide HCI with drawings, specifications, reports, field measurements, surveys, warranty coverage, leak history, and any other requested data that may be obtainable in order for HCI to perform its services. When advised by HCI, investigation of conditions concealed by existing finishes shall be authorized and paid for by the Client.  Where investigation is NOT authorized, HCI shall not be responsible for the condition of the existing structure (except where verification can be made by simple visual discovery), or envelope performance.",
              "E. HCI is providing only technical consulting services in an advisory capacity under this Agreement and is not providing (nor profiting from) any products, materials, shop fabrication, and/or field installation.  It is understood and agreed that the final responsibility for checking and verifying the accuracy of and for use of all documents/recommendations provided by HCI under this Agreement is and shall remain solely with the Client.",
              "F. The total extent of responsibility and liability for any and all errors and/or omissions by HCI in work provided under this Agreement shall be limited to insurance coverage. Client agrees and accepts that it is prohibited as a condition of this Agreement from making deductions or 'back charging' HCI's compensation for any reason whatsoever except for proven HCI errors and omissions.  HCI assumes no responsibility for material costs and/or labor costs by others due to services provided by HCI under this Agreement.  We can provide for a charge of $1 Million Errors and Omissions (E&O) insurance for our work and more coverage than this is specifically excluded from the terms of our Agreement unless cited as a line-item additional cost.  In recognition of the relative risks, rewards, and benefits of the project to both the Client and HCI, except for HCI errors and omissions the Client assumes entire responsibility and liability for any and all damage or injury of any kind or nature whatsoever to all persons and to all property caused by, resulting from, arising out of, or occurring in connection with the work and/or HCI's services performed under the Agreement; and if any persons shall make a claim for any damage or injury as hereinabove described, the Client agrees to indemnify and hold HCI harmless from and against any and all loss, expense, damage or injury that may result of any such claim.",
              "HIXSON CONSULTANTS, INC. ASSUMES NO CONSEQUENTIAL DAMAGES AND LIMITS ANY OTHER DAMAGES WHATSOEVER TO THE PROVIDED INSURANCE COVERAGE.  HIXSON CONSULTANTS, INC. DISCLAIMS ANY WARRANTY OF FITNESS FOR A PARTICULAR PURPOSE AND ANY AND ALL OTHER CONSEQUENTIAL DAMAGES.  HCI OFFERS \"BEST EFFORT-GOOD FAITH\" SERVICES INTENDED TO STOP MOISTURE INTRUSION AND CONDENSATION FORMATION.",
              "G. It is understood and agreed that the Agreement is conditional, based upon a comprehensive schedule mutually agreed upon prior to HCI beginning work, for services to be provided by HCI.  Any deviation from this schedule resulting from any action or inaction by other than HCI may result in Additional Service costs and/or HCI being unable to recover to maintain said overall schedule.  Such inability to recover shall not constitute just cause for termination of the Agreement by Client.",
              "H. HCI shall endeavor to maintain scheduled deliverables; however, it is understood and agreed that the only liability assumed by HCI for its nonperformance, resulting in failure to maintain schedule, shall be absolutely limited to providing/increasing over time and/or staff at no additional cost to Client, regardless of circumstances outside HCI control and/or Client's exposure.",
              "I. HCI reports are for the exclusive use of our Client and are not intended for any other purpose.  Reports are based on the information available to us at the time of the report.  Should additional information become available at a later date, we reserve the right to determine the impact, if any, the new information may have on our discovery and recommendations and to revise our opinions and conclusions if necessary and warranted.",
              "J. HCI maintains statutory Employee's Insurance, including Worker's Compensation, Employer's Liability, and Comprehensive General Liability, and will provide a current Certificate of Insurance to our client upon request.",
              "K. HCI is an independent contractor in the performance of its duties under the Agreement.  The detailed methods and manner of conducting the services shall be under the complete control and direction of HCI.",
              "L. All persons performing any part of the services will be employees or agents of HCI and not employees or agents of the Client.  HCI will be fully responsible for all applicable federal, state, and local taxes arising out of HCI's activities under this Agreement, including by way of illustration but not by way of limitation, federal income tax, social security tax, unemployment compensation contribution, and all other taxes, contributions, or business license fees as required (excluding any international fees, duties, or taxes).",
              "M. HCI will not have control over, or charge of, and will not be responsible for construction means, methods, techniques, sequences, or procedures, or for safety precautions and programs in connection with the work; these are solely a Client / Contractor responsibility.  HCI will not be responsible for the Client/Contractor's failure to carry out the work in accordance with the project Contract Documents.",
              "N. HCI will not have control over, or charge of, and will not be responsible for acts or omissions of Client or Contractor, Subcontractors or their agents or employees, or of any persons performing services or portions of the work.",
              "O. HCI will comply with all applicable federal and state laws and regulations with respect to non-discrimination and equal opportunity in employment.",
              "P. Client agrees to resolve by mediation any and all disputes, claims, or controversies arising from or related to any work performed for Client by HCI including disputes related to the breadth or scope of this provision.  Mediation shall be conducted in Birmingham, AL.  This provision, however, does not require the mediation of disputes where the fees paid to HCI are less than $10,000 or the amount sought does not exceed $10,000.",
              "Q. The prevailing party in any mediation, or any other final, binding dispute proceeding upon which the parties may agree, may be awarded reasonable attorneys' fees and expenses incurred by such party upon a finding that the other party initiated or continued to assert a clearly frivolous, unreasonable, or groundless claim or defense.",
              "R. The Agreement constitutes the entire Agreement by and between Client and Hixson Consultants, Inc. pertaining to Technical Consulting Services for the referenced assignment.  The terms and conditions herein shall supersede and take precedence over any / all terms and conditions which may be embodied in Client's purchase order or similar documents.  The Agreement may be amended only by mutual agreement in writing signed by both parties and attached hereto.  The laws of the State of Alabama will govern the Agreement."
            ].map((text, idx) => (
              <div key={idx} style={{ fontSize: "10pt", lineHeight: "1.4" }}>{text}</div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-light">
      {/* Hourly Rates Configuration */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-normal text-slate-900">Hourly Rates Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="rate-principal" className="text-slate-700 font-light">
                Principal ($/hr)
              </Label>
              <Input
                id="rate-principal"
                type="number"
                value={hourlyRates.principal}
                onChange={(e) => updateHourlyRates("principal", Number.parseInt(e.target.value) || 0)}
                className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                  hourlyRates.principal > 0 ? "border-emerald-500 bg-emerald-50" : ""
                }`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate-sr-associate" className="text-slate-700 font-light">
                Sr. Associate ($/hr)
              </Label>
              <Input
                id="rate-sr-associate"
                type="number"
                value={hourlyRates.srAssociate}
                onChange={(e) => updateHourlyRates("srAssociate", Number.parseInt(e.target.value) || 0)}
                className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                  hourlyRates.srAssociate > 0 ? "border-emerald-500 bg-emerald-50" : ""
                }`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate-sr-consultant" className="text-slate-700 font-light">
                Sr. Consultant ($/hr)
              </Label>
              <Input
                id="rate-sr-consultant"
                type="number"
                value={hourlyRates.srConsultant}
                onChange={(e) => updateHourlyRates("srConsultant", Number.parseInt(e.target.value) || 0)}
                className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                  hourlyRates.srConsultant > 0 ? "border-emerald-500 bg-emerald-50" : ""
                }`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate-consultant" className="text-slate-700 font-light">
                Consultant ($/hr)
              </Label>
              <Input
                id="rate-consultant"
                type="number"
                value={hourlyRates.consultant}
                onChange={(e) => updateHourlyRates("consultant", Number.parseInt(e.target.value) || 0)}
                className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                  hourlyRates.consultant > 0 ? "border-emerald-500 bg-emerald-50" : ""
                }`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate-technician" className="text-slate-700 font-light">
                Field Technician ($/hr)
              </Label>
              <Input
                id="rate-technician"
                type="number"
                value={hourlyRates.fieldTechnician}
                onChange={(e) => updateHourlyRates("fieldTechnician", Number.parseInt(e.target.value) || 0)}
                className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                  hourlyRates.fieldTechnician > 0 ? "border-emerald-500 bg-emerald-50" : ""
                }`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate-admin" className="text-slate-700 font-light">
                Administrative ($/hr)
              </Label>
              <Input
                id="rate-admin"
                type="number"
                value={hourlyRates.administrative}
                onChange={(e) => updateHourlyRates("administrative", Number.parseInt(e.target.value) || 0)}
                className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                  hourlyRates.administrative > 0 ? "border-emerald-500 bg-emerald-50" : ""
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Allocation Configuration */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-normal text-slate-900">Risk Allocation Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="risk-allocation" className="text-slate-700 font-light">
              Liability Limit Amount
            </Label>
            <Select value={riskAllocationAmount} onValueChange={setRiskAllocationAmount}>
              <SelectTrigger
                className={`border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 font-light ${
                  riskAllocationAmount ? "border-emerald-500 bg-emerald-50" : ""
                }`}
              >
                <SelectValue placeholder="Select liability limit" />
              </SelectTrigger>
              <SelectContent>
                {riskAllocationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="font-light">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 font-light">
              This amount will be used in item 22 of the Qualifications and Limitations section.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Preview */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-normal text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-slate-600" strokeWidth={1} />
            Proposal Preview (Multi-Page)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border border-slate-200 rounded-lg p-8 max-h-96 overflow-y-auto shadow-inner">
            {createPreviewContent()}
          </div>
          <div className="mt-4">
            <Button
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 font-light"
            >
              <Download className="w-4 h-4 mr-2" strokeWidth={1} />
              {isGenerating ? "Generating Multi-Page PDF..." : "Generate & Download PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
