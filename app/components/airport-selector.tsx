"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button, type ButtonProps, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plane, Search, MapPin, X } from "lucide-react"

interface Airport {
  code: string
  name: string
  city: string
  state: string
  address: string
}

interface AirportSelectorProps {
  selectedAirport: Airport | null
  onAirportSelect: (airport: Airport | null) => void
  className?: string
}

// Comprehensive airport database
const AIRPORTS: Airport[] = [
  // Alabama
  {
    code: "BHM",
    name: "Birmingham-Shuttlesworth International Airport",
    city: "Birmingham",
    state: "AL",
    address: "5900 Messer Airport Hwy, Birmingham, AL 35212",
  },
  {
    code: "HSV",
    name: "Huntsville International Airport",
    city: "Huntsville",
    state: "AL",
    address: "1000 Glenn Hearn Blvd SW, Huntsville, AL 35824",
  },
  {
    code: "MOB",
    name: "Mobile Regional Airport",
    city: "Mobile",
    state: "AL",
    address: "8400 Airport Blvd, Mobile, AL 36608",
  },
  {
    code: "MGM",
    name: "Montgomery Regional Airport",
    city: "Montgomery",
    state: "AL",
    address: "4445 Selma Hwy, Montgomery, AL 36108",
  },
  {
    code: "DHN",
    name: "Dothan Regional Airport",
    city: "Dothan",
    state: "AL",
    address: "1759 Westgate Pkwy, Dothan, AL 36303",
  },

  // Georgia
  {
    code: "ATL",
    name: "Hartsfield-Jackson Atlanta International Airport",
    city: "Atlanta",
    state: "GA",
    address: "6000 N Terminal Pkwy, Atlanta, GA 30320",
  },
  {
    code: "CSG",
    name: "Columbus Metropolitan Airport",
    city: "Columbus",
    state: "GA",
    address: "3250 W Britt David Rd, Columbus, GA 31909",
  },
  {
    code: "MCN",
    name: "Middle Georgia Regional Airport",
    city: "Macon",
    state: "GA",
    address: "1000 Terminal Dr, Macon, GA 31297",
  },
  {
    code: "SAV",
    name: "Savannah/Hilton Head International Airport",
    city: "Savannah",
    state: "GA",
    address: "400 Airways Ave, Savannah, GA 31408",
  },
  {
    code: "AGS",
    name: "Augusta Regional Airport",
    city: "Augusta",
    state: "GA",
    address: "1501 Aviation Way, Augusta, GA 30906",
  },
  {
    code: "ABY",
    name: "Southwest Georgia Regional Airport",
    city: "Albany",
    state: "GA",
    address: "3142 Schilling Ave, Albany, GA 31705",
  },
  {
    code: "VLD",
    name: "Valdosta Regional Airport",
    city: "Valdosta",
    state: "GA",
    address: "4290 Inner Perimeter Rd, Valdosta, GA 31601",
  },

  // Tennessee
  {
    code: "BNA",
    name: "Nashville International Airport",
    city: "Nashville",
    state: "TN",
    address: "1 Terminal Dr, Nashville, TN 37214",
  },
  {
    code: "MEM",
    name: "Memphis International Airport",
    city: "Memphis",
    state: "TN",
    address: "2491 Winchester Rd, Memphis, TN 38116",
  },
  {
    code: "TYS",
    name: "McGhee Tyson Airport",
    city: "Knoxville",
    state: "TN",
    address: "2055 Alcoa Hwy, Alcoa, TN 37701",
  },
  {
    code: "CHA",
    name: "Chattanooga Metropolitan Airport",
    city: "Chattanooga",
    state: "TN",
    address: "1001 Airport Rd, Chattanooga, TN 37421",
  },
  {
    code: "TRI",
    name: "Tri-Cities Airport",
    city: "Bristol",
    state: "TN",
    address: "2525 Hwy 75, Blountville, TN 37617",
  },

  // Mississippi
  {
    code: "JAN",
    name: "Jackson-Medgar Wiley Evers International Airport",
    city: "Jackson",
    state: "MS",
    address: "100 International Dr, Jackson, MS 39208",
  },
  {
    code: "GPT",
    name: "Gulfport-Biloxi International Airport",
    city: "Gulfport",
    state: "MS",
    address: "14035 Airport Rd, Gulfport, MS 39503",
  },
  {
    code: "PIB",
    name: "Hattiesburg-Laurel Regional Airport",
    city: "Hattiesburg",
    state: "MS",
    address: "9 Terminal Dr, Moselle, MS 39459",
  },
  {
    code: "MEI",
    name: "Meridian Regional Airport",
    city: "Meridian",
    state: "MS",
    address: "1935 Airport Blvd, Meridian, MS 39301",
  },
  {
    code: "TUP",
    name: "Tupelo Regional Airport",
    city: "Tupelo",
    state: "MS",
    address: "1740 Airport Rd, Tupelo, MS 38804",
  },

  // Florida
  {
    code: "PNS",
    name: "Pensacola International Airport",
    city: "Pensacola",
    state: "FL",
    address: "2430 Airport Blvd, Pensacola, FL 32504",
  },
  {
    code: "TLH",
    name: "Tallahassee International Airport",
    city: "Tallahassee",
    state: "FL",
    address: "3300 Capital Cir SW, Tallahassee, FL 32310",
  },
  {
    code: "ECP",
    name: "Northwest Florida Beaches International Airport",
    city: "Panama City",
    state: "FL",
    address: "6300 West Bay Pkwy, Panama City, FL 32409",
  },
  {
    code: "JAX",
    name: "Jacksonville International Airport",
    city: "Jacksonville",
    state: "FL",
    address: "2400 Yankee Clipper Dr, Jacksonville, FL 32218",
  },
  {
    code: "GNV",
    name: "Gainesville Regional Airport",
    city: "Gainesville",
    state: "FL",
    address: "3880 NE 39th Ave, Gainesville, FL 32609",
  },
  {
    code: "MCO",
    name: "Orlando International Airport",
    city: "Orlando",
    state: "FL",
    address: "1 Jeff Fuqua Blvd, Orlando, FL 32827",
  },
  {
    code: "TPA",
    name: "Tampa International Airport",
    city: "Tampa",
    state: "FL",
    address: "4100 George J Bean Pkwy, Tampa, FL 33607",
  },
  {
    code: "MIA",
    name: "Miami International Airport",
    city: "Miami",
    state: "FL",
    address: "2100 NW 42nd Ave, Miami, FL 33126",
  },
  {
    code: "FLL",
    name: "Fort Lauderdale-Hollywood International Airport",
    city: "Fort Lauderdale",
    state: "FL",
    address: "100 Terminal Dr, Fort Lauderdale, FL 33315",
  },
  {
    code: "PBI",
    name: "Palm Beach International Airport",
    city: "West Palm Beach",
    state: "FL",
    address: "1000 James L Turnage Blvd, West Palm Beach, FL 33415",
  },
  {
    code: "RSW",
    name: "Southwest Florida International Airport",
    city: "Fort Myers",
    state: "FL",
    address: "11000 Terminal Access Rd, Fort Myers, FL 33913",
  },
  {
    code: "SRQ",
    name: "Sarasota-Bradenton International Airport",
    city: "Sarasota",
    state: "FL",
    address: "6000 Airport Cir, Sarasota, FL 34243",
  },

  // Louisiana
  {
    code: "MSY",
    name: "Louis Armstrong New Orleans International Airport",
    city: "New Orleans",
    state: "LA",
    address: "1 Terminal Dr, Kenner, LA 70062",
  },
  {
    code: "BTR",
    name: "Baton Rouge Metropolitan Airport",
    city: "Baton Rouge",
    state: "LA",
    address: "9430 Jackie Cochran Dr, Baton Rouge, LA 70807",
  },
  {
    code: "SHV",
    name: "Shreveport Regional Airport",
    city: "Shreveport",
    state: "LA",
    address: "5103 Hollywood Ave, Shreveport, LA 71109",
  },
  {
    code: "LFT",
    name: "Lafayette Regional Airport",
    city: "Lafayette",
    state: "LA",
    address: "200 Terminal Dr, Lafayette, LA 70508",
  },
  {
    code: "LCH",
    name: "Lake Charles Regional Airport",
    city: "Lake Charles",
    state: "LA",
    address: "500 Airport Blvd, Lake Charles, LA 70607",
  },
  {
    code: "MLU",
    name: "Monroe Regional Airport",
    city: "Monroe",
    state: "LA",
    address: "5400 Operations Rd, Monroe, LA 71203",
  },
  {
    code: "AEX",
    name: "Alexandria International Airport",
    city: "Alexandria",
    state: "LA",
    address: "3029 MacArthur Dr, Alexandria, LA 71303",
  },

  // South Carolina
  {
    code: "CHS",
    name: "Charleston International Airport",
    city: "Charleston",
    state: "SC",
    address: "5500 International Blvd, Charleston, SC 29418",
  },
  {
    code: "CAE",
    name: "Columbia Metropolitan Airport",
    city: "Columbia",
    state: "SC",
    address: "3000 Aviation Way, West Columbia, SC 29170",
  },
  {
    code: "GSP",
    name: "Greenville-Spartanburg International Airport",
    city: "Greer",
    state: "SC",
    address: "2000 GSP Dr, Greer, SC 29651",
  },
  {
    code: "MYR",
    name: "Myrtle Beach International Airport",
    city: "Myrtle Beach",
    state: "SC",
    address: "1100 Jetport Rd, Myrtle Beach, SC 29577",
  },

  // North Carolina
  {
    code: "CLT",
    name: "Charlotte Douglas International Airport",
    city: "Charlotte",
    state: "NC",
    address: "5501 Josh Birmingham Pkwy, Charlotte, NC 28208",
  },
  {
    code: "RDU",
    name: "Raleigh-Durham International Airport",
    city: "Raleigh",
    state: "NC",
    address: "2400 John Brantley Blvd, Morrisville, NC 27560",
  },
  {
    code: "GSO",
    name: "Piedmont Triad International Airport",
    city: "Greensboro",
    state: "NC",
    address: "1000 Ted Johnson Pkwy, Greensboro, NC 27409",
  },
  {
    code: "ILM",
    name: "Wilmington International Airport",
    city: "Wilmington",
    state: "NC",
    address: "1740 Airport Blvd, Wilmington, NC 28405",
  },
  {
    code: "FAY",
    name: "Fayetteville Regional Airport",
    city: "Fayetteville",
    state: "NC",
    address: "400 Airport Rd, Fayetteville, NC 28306",
  },
  {
    code: "AVL",
    name: "Asheville Regional Airport",
    city: "Asheville",
    state: "NC",
    address: "61 Terminal Dr, Fletcher, NC 28732",
  },

  // Kentucky
  {
    code: "SDF",
    name: "Louisville Muhammad Ali International Airport",
    city: "Louisville",
    state: "KY",
    address: "600 Terminal Dr, Louisville, KY 40209",
  },
  {
    code: "LEX",
    name: "Blue Grass Airport",
    city: "Lexington",
    state: "KY",
    address: "4000 Versailles Rd, Lexington, KY 40510",
  },
  {
    code: "BWG",
    name: "Bowling Green-Warren County Regional Airport",
    city: "Bowling Green",
    state: "KY",
    address: "2064 Three Springs Rd, Bowling Green, KY 42104",
  },

  // Arkansas
  {
    code: "LIT",
    name: "Bill and Hillary Clinton National Airport",
    city: "Little Rock",
    state: "AR",
    address: "1 Airport Dr, Little Rock, AR 72202",
  },
  {
    code: "XNA",
    name: "Northwest Arkansas Regional Airport",
    city: "Bentonville",
    state: "AR",
    address: "1 Airport Blvd, Bentonville, AR 72712",
  },
  {
    code: "FSM",
    name: "Fort Smith Regional Airport",
    city: "Fort Smith",
    state: "AR",
    address: "6700 McKennon Blvd, Fort Smith, AR 72903",
  },

  // Texas (Major Eastern)
  {
    code: "IAH",
    name: "George Bush Intercontinental Airport",
    city: "Houston",
    state: "TX",
    address: "2800 N Terminal Rd, Houston, TX 77032",
  },
  {
    code: "HOU",
    name: "William P. Hobby Airport",
    city: "Houston",
    state: "TX",
    address: "7800 Airport Blvd, Houston, TX 77061",
  },
  {
    code: "DFW",
    name: "Dallas/Fort Worth International Airport",
    city: "Dallas",
    state: "TX",
    address: "2400 Aviation Dr, DFW Airport, TX 75261",
  },
  {
    code: "DAL",
    name: "Dallas Love Field",
    city: "Dallas",
    state: "TX",
    address: "8008 Herb Kelleher Way, Dallas, TX 75235",
  },
  {
    code: "AUS",
    name: "Austin-Bergstrom International Airport",
    city: "Austin",
    state: "TX",
    address: "3600 Presidential Blvd, Austin, TX 78719",
  },
  {
    code: "SAT",
    name: "San Antonio International Airport",
    city: "San Antonio",
    state: "TX",
    address: "9800 Airport Blvd, San Antonio, TX 78216",
  },

  // Major US Hubs
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    state: "NY",
    address: "JFK Airport, Queens, NY 11430",
  },
  {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    state: "CA",
    address: "1 World Way, Los Angeles, CA 90045",
  },
  {
    code: "ORD",
    name: "O'Hare International Airport",
    city: "Chicago",
    state: "IL",
    address: "10000 W O'Hare Ave, Chicago, IL 60666",
  },
  {
    code: "DEN",
    name: "Denver International Airport",
    city: "Denver",
    state: "CO",
    address: "8500 Peña Blvd, Denver, CO 80249",
  },
  {
    code: "SFO",
    name: "San Francisco International Airport",
    city: "San Francisco",
    state: "CA",
    address: "San Francisco, CA 94128",
  },
  {
    code: "SEA",
    name: "Seattle-Tacoma International Airport",
    city: "Seattle",
    state: "WA",
    address: "17801 International Blvd, Seattle, WA 98158",
  },
  {
    code: "LAS",
    name: "Harry Reid International Airport",
    city: "Las Vegas",
    state: "NV",
    address: "5757 Wayne Newton Blvd, Las Vegas, NV 89119",
  },
  {
    code: "PHX",
    name: "Phoenix Sky Harbor International Airport",
    city: "Phoenix",
    state: "AZ",
    address: "3400 E Sky Harbor Blvd, Phoenix, AZ 85034",
  },
  {
    code: "MSP",
    name: "Minneapolis-Saint Paul International Airport",
    city: "Minneapolis",
    state: "MN",
    address: "4300 Glumack Dr, St Paul, MN 55111",
  },
  {
    code: "DTW",
    name: "Detroit Metropolitan Airport",
    city: "Detroit",
    state: "MI",
    address: "1 Detroit Metro Airport, Detroit, MI 48242",
  },
  {
    code: "PHL",
    name: "Philadelphia International Airport",
    city: "Philadelphia",
    state: "PA",
    address: "8000 Essington Ave, Philadelphia, PA 19153",
  },
  {
    code: "BOS",
    name: "Boston Logan International Airport",
    city: "Boston",
    state: "MA",
    address: "1 Harborside Dr, Boston, MA 02128",
  },
  {
    code: "LGA",
    name: "LaGuardia Airport",
    city: "New York",
    state: "NY",
    address: "LaGuardia Airport, Queens, NY 11371",
  },
  {
    code: "BWI",
    name: "Baltimore/Washington International Airport",
    city: "Baltimore",
    state: "MD",
    address: "Baltimore, MD 21240",
  },
  {
    code: "IAD",
    name: "Washington Dulles International Airport",
    city: "Washington",
    state: "DC",
    address: "1 Saarinen Cir, Dulles, VA 20166",
  },
  {
    code: "SLC",
    name: "Salt Lake City International Airport",
    city: "Salt Lake City",
    state: "UT",
    address: "776 N Terminal Dr, Salt Lake City, UT 84122",
  },
  {
    code: "PDX",
    name: "Portland International Airport",
    city: "Portland",
    state: "OR",
    address: "7000 NE Airport Way, Portland, OR 97218",
  },
  {
    code: "SAN",
    name: "San Diego International Airport",
    city: "San Diego",
    state: "CA",
    address: "3225 N Harbor Dr, San Diego, CA 92101",
  },
  {
    code: "STL",
    name: "St. Louis Lambert International Airport",
    city: "St. Louis",
    state: "MO",
    address: "10701 Lambert International Blvd, St. Louis, MO 63145",
  },
  {
    code: "CVG",
    name: "Cincinnati/Northern Kentucky International Airport",
    city: "Cincinnati",
    state: "OH",
    address: "3087 Terminal Dr, Hebron, KY 41048",
  },
  {
    code: "CLE",
    name: "Cleveland Hopkins International Airport",
    city: "Cleveland",
    state: "OH",
    address: "5300 Riverside Dr, Cleveland, OH 44135",
  },
  {
    code: "PIT",
    name: "Pittsburgh International Airport",
    city: "Pittsburgh",
    state: "PA",
    address: "1000 Airport Blvd, Pittsburgh, PA 15231",
  },
  {
    code: "IND",
    name: "Indianapolis International Airport",
    city: "Indianapolis",
    state: "IN",
    address: "7800 Col. H. Weir Cook Memorial Dr, Indianapolis, IN 46241",
  },
  {
    code: "KCI",
    name: "Kansas City International Airport",
    city: "Kansas City",
    state: "MO",
    address: "601 Brasilia Ave, Kansas City, MO 64153",
  },
  {
    code: "OMA",
    name: "Eppley Airfield",
    city: "Omaha",
    state: "NE",
    address: "4501 Abbott Dr, Omaha, NE 68110",
  },
  {
    code: "MCI",
    name: "Kansas City International Airport",
    city: "Kansas City",
    state: "MO",
    address: "601 Brasilia Ave, Kansas City, MO 64153",
  },
  {
    code: "OKC",
    name: "Will Rogers World Airport",
    city: "Oklahoma City",
    state: "OK",
    address: "7100 Terminal Dr, Oklahoma City, OK 73159",
  },
  {
    code: "TUL",
    name: "Tulsa International Airport",
    city: "Tulsa",
    state: "OK",
    address: "7777 E Apache St, Tulsa, OK 74115",
  },
  {
    code: "ABQ",
    name: "Albuquerque International Sunport",
    city: "Albuquerque",
    state: "NM",
    address: "2200 Sunport Blvd SE, Albuquerque, NM 87106",
  },
  {
    code: "BOI",
    name: "Boise Airport",
    city: "Boise",
    state: "ID",
    address: "3201 W Airport Way #1000, Boise, ID 83705",
  },
  {
    code: "SMF",
    name: "Sacramento International Airport",
    city: "Sacramento",
    state: "CA",
    address: "6900 Airport Blvd, Sacramento, CA 95837",
  },
  {
    code: "ONT",
    name: "Ontario International Airport",
    city: "Ontario",
    state: "CA",
    address: "2500 E Airport Dr, Ontario, CA 91761",
  },
  {
    code: "SNA",
    name: "John Wayne Airport",
    city: "Santa Ana",
    state: "CA",
    address: "18601 Airport Way, Santa Ana, CA 92707",
  },
  {
    code: "OAK",
    name: "Oakland International Airport",
    city: "Oakland",
    state: "CA",
    address: "1 Airport Dr, Oakland, CA 94621",
  },
  {
    code: "SJC",
    name: "Norman Y. Mineta San Jose International Airport",
    city: "San Jose",
    state: "CA",
    address: "1701 Airport Blvd, San Jose, CA 95110",
  },
  {
    code: "HNL",
    name: "Daniel K. Inouye International Airport",
    city: "Honolulu",
    state: "HI",
    address: "300 Rodgers Blvd, Honolulu, HI 96819",
  },
  {
    code: "ANC",
    name: "Ted Stevens Anchorage International Airport",
    city: "Anchorage",
    state: "AK",
    address: "5000 W International Airport Rd, Anchorage, AK 99502",
  },
  // Additional Major US Airports
  {
    code: "EWR",
    name: "Newark Liberty International Airport",
    city: "Newark",
    state: "NJ",
    address: "3 Brewster Rd, Newark, NJ 07114",
  },
  {
    code: "DCA",
    name: "Ronald Reagan Washington National Airport",
    city: "Arlington",
    state: "VA",
    address: "2401 Ronald Reagan Washington National Airport, Arlington, VA 22202",
  },
  {
    code: "MKE",
    name: "Milwaukee Mitchell International Airport",
    city: "Milwaukee",
    state: "WI",
    address: "5300 S Howell Ave, Milwaukee, WI 53207",
  },
  {
    code: "CMH",
    name: "John Glenn Columbus International Airport",
    city: "Columbus",
    state: "OH",
    address: "4600 International Gateway, Columbus, OH 43219",
  },
  {
    code: "MSN",
    name: "Dane County Regional Airport",
    city: "Madison",
    state: "WI",
    address: "4000 International Ln, Madison, WI 53704",
  },
  {
    code: "DSM",
    name: "Des Moines International Airport",
    city: "Des Moines",
    state: "IA",
    address: "5800 Fleur Dr, Des Moines, IA 50321",
  },
  {
    code: "GRR",
    name: "Gerald R. Ford International Airport",
    city: "Grand Rapids",
    state: "MI",
    address: "5500 44th St SE, Grand Rapids, MI 49512",
  },
  {
    code: "ROC",
    name: "Frederick Douglass Greater Rochester International Airport",
    city: "Rochester",
    state: "NY",
    address: "1200 Brooks Ave, Rochester, NY 14624",
  },
  {
    code: "SYR",
    name: "Syracuse Hancock International Airport",
    city: "Syracuse",
    state: "NY",
    address: "1000 Col Eileen Collins Blvd, Syracuse, NY 13212",
  },
  {
    code: "BUF",
    name: "Buffalo Niagara International Airport",
    city: "Buffalo",
    state: "NY",
    address: "4200 Genesee St, Buffalo, NY 14225",
  },
  {
    code: "RIC",
    name: "Richmond International Airport",
    city: "Richmond",
    state: "VA",
    address: "1 Richard E Byrd Terminal Dr, Richmond, VA 23250",
  },
  {
    code: "ORF",
    name: "Norfolk International Airport",
    city: "Norfolk",
    state: "VA",
    address: "2200 Norview Ave, Norfolk, VA 23518",
  },
  {
    code: "CRW",
    name: "Yeager Airport",
    city: "Charleston",
    state: "WV",
    address: "100 Airport Rd, Charleston, WV 25311",
  },
  {
    code: "EVV",
    name: "Evansville Regional Airport",
    city: "Evansville",
    state: "IN",
    address: "7801 Bussing Dr, Evansville, IN 47725",
  },
  {
    code: "CID",
    name: "The Eastern Iowa Airport",
    city: "Cedar Rapids",
    state: "IA",
    address: "2121 Arthur Collins Pkwy SW, Cedar Rapids, IA 52404",
  },
  {
    code: "FSD",
    name: "Sioux Falls Regional Airport",
    city: "Sioux Falls",
    state: "SD",
    address: "2801 N Jaycee Ln, Sioux Falls, SD 57104",
  },
  {
    code: "FAR",
    name: "Hector International Airport",
    city: "Fargo",
    state: "ND",
    address: "2801 32nd Ave N, Fargo, ND 58102",
  },
  {
    code: "BIS",
    name: "Bismarck Airport",
    city: "Bismarck",
    state: "ND",
    address: "2301 University Dr, Bismarck, ND 58504",
  },
  {
    code: "RAP",
    name: "Rapid City Regional Airport",
    city: "Rapid City",
    state: "SD",
    address: "4550 Terminal Rd, Rapid City, SD 57703",
  },
  {
    code: "GJT",
    name: "Grand Junction Regional Airport",
    city: "Grand Junction",
    state: "CO",
    address: "2828 Walker Field Dr, Grand Junction, CO 81506",
  },
  {
    code: "ASE",
    name: "Aspen/Pitkin County Airport",
    city: "Aspen",
    state: "CO",
    address: "233 E Airport Rd, Aspen, CO 81611",
  },
  {
    code: "GEG",
    name: "Spokane International Airport",
    city: "Spokane",
    state: "WA",
    address: "9000 W Airport Dr, Spokane, WA 99224",
  },
  {
    code: "BLI",
    name: "Bellingham International Airport",
    city: "Bellingham",
    state: "WA",
    address: "4255 Mitchell Way, Bellingham, WA 98226",
  },
  {
    code: "EUG",
    name: "Eugene Airport",
    city: "Eugene",
    state: "OR",
    address: "28801 Douglas Dr, Eugene, OR 97402",
  },
  {
    code: "RDM",
    name: "Redmond Municipal Airport",
    city: "Redmond",
    state: "OR",
    address: "2522 SE Jesse Butler Cir, Redmond, OR 97756",
  },
  {
    code: "ACV",
    name: "California Redwood Coast-Humboldt County Airport",
    city: "Arcata",
    state: "CA",
    address: "3561 Boeing Ave, McKinleyville, CA 95519",
  },
  {
    code: "CEC",
    name: "Del Norte County Airport",
    city: "Crescent City",
    state: "CA",
    address: "100 Dale Rupert Rd, Crescent City, CA 95531",
  },
  {
    code: "LIH",
    name: "Lihue Airport",
    city: "Lihue",
    state: "HI",
    address: "3901 Mokulele Loop, Lihue, HI 96766",
  },
  {
    code: "OGG",
    name: "Kahului Airport",
    city: "Kahului",
    state: "HI",
    address: "1 Keolani Pl, Kahului, HI 96732",
  },
  {
    code: "ITO",
    name: "Hilo International Airport",
    city: "Hilo",
    state: "HI",
    address: "2450 Kekuanaoa St, Hilo, HI 96720",
  },
  {
    code: "KOA",
    name: "Ellison Onizuka Kona International Airport",
    city: "Kailua-Kona",
    state: "HI",
    address: "73-200 Kupipi St, Kailua-Kona, HI 96740",
  },
  {
    code: "JNU",
    name: "Juneau International Airport",
    city: "Juneau",
    state: "AK",
    address: "1873 Shell Simmons Dr, Juneau, AK 99801",
  },
  {
    code: "FAI",
    name: "Fairbanks International Airport",
    city: "Fairbanks",
    state: "AK",
    address: "6450 Airport Way, Fairbanks, AK 99709",
  }
]

