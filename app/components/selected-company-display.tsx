"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Edit2 } from "lucide-react"

interface CompanyInfo {
  name: string
  address: string
  phone?: string
  placeId?: string
}

interface SelectedCompanyDisplayProps {
  company: CompanyInfo
  onEdit: () => void
  className?: string
}

export default function SelectedCompanyDisplay({ company, onEdit, className }: SelectedCompanyDisplayProps) {
  return (
    <Card className={`p-3 bg-blue-50 border-blue-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Building className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-medium text-gray-900 mb-1">{company.name}</div>
            <div className="text-sm text-gray-700 mb-1">{company.address}</div>
            {company.phone && <div className="text-sm text-gray-600">📞 {company.phone}</div>}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={onEdit} className="flex items-center gap-1">
          <Edit2 className="h-3 w-3" />
          Change
        </Button>
      </div>
    </Card>
  )
}
