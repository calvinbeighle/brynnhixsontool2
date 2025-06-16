export interface Service {
  id: string
  name: string
  description: string
  category: string
  price: number
  suggestedPrice?: number
  serviceType: "basic" | "additional"
  proposalTypes: string[] // Which proposal types this service applies to
}

export interface ClientInfo {
  companyName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  clientTitle: string // Add this field
}

export interface ProjectInfo {
  name: string
  location: string
  useCompanyAddress: boolean
}

export interface ProposalData {
  header: ProposalHeader
  proposalType: string
  paymentType: string
  clientInfo: ClientInfo
  projectInfo: ProjectInfo
  selectedServices: ServiceItem[]
  reimbursables: ReimbursableBreakdown
  totalReimbursables: number
  retainerAmount: number
  retainerPercentage: number
  additionalNotes: string
}

export interface MileageData {
  miles: number
  isFlying: boolean
  flightCost: number
  selectedAirport?: string
  hotelAddress?: string
  airportToHotel?: number
  hotelToProject?: number
}

export interface MealsData {
  count: number
}

export interface HotelData {
  cost: number
}

export interface EquipmentData {
  cost: number
}

export interface ShippingData {
  cost: number
}

export interface ReimbursableData {
  mileage: MileageData
  meals: MealsData
  hotel: HotelData
  equipment: EquipmentData
  shipping: ShippingData
}

export interface CompanyInfo {
  name: string
  address: string
  phone: string
  email: string
  website: string
  tagline: string
  specialties: string[]
}

export interface ProposalHeader {
  date: string
  proposalTitle: string
  proposalNumber?: string
}

export interface ServiceItem {
  id: string
  name: string
  description: string
  price?: number
  category: string
  isSelected: boolean
  originalDescription?: string
  originalPrice?: number
  serviceType: "basic" | "additional"
  proposalTypes: string[]
}

export interface ReimbursableBreakdown {
  travel: number
  hotel: number
  meals: number
  equipment: number
  shipping: number
  printing: number
  miscMaterials: number
}

export interface HourlyRates {
  principal: number
  srAssociate: number
  srProjectConsultant: number
  srConsultant: number
  consultant: number
  srTechnician: number
  fieldTechnician: number
  cad: number
  administrative: number
}

export interface ProposalTemplate {
  companyInfo: CompanyInfo
  hourlyRates: HourlyRates
  standardTerms: string[]
  signatureBlock: {
    principalName: string
    principalTitle: string
    principalCredentials: string
    ccList: string[]
  }
}
