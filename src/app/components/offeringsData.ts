// ── Shared Offerings Data ───────────────────────────────────────────
// Single source of truth used by both the Offerings module table
// and the Configure Offering Access dropdown on User Profile.

export interface Offering {
  id: string;
  name: string;
  group: string;
  scenarios: number;
  seller: string;
  status: string;
  type: string;
  sellerAccess: string;
}

export const OFFERINGS_DATA: Offering[] = [
  {
    id: "off-1",
    name: "$1M One-Time Online Sub-Prime Installment Loan Portfolio Opportunity",
    group: "Select Offering Group",
    scenarios: 0,
    seller: "PH Financial",
    status: "Viewable by Administrators",
    type: "Private, can update until close",
    sellerAccess: "No Visibility",
  },
  {
    id: "off-2",
    name: "$245 One-time Multi Segment Commercial Portfolio",
    group: "Select Offering Group",
    scenarios: 4,
    seller: "DLL Financial Solutions Partner",
    status: "Open for Bids",
    type: "Private, can update until close",
    sellerAccess: "No Visibility",
  },
  {
    id: "off-3",
    name: "2022 - CreditNinja Fresh IL FF",
    group: "Credit Ninja 2023",
    scenarios: 3,
    seller: "Credit Ninja",
    status: "Closed, not visible to buyers (unless Doc outstanding or bid won)",
    type: "Private, can update until close",
    sellerAccess: "No Visibility",
  },
  {
    id: "off-4",
    name: "2023 - Credit Ninja Fresh IL FF",
    group: "Credit Ninja 2023",
    scenarios: 2,
    seller: "Credit Ninja",
    status: "Closed, not visible to buyers (unless Doc outstanding or bid won)",
    type: "Private, can update until close",
    sellerAccess: "Full Visibility",
  },
  {
    id: "off-5",
    name: "2023 ADF Fresh unsecured Personal Loan",
    group: "ADF Fresh Unsecured PL FF",
    scenarios: 3,
    seller: "Applied Data Finance",
    status: "Closed, not visible to buyers (unless Doc outstanding or bid won)",
    type: "Private, can update until close",
    sellerAccess: "No Visibility",
  },
  {
    id: "off-6",
    name: "Brinks - $60M Warehouse and Forward Flow Offering",
    group: "Select Offering Group",
    scenarios: 4,
    seller: "Brinks Home Security",
    status: "Viewable by Sellers and Buyers",
    type: "Private, can update until close",
    sellerAccess: "No Visibility",
  },
  {
    id: "off-7",
    name: "3 Consumer Loan Forward Flow Opportunities - 12 Month Term 2024",
    group: "Select Offering Group",
    scenarios: 3,
    seller: "CURO Group Holdings Corp",
    status: "Closed, visible to buyers",
    type: "Private, can update until close",
    sellerAccess: "No Visibility",
  },
  {
    id: "off-8",
    name: "One Agency One-Time Warehouse",
    group: "Select Offering Group",
    scenarios: 3,
    seller: "Advance Financial",
    status: "Closed, visible to buyers",
    type: "Private, can update until close",
    sellerAccess: "Full Visibility",
  },
  {
    id: "off-9",
    name: "Advance Financial - $33.6M Loc and IL",
    group: "Select Offering Group",
    scenarios: 1,
    seller: "Advance Financial",
    status: "Closed, visible to buyers",
    type: "Private, can update until close",
    sellerAccess: "No Visibility",
  },
  {
    id: "off-10",
    name: "LendCare - DNF",
    group: "LendCare",
    scenarios: 1,
    seller: "LendCare",
    status: "Closed, not visible to buyers (unless Doc outstanding or bid won)",
    type: "Private, can update until close",
    sellerAccess: "No Visibility",
  },
  {
    id: "off-11",
    name: "LendCare - GCS",
    group: "LendCare",
    scenarios: 1,
    seller: "LendCare",
    status: "Closed, visible to buyers",
    type: "Private, can update until close",
    sellerAccess: "Full Visibility",
  },
  {
    id: "off-12",
    name: "2025 ADF Fresh Unsecured Personal Loan",
    group: "ADF Fresh Unsecured PL FF",
    scenarios: 1,
    seller: "Applied Data Finance",
    status: "Closed, visible to buyers",
    type: "Private, can update until close",
    sellerAccess: "No Visibility",
  },
];
