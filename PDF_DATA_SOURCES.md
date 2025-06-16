# PDF Data Sources

This document outlines all the components and data points that feed into the generated PDF.

## 1. Main Data Structure: `proposalData`

This is the primary state object, managed in `app/page.tsx`, that holds the majority of the information for the proposal.

### 1.1. `header`
- **Description:** Contains the main header information for the proposal.
- **Fields:**
    - `date`: The date of the proposal.
    - `proposalTitle`: The main title of the proposal.
- **Component:** `ProposalFormAccordion` > `Header` section

### 1.2. `proposalType` & `paymentType`
- **Description:** Defines the type of proposal and how the payment will be handled.
- **Fields:**
    - `proposalType`: e.g., "Water Testing" or "Visual Assessment"
    - `paymentType`: e.g., "Hourly", "Lump Sum"
- **Component:** `ProposalFormAccordion` > `Proposal Type & Payment` section

### 1.3. `clientInfo`
- **Description:** All information related to the client.
- **Fields:**
    - `companyName`: Client's company name (validated by `google-places-new` API).
    - `firstName`, `lastName`: Client's contact name.
    - `email`: Client's email address.
    - `phone`: Client's phone number.
    - `address`: Client's address (validated by `google-places-autocomplete` API).
    - `clientTitle`: e.g., "Mr.", "Ms."
- **Components:**
    - `ProposalFormAccordion` > `Client Information` section
    - `CompanySelector` (for `companyName` API validation)
    - `AddressInput` (for `address` API validation)

### 1.4. `projectInfo`
- **Description:** Details about the project.
- **Fields:**
    - `name`: The name of the project.
    - `location`: The location of the project.
    - `useCompanyAddress`: A boolean to indicate if the project location is the same as the client's address.
- **Component:** `ProposalFormAccordion` > `Project Information` section

### 1.5. `selectedServices`
- **Description:** A list of all the services that have been selected for the proposal.
- **Fields:** Each service is an object with `id`, `name`, `description`, `price`, etc.
- **Component:** `ServiceMenu`

### 1.6. Other `proposalData` fields
- **Description:** Additional details used in the proposal.
- **Fields:**
    - `retainerAmount`
    - `retainerPercentage`
    - `additionalNotes`

## 2. Services (`services`)
- **Description:** This state, managed in `app/page.tsx`, holds the master list of all available services. The `selectedServices` in `proposalData` is a subset of this list.
- **Component:** `ServicesManager` is used to edit this master list.

## 3. Reimbursables (`reimbursables`)
- **Description:** This state, managed in `app/page.tsx`, holds all data related to reimbursable expenses.
- **Fields:**
    - `mileage`: Contains `miles`, `isFlying`, and `flightCost`.
    - `meals`: Contains `count`.
    - `hotel`: Contains `cost`.
    - `equipment`: Contains `cost`.
    - `shipping`: Contains `cost`.
- **Component:** `ReimbursablesCalculator`

## 4. Statically Defined & User-Configured Data in `PDFGenerator`

The `pdf-generator.tsx` component also contributes its own data to the PDF:

### 4.1. `hourlyRates`
- **Description:** A state within the `PDFGenerator` that holds the hourly rates for different roles. This is user-configurable in the UI.
- **Fields:** `principal`, `srAssociate`, `srConsultant`, etc.

### 4.2. `riskAllocationAmount`
- **Description:** A state within the `PDFGenerator` for the liability limit amount, selected by the user.

### 4.3. `companyInfo`
- **Description:** A statically defined object in `pdf-generator.tsx` with Hixson Consultants' corporate information.
- **Fields:** `name`, `corporatePhone`, `tennesseePhone`, `address`, `tagline`. 