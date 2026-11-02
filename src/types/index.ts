export type UserRole = 'FARMER' | 'SUPPLIER' | 'BUYER' | 'ADMIN';
export type Language = 'am' | 'om' | 'ti' | 'en';
export type NavTab = 'home' | 'inputs' | 'produce' | 'prices' | 'orders' | '3d' | 'aiDoctor' | 'chat';

export interface User {
  id: string;
  phone: string;
  fullName: string;
  role: UserRole;
  language: Language;
  isVerified: boolean;
  nationalIdFayda?: string;
  cooperativeName?: string;
  businessName?: string;
  region: string;
  zone: string;
  woreda: string;
  kebele?: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface Product {
  id: string;
  supplierId: string;
  category: 'FERTILIZER' | 'SEED' | 'PESTICIDE' | 'TOOLS_PPE';
  title: string;
  titleAm?: string;
  titleOm?: string;
  description: string;
  brandOrVariety: string;
  priceEtb: number;
  unit: string;
  stockQuantity: number;
  isSubsidizedCoop: boolean;
  region: string;
  zone: string;
  woreda: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  model3dKey?: 'tractor' | 'sprayer' | 'fertilizer_bag' | 'teff_sheaf' | 'coffee_branch';
  createdAt: string;
  distanceKm?: number;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string;
  cropOrLivestock: string;
  variety: string;
  grade: 'Grade 1' | 'Grade 2' | 'Standard';
  quantity: number;
  unit: string;
  pricePerUnitEtb: number;
  region: string;
  zone: string;
  woreda: string;
  lat: number;
  lng: number;
  description: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  imageUrl?: string;
  model3dKey?: 'teff_sheaf' | 'coffee_branch' | 'maize_cob';
  createdAt: string;
  distanceKm?: number;
}

export interface PriceReport {
  id: string;
  commodity: string;
  marketName: string;
  region: string;
  unit: string;
  minPriceEtb: number;
  maxPriceEtb: number;
  avgPriceEtb: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  changePct: number;
  reportDate: string;
  history: { date: string; avgPriceEtb: number }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: 'INPUT_PURCHASE' | 'PRODUCE_PURCHASE';
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  productId?: string;
  productTitle?: string;
  produceListingId?: string;
  produceTitle?: string;
  quantity: number;
  unit: string;
  unitPriceEtb: number;
  totalAmountEtb: number;
  status: 'PENDING' | 'CONFIRMED' | 'ESCROW_HELD' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  deliveryMethod: 'PICKUP' | 'SUPPLIER_DELIVERY' | 'COOP_POINT';
  deliveryAddress: string;
  confirmationOtp: string;
  paymentMethod: 'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'CASH_ON_DELIVERY';
  paymentStatus: 'PENDING' | 'ESCROW_HELD' | 'RELEASED';
  createdAt: string;
  updatedAt: string;
}

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthNameAm: string;
  monthNameOm: string;
  monthNameTi: string;
  monthNameEn: string;
  formattedAm: string;
  formattedOm: string;
  formattedTi: string;
  formattedEn: string;
}

export interface PlantDiagnosisResult {
  cropIdentified: string;
  issueName: string;
  issueNameAm: string;
  issueNameOm: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH';
  confidence: number;
  symptoms: string;
  symptomsAm?: string;
  symptomsOm?: string;
  treatmentAdvice: string;
  treatmentAdviceAm?: string;
  treatmentAdviceOm?: string;
  preventativeMeasures: string;
  recommendedMedicine: {
    medicineName: string;
    medicineNameAm?: string;
    medicineNameOm?: string;
    activeIngredient: string;
    dosageInstructions: string;
    matchedProductId: string | null;
    matchedProductTitle: string | null;
    matchedProductPriceEtb: number | null;
    matchedProductUnit: string | null;
  };
}
