import type { Service } from "../types/proposal"

export const services: Service[] = [
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
] 