export default function AirportSelector({ selectedAirport, onAirportSelect, className }: AirportSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const searchTerms = searchTerm.toLowerCase().split(/\s+/)
      const filtered = AIRPORTS.filter((airport) => {
        const searchableText = [
          airport.code,
          airport.name,
          airport.city,
          airport.state,
          `${airport.city}, ${airport.state}`,
          `${airport.code} - ${airport.name}`,
        ].map(text => text.toLowerCase())

        return searchTerms.every(term => 
          searchableText.some(text => text.includes(term))
        )
      }).slice(0, 8) // Limit to 8 results

      setFilteredAirports(filtered)
      setShowResults(true)
      setSelectedIndex(-1)
    } else {
      setFilteredAirports([])
      setShowResults(false)
    }
  }, [searchTerm])

  const handleAirportSelect = (airport: Airport) => {
    onAirportSelect(airport)
    setSearchTerm("")
    setShowResults(false)
    setSelectedIndex(-1)
  }

  const handleClearSelection = () => {
    onAirportSelect(null)
    setSearchTerm("")
    setShowResults(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredAirports.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredAirports.length) {
          handleAirportSelect(filteredAirports[selectedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setShowResults(false)
        setSelectedIndex(-1)
        break
    }
  }

  if (selectedAirport) {
    return (
      <Card className={`p-3 bg-blue-50 border-blue-200 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Plane className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900 mb-1">
                {selectedAirport.code} - {selectedAirport.name}
              </div>
              <div className="text-sm text-gray-700 mb-1">
                {selectedAirport.city}, {selectedAirport.state}
              </div>
              <div className="text-xs text-gray-600">{selectedAirport.address}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
            className="text-xs"
          >
            Change
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="grid gap-2">
        <Label htmlFor="airport-search">Search Airport</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="airport-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Try: ATL, Atlanta, Georgia, or Hartsfield-Jackson..."
            className="pl-10"
            autoComplete="off"
          />
        </div>
      </div>

      {showResults && filteredAirports.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="space-y-1">
              {filteredAirports.map((airport, index) => (
                <div
                  key={airport.code}
                  className={`p-3 cursor-pointer rounded border-b border-gray-100 last:border-b-0 ${
                    index === selectedIndex ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleAirportSelect(airport)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        <span className="text-blue-600">{airport.code}</span> - {airport.name}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {airport.city}, {airport.state}
                      </div>
                      <div className="text-xs text-gray-500">{airport.address}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {showResults && filteredAirports.length === 0 && searchTerm.length >= 2 && (
        <Card className="absolute z-50 w-full mt-1">
          <div className="p-3 text-center text-gray-500">
            <p>No airports found matching "{searchTerm}"</p>
            <p className="text-xs mt-1">Try searching by airport code (e.g., ATL), city name, or state</p>
          </div>
        </Card>
      )}
    </div>
  )
}
