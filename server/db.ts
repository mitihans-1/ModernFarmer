import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface User {
  id: string;
  phone: string;
  fullName: string;
  role: 'FARMER' | 'SUPPLIER' | 'BUYER' | 'ADMIN';
  language: 'am' | 'om' | 'ti' | 'en';
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
}

export interface ProduceListing {
  id: string;
  farmerId: string;
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
  confirmationOtp: string; // 4-digit verification code given to buyer
  paymentMethod: 'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'CASH_ON_DELIVERY';
  paymentStatus: 'PENDING' | 'ESCROW_HELD' | 'RELEASED';
  escrowReleaseCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationDivision {
  region: string;
  zones: {
    name: string;
    woredas: {
      name: string;
      lat: number;
      lng: number;
    }[];
  }[];
}

export interface DatabaseState {
  users: User[];
  products: Product[];
  produceListings: ProduceListing[];
  priceReports: PriceReport[];
  orders: Order[];
  currentUserId: string;
}

// Haversine formula to compute ground distance in kilometers between two GPS coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const ETHIOPIAN_LOCATIONS: LocationDivision[] = [
  {
    region: 'Oromia',
    zones: [
      {
        name: 'East Shewa',
        woredas: [
          { name: "Ada'a (Bishoftu)", lat: 8.7523, lng: 38.9785 },
          { name: 'Lume (Mojo)', lat: 8.5833, lng: 39.1167 },
          { name: 'Adama Zuria', lat: 8.5400, lng: 39.2700 },
        ],
      },
      {
        name: 'Jimma',
        woredas: [
          { name: 'Jimma Town', lat: 7.6734, lng: 36.8344 },
          { name: 'Gomma', lat: 7.8500, lng: 36.6500 },
          { name: 'Mana', lat: 7.7500, lng: 36.7800 },
        ],
      },
      {
        name: 'West Arsi',
        woredas: [
          { name: 'Shashemene Zuria', lat: 7.2000, lng: 38.6000 },
          { name: 'Arsi Negele', lat: 7.3500, lng: 38.7000 },
        ],
      },
    ],
  },
  {
    region: 'Amhara',
    zones: [
      {
        name: 'West Gojjam',
        woredas: [
          { name: 'Bahir Dar Zuria', lat: 11.5890, lng: 37.3900 },
          { name: 'Yilmana Densa', lat: 11.2800, lng: 37.4500 },
          { name: 'Finote Selam', lat: 10.7000, lng: 37.2667 },
        ],
      },
      {
        name: 'East Gojjam',
        woredas: [
          { name: 'Dejen', lat: 10.1667, lng: 38.1333 },
          { name: 'Debre Markos', lat: 10.3333, lng: 37.7333 },
        ],
      },
      {
        name: 'South Gondar',
        woredas: [
          { name: 'Fogera', lat: 11.9167, lng: 37.6167 },
          { name: 'Dera', lat: 11.7000, lng: 37.5500 },
        ],
      },
    ],
  },
  {
    region: 'Sidama',
    zones: [
      {
        name: 'Sidama Zone',
        woredas: [
          { name: 'Hawassa Zuria', lat: 7.0500, lng: 38.4667 },
          { name: 'Aleta Wondo', lat: 6.6000, lng: 38.4167 },
          { name: 'Yirgalem', lat: 6.7500, lng: 38.4167 },
        ],
      },
    ],
  },
  {
    region: 'Addis Ababa',
    zones: [
      {
        name: 'Addis Ababa',
        woredas: [
          { name: 'Merkato / Addis Ketema', lat: 9.0300, lng: 38.7400 },
          { name: 'Akaki Kality', lat: 8.8800, lng: 38.7600 },
          { name: 'Bole', lat: 8.9900, lng: 38.7800 },
        ],
      },
    ],
  },
  {
    region: 'Tigray',
    zones: [
      {
        name: 'Central Tigray',
        woredas: [
          { name: 'Axum Zuria', lat: 14.1300, lng: 38.7200 },
          { name: 'Adwa', lat: 14.1600, lng: 38.9000 },
        ],
      },
      {
        name: 'South Tigray',
        woredas: [
          { name: 'Raya Alamata', lat: 12.4200, lng: 39.5500 },
        ],
      },
    ],
  },
];

function createInitialState(): DatabaseState {
  const users: User[] = [
    {
      id: 'farmer-bekele',
      phone: '+251911234567',
      fullName: 'Ato Bekele Tadesse',
      role: 'FARMER',
      language: 'en',
      isVerified: true,
      nationalIdFayda: 'FAYDA-9821-4321',
      cooperativeName: "Ada'a Liben Farmers Cooperative Union",
      region: 'Oromia',
      zone: 'East Shewa',
      woreda: "Ada'a (Bishoftu)",
      kebele: 'Ude Kebele',
      lat: 8.7523,
      lng: 38.9785,
      createdAt: '2026-01-10T08:00:00Z',
    },
    {
      id: 'supplier-almaz',
      phone: '+251922345678',
      fullName: 'W/ro Almaz Tefera',
      businessName: 'EthioAgro Certified Seeds & Inputs',
      role: 'SUPPLIER',
      language: 'am',
      isVerified: true,
      nationalIdFayda: 'FAYDA-5512-8890',
      region: 'Amhara',
      zone: 'West Gojjam',
      woreda: 'Bahir Dar Zuria',
      kebele: 'Kebele 04 Agro Center',
      lat: 11.5890,
      lng: 37.3900,
      createdAt: '2026-01-05T09:30:00Z',
    },
    {
      id: 'buyer-dawit',
      phone: '+251933456789',
      fullName: 'Dawit Kebede',
      businessName: 'Abyssinia Premium Grain & Coffee Processors',
      role: 'BUYER',
      language: 'en',
      isVerified: true,
      region: 'Addis Ababa',
      zone: 'Addis Ababa',
      woreda: 'Merkato / Addis Ketema',
      lat: 9.0300,
      lng: 38.7400,
      createdAt: '2026-01-02T11:00:00Z',
    },
    {
      id: 'admin-ethio',
      phone: '+251944567890',
      fullName: 'Ministry of Agriculture Regional Bureau',
      role: 'ADMIN',
      language: 'am',
      isVerified: true,
      region: 'Addis Ababa',
      zone: 'Addis Ababa',
      woreda: 'Bole',
      lat: 8.9900,
      lng: 38.7800,
      createdAt: '2025-12-01T00:00:00Z',
    },
  ];

  const products: Product[] = [
    {
      id: 'prod-urea-50kg',
      supplierId: 'supplier-almaz',
      category: 'FERTILIZER',
      title: 'Urea Fertilizer 46% N (50kg Bag)',
      titleAm: 'ዩሪያ ማዳበሪያ 46% ናይትሮጅን (50 ኪ.ግ)',
      titleOm: 'Xaa’oo Yuuriyaa 46% N (Kiloogiraama 50)',
      description: 'High-purity nitrogen fertilizer approved by the Ministry of Agriculture. Enhances vegetative growth for cereals, maize, and teff.',
      brandOrVariety: 'Ethiopian Fertilizer Enterprise / EFE Grade A',
      priceEtb: 4200,
      unit: '50kg Bag',
      stockQuantity: 450,
      isSubsidizedCoop: true,
      region: 'Amhara',
      zone: 'West Gojjam',
      woreda: 'Bahir Dar Zuria',
      lat: 11.5890,
      lng: 37.3900,
      model3dKey: 'fertilizer_bag',
      createdAt: '2026-02-01T08:00:00Z',
    },
    {
      id: 'prod-nps-50kg',
      supplierId: 'supplier-almaz',
      category: 'FERTILIZER',
      title: 'NPS Compound Fertilizer (19N-38P-7S) (50kg)',
      titleAm: 'ኤን ፒ ኤስ የተመጣጠነ ማዳበሪያ (19N-38P-7S) (50 ኪ.ግ)',
      titleOm: 'Xaa’oo NPS (19N-38P-7S) (Kiloogiraama 50)',
      description: 'Balanced Nitrogen, Phosphorus, and Sulfur formula formulated for Ethiopian highland soil profiles.',
      brandOrVariety: 'ATA Soil Blend Standard',
      priceEtb: 4450,
      unit: '50kg Bag',
      stockQuantity: 320,
      isSubsidizedCoop: true,
      region: 'Amhara',
      zone: 'West Gojjam',
      woreda: 'Bahir Dar Zuria',
      lat: 11.5890,
      lng: 37.3900,
      model3dKey: 'fertilizer_bag',
      createdAt: '2026-02-05T09:00:00Z',
    },
    {
      id: 'prod-teff-seed-magna',
      supplierId: 'supplier-almaz',
      category: 'SEED',
      title: 'Certified White Teff Seed - DZ-Cr-37 (Magna)',
      titleAm: 'የተረጋገጠ የማኛ ጤፍ ዘር (ዲዜድ-ሲአር-37)',
      titleOm: 'Sanyii Xaafii Maganaa Mirkanaa’e (DZ-Cr-37)',
      description: 'Breeding line from Debre Zeit Agricultural Research Centre. 98% purity, 90% germination rate, drought resilient.',
      brandOrVariety: 'DZ-Cr-37 (Magna White)',
      priceEtb: 7200,
      unit: 'Quintal (100kg)',
      stockQuantity: 85,
      isSubsidizedCoop: false,
      region: 'Oromia',
      zone: 'East Shewa',
      woreda: "Ada'a (Bishoftu)",
      lat: 8.7523,
      lng: 38.9785,
      model3dKey: 'teff_sheaf',
      createdAt: '2026-02-10T10:00:00Z',
    },
    {
      id: 'prod-wheat-seed-ogolcho',
      supplierId: 'supplier-almaz',
      category: 'SEED',
      title: 'Certified Bread Wheat Seed - Ogolcho Variety',
      titleAm: 'የዳቦ ስንዴ የተመረጠ ዘር - ኦጎልቾ',
      titleOm: 'Sanyii Qamadii Filatamaa - Ogoolchoo',
      description: 'Rust-resistant bread wheat seed with superior flour protein content and high tillering capacity.',
      brandOrVariety: 'Ogolcho / Kulumsa Research',
      priceEtb: 5800,
      unit: 'Quintal (100kg)',
      stockQuantity: 110,
      isSubsidizedCoop: false,
      region: 'Amhara',
      zone: 'West Gojjam',
      woreda: 'Bahir Dar Zuria',
      lat: 11.5890,
      lng: 37.3900,
      createdAt: '2026-02-12T11:00:00Z',
    },
    {
      id: 'prod-apron-star',
      supplierId: 'supplier-almaz',
      category: 'PESTICIDE',
      title: 'Apron Star 42WS Fungicide & Insecticide Seed Treatment',
      titleAm: 'አፕሮን ስታር የዘር ማከሚያ ፈንገስና ተባይ መከላከያ (100ግ)',
      titleOm: 'Qoricha Sanyii Apron Star (Graama 100)',
      description: 'Essential seed dressing protectant against downy mildew, seedling blight, and wireworm infestation.',
      brandOrVariety: 'Syngenta Ethiopia Approved',
      priceEtb: 580,
      unit: '100g Packet',
      stockQuantity: 600,
      isSubsidizedCoop: false,
      region: 'Amhara',
      zone: 'West Gojjam',
      woreda: 'Bahir Dar Zuria',
      lat: 11.5890,
      lng: 37.3900,
      createdAt: '2026-02-15T12:00:00Z',
    },
    {
      id: 'prod-mancozeb-1kg',
      supplierId: 'supplier-almaz',
      category: 'PESTICIDE',
      title: 'Mancozeb 80% WP Broad Spectrum Contact Fungicide (1kg)',
      titleAm: 'ማንኮዜብ 80% ደረቅ ዱቄት የፈንገስ መከላከያ መድሃኒት (1 ኪ.ግ)',
      titleOm: 'Qoricha Fangasii Maankoozeebii 80% WP (Kiiloo 1)',
      description: 'Standard protective fungicide for teff rust, potato/onion late blight, and coffee leaf rust. Approved by Ethiopian Ministry of Agriculture.',
      brandOrVariety: 'Indofil M-45 Grade',
      priceEtb: 850,
      unit: '1kg Pack',
      stockQuantity: 240,
      isSubsidizedCoop: false,
      region: 'Amhara',
      zone: 'West Gojjam',
      woreda: 'Bahir Dar Zuria',
      lat: 11.5890,
      lng: 37.3900,
      createdAt: '2026-02-16T10:00:00Z',
    },
    {
      id: 'prod-dimethoate-1l',
      supplierId: 'supplier-almaz',
      category: 'PESTICIDE',
      title: 'Dimethoate 40% EC Systemic Insecticide (1 Liter)',
      titleAm: 'ዳይሜቶኤት 40% ፈሳሽ የተባይ መከላከያ መድሃኒት (1 ሊትር)',
      titleOm: 'Qoricha Ilbiisotaa Daaymeetooheetii 40% EC (Liitira 1)',
      description: 'Systemic organophosphate insecticide for fast control of aphids, stem borers, thrips, and leaf miners on teff, maize, and vegetables.',
      brandOrVariety: 'Rogor Standard',
      priceEtb: 950,
      unit: '1 Liter Bottle',
      stockQuantity: 180,
      isSubsidizedCoop: false,
      region: 'Oromia',
      zone: 'East Shewa',
      woreda: "Ada'a (Bishoftu)",
      lat: 8.7523,
      lng: 38.9785,
      createdAt: '2026-02-17T11:00:00Z',
    },
    {
      id: 'prod-ppe-suit',
      supplierId: 'supplier-almaz',
      category: 'TOOLS_PPE',
      title: 'Farmer Chemical Safety & PPE Protective Gear Kit',
      titleAm: 'የአርሶ አደር ደህንነት መጠበቂያ ልብስ እና ማስክ ሙሉ ኪት',
      titleOm: 'Uffata Eegumsa Qonnaan Bulaa fi Maaskii',
      description: 'Heavy chemical-resistant waterproof apron, nitrile elbow gloves, N95 organic vapor dual respirator, and eye shield.',
      brandOrVariety: 'AgroShield Safety Pro',
      priceEtb: 1450,
      unit: 'Complete Kit',
      stockQuantity: 150,
      isSubsidizedCoop: false,
      region: 'Oromia',
      zone: 'East Shewa',
      woreda: "Ada'a (Bishoftu)",
      lat: 8.7523,
      lng: 38.9785,
      createdAt: '2026-02-18T14:00:00Z',
    },
    {
      id: 'prod-knapsack-sprayer',
      supplierId: 'supplier-almaz',
      category: 'TOOLS_PPE',
      title: '16-Liter Manual Knapsack Pressure Sprayer with Brass Lance',
      titleAm: '16 ሊትር የጀርባ ኬሚካል መርጫ በነሐስ ቧንቧ',
      titleOm: 'Biifaa Qorichaa Litira 16 Dugdatti Baatamu',
      description: 'Reinforced UV-stabilized polyethylene tank with dual cone/fan brass nozzles, adjustable padded shoulder straps.',
      brandOrVariety: 'Solo Agro Heavy-Duty',
      priceEtb: 2850,
      unit: 'Piece',
      stockQuantity: 95,
      isSubsidizedCoop: false,
      region: 'Amhara',
      zone: 'West Gojjam',
      woreda: 'Bahir Dar Zuria',
      lat: 11.5890,
      lng: 37.3900,
      model3dKey: 'sprayer',
      createdAt: '2026-02-20T15:00:00Z',
    },
  ];

  const produceListings: ProduceListing[] = [
    {
      id: 'prod-list-teff-magna',
      farmerId: 'farmer-bekele',
      cropOrLivestock: 'Teff',
      variety: 'Magna (White)',
      grade: 'Grade 1',
      quantity: 50,
      unit: 'Quintal (100kg)',
      pricePerUnitEtb: 5400,
      region: 'Oromia',
      zone: 'East Shewa',
      woreda: "Ada'a (Bishoftu)",
      lat: 8.7523,
      lng: 38.9785,
      description: 'First-harvest pristine white teff from Ada’a plains. Double-sieved, sand-free, moisture below 11%. Stored in moisture-proof polypropylene bags.',
      status: 'AVAILABLE',
      model3dKey: 'teff_sheaf',
      createdAt: '2026-02-15T09:00:00Z',
    },
    {
      id: 'prod-list-sidama-coffee',
      farmerId: 'farmer-bekele',
      cropOrLivestock: 'Coffee',
      variety: 'Sidama Washed Heirloom',
      grade: 'Grade 1',
      quantity: 30,
      unit: 'Quintal (100kg)',
      pricePerUnitEtb: 18500,
      region: 'Sidama',
      zone: 'Sidama Zone',
      woreda: 'Aleta Wondo',
      lat: 6.6000,
      lng: 38.4167,
      description: 'High altitude (2,100m) specialty Arabica cherries, wet-processed with floral bergamot notes and lemon acidity. Ready for parchment grading.',
      status: 'AVAILABLE',
      model3dKey: 'coffee_branch',
      createdAt: '2026-02-18T10:00:00Z',
    },
    {
      id: 'prod-list-red-teff',
      farmerId: 'farmer-bekele',
      cropOrLivestock: 'Teff',
      variety: 'Serena (Red Teff)',
      grade: 'Grade 2',
      quantity: 40,
      unit: 'Quintal (100kg)',
      pricePerUnitEtb: 4800,
      region: 'Amhara',
      zone: 'East Gojjam',
      woreda: 'Dejen',
      lat: 10.1667,
      lng: 38.1333,
      description: 'Mineral-rich red teff with high iron content, excellent for authentic injera fermentation. Cleaned and ready for transport.',
      status: 'AVAILABLE',
      model3dKey: 'teff_sheaf',
      createdAt: '2026-02-19T11:00:00Z',
    },
    {
      id: 'prod-list-bread-wheat',
      farmerId: 'farmer-bekele',
      cropOrLivestock: 'Wheat',
      variety: 'Dande’a Bread Wheat',
      grade: 'Grade 1',
      quantity: 75,
      unit: 'Quintal (100kg)',
      pricePerUnitEtb: 4200,
      region: 'Oromia',
      zone: 'East Shewa',
      woreda: 'Lume (Mojo)',
      lat: 8.5833,
      lng: 39.1167,
      description: 'Plump golden grains, protein 12.8%, ideal for milling and commercial baking.',
      status: 'AVAILABLE',
      createdAt: '2026-02-21T13:00:00Z',
    },
    {
      id: 'prod-list-bombay-onion',
      farmerId: 'farmer-bekele',
      cropOrLivestock: 'Onion',
      variety: 'Bombay Red',
      grade: 'Standard',
      quantity: 90,
      unit: 'Quintal (100kg)',
      pricePerUnitEtb: 3300,
      region: 'Amhara',
      zone: 'South Gondar',
      woreda: 'Fogera',
      lat: 11.9167,
      lng: 37.6167,
      description: 'Cured red onions from Lake Tana basin irrigation scheme. Thick skin, excellent storage stability for regional market shipping.',
      status: 'AVAILABLE',
      createdAt: '2026-02-22T14:00:00Z',
    },
  ];

  const priceReports: PriceReport[] = [
    {
      id: 'price-teff-white-addis',
      commodity: 'Teff (White / Magna)',
      marketName: 'Addis Ababa Merkato (እህል በረንዳ)',
      region: 'Addis Ababa',
      unit: 'Quintal (100kg)',
      minPriceEtb: 5300,
      maxPriceEtb: 5700,
      avgPriceEtb: 5500,
      trend: 'UP',
      changePct: 2.8,
      reportDate: '2026-02-22T06:00:00Z',
      history: [
        { date: '2026-02-16', avgPriceEtb: 5350 },
        { date: '2026-02-18', avgPriceEtb: 5400 },
        { date: '2026-02-20', avgPriceEtb: 5450 },
        { date: '2026-02-22', avgPriceEtb: 5500 },
      ],
    },
    {
      id: 'price-teff-white-bishoftu',
      commodity: 'Teff (White / Magna)',
      marketName: "Ada'a Bishoftu Central Grain Market",
      region: 'Oromia',
      unit: 'Quintal (100kg)',
      minPriceEtb: 5100,
      maxPriceEtb: 5450,
      avgPriceEtb: 5300,
      trend: 'STABLE',
      changePct: 0.4,
      reportDate: '2026-02-22T06:00:00Z',
      history: [
        { date: '2026-02-16', avgPriceEtb: 5280 },
        { date: '2026-02-18', avgPriceEtb: 5300 },
        { date: '2026-02-20', avgPriceEtb: 5290 },
        { date: '2026-02-22', avgPriceEtb: 5300 },
      ],
    },
    {
      id: 'price-teff-red-bahirdar',
      commodity: 'Teff (Red / Serena)',
      marketName: 'Bahir Dar Central Market (ደጃዝማች ዑመር)',
      region: 'Amhara',
      unit: 'Quintal (100kg)',
      minPriceEtb: 4600,
      maxPriceEtb: 4950,
      avgPriceEtb: 4780,
      trend: 'DOWN',
      changePct: -1.4,
      reportDate: '2026-02-22T06:00:00Z',
      history: [
        { date: '2026-02-16', avgPriceEtb: 4850 },
        { date: '2026-02-18', avgPriceEtb: 4820 },
        { date: '2026-02-20', avgPriceEtb: 4800 },
        { date: '2026-02-22', avgPriceEtb: 4780 },
      ],
    },
    {
      id: 'price-coffee-sidama',
      commodity: 'Specialty Coffee (Washed Arabica)',
      marketName: 'Hawassa Commodity Exchange Terminal',
      region: 'Sidama',
      unit: 'Quintal (100kg)',
      minPriceEtb: 17800,
      maxPriceEtb: 19400,
      avgPriceEtb: 18600,
      trend: 'UP',
      changePct: 4.5,
      reportDate: '2026-02-22T06:00:00Z',
      history: [
        { date: '2026-02-16', avgPriceEtb: 17700 },
        { date: '2026-02-18', avgPriceEtb: 18100 },
        { date: '2026-02-20', avgPriceEtb: 18400 },
        { date: '2026-02-22', avgPriceEtb: 18600 },
      ],
    },
    {
      id: 'price-wheat-bread',
      commodity: 'Bread Wheat (Highland)',
      marketName: 'Asella Regional Granary',
      region: 'Oromia',
      unit: 'Quintal (100kg)',
      minPriceEtb: 3950,
      maxPriceEtb: 4350,
      avgPriceEtb: 4150,
      trend: 'STABLE',
      changePct: 0.2,
      reportDate: '2026-02-22T06:00:00Z',
      history: [
        { date: '2026-02-16', avgPriceEtb: 4140 },
        { date: '2026-02-18', avgPriceEtb: 4150 },
        { date: '2026-02-20', avgPriceEtb: 4140 },
        { date: '2026-02-22', avgPriceEtb: 4150 },
      ],
    },
    {
      id: 'price-onion-red',
      commodity: 'Red Onion (Bombay)',
      marketName: 'Addis Ababa Merkato Fresh Produce',
      region: 'Addis Ababa',
      unit: 'Quintal (100kg)',
      minPriceEtb: 3200,
      maxPriceEtb: 3800,
      avgPriceEtb: 3500,
      trend: 'UP',
      changePct: 6.1,
      reportDate: '2026-02-22T06:00:00Z',
      history: [
        { date: '2026-02-16', avgPriceEtb: 3100 },
        { date: '2026-02-18', avgPriceEtb: 3250 },
        { date: '2026-02-20', avgPriceEtb: 3380 },
        { date: '2026-02-22', avgPriceEtb: 3500 },
      ],
    },
  ];

  const orders: Order[] = [
    {
      id: 'order-fl-1001',
      orderNumber: 'ETH-2026-1001',
      orderType: 'INPUT_PURCHASE',
      buyerId: 'farmer-bekele',
      buyerName: 'Ato Bekele Tadesse',
      buyerPhone: '+251911234567',
      sellerId: 'supplier-almaz',
      sellerName: 'W/ro Almaz Tefera (EthioAgro)',
      sellerPhone: '+251922345678',
      productId: 'prod-urea-50kg',
      productTitle: 'Urea Fertilizer 46% N (50kg Bag)',
      quantity: 5,
      unit: '50kg Bag',
      unitPriceEtb: 4200,
      totalAmountEtb: 21000,
      status: 'ESCROW_HELD',
      deliveryMethod: 'COOP_POINT',
      deliveryAddress: "Ada'a Liben Cooperative Distribution Depot #3",
      confirmationOtp: '4829',
      paymentMethod: 'TELEBIRR',
      paymentStatus: 'ESCROW_HELD',
      createdAt: '2026-02-21T10:30:00Z',
      updatedAt: '2026-02-21T10:35:00Z',
    },
    {
      id: 'order-fl-1002',
      orderNumber: 'ETH-2026-1002',
      orderType: 'PRODUCE_PURCHASE',
      buyerId: 'buyer-dawit',
      buyerName: 'Dawit Kebede (Abyssinia Mills)',
      buyerPhone: '+251933456789',
      sellerId: 'farmer-bekele',
      sellerName: 'Ato Bekele Tadesse',
      sellerPhone: '+251911234567',
      produceListingId: 'prod-list-teff-magna',
      produceTitle: 'White Teff (Magna) Grade 1',
      quantity: 20,
      unit: 'Quintal (100kg)',
      unitPriceEtb: 5400,
      totalAmountEtb: 108000,
      status: 'CONFIRMED',
      deliveryMethod: 'PICKUP',
      deliveryAddress: "Ada'a Farmstead, Kebele 02, Bishoftu",
      confirmationOtp: '9152',
      paymentMethod: 'CBE_BIRR',
      paymentStatus: 'PENDING',
      createdAt: '2026-02-22T08:15:00Z',
      updatedAt: '2026-02-22T08:20:00Z',
    },
  ];

  return {
    users,
    products,
    produceListings,
    priceReports,
    orders,
    currentUserId: 'farmer-bekele',
  };
}

class Database {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    const initial = createInitialState();
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        if (raw && raw.trim().length > 0) {
          const parsed = JSON.parse(raw);
          const state: DatabaseState = {
            users: Array.isArray(parsed.users) ? parsed.users : initial.users,
            products: Array.isArray(parsed.products) ? parsed.products : initial.products,
            produceListings: Array.isArray(parsed.produceListings) ? parsed.produceListings : initial.produceListings,
            priceReports: Array.isArray(parsed.priceReports) ? parsed.priceReports : initial.priceReports,
            orders: Array.isArray(parsed.orders) ? parsed.orders : initial.orders,
            currentUserId: parsed.currentUserId || initial.currentUserId,
          };
          return state;
        }
      }
    } catch (err) {
      console.warn('Failed to load DB file, reinitializing default:', err);
    }
    this.save(initial);
    return initial;
  }

  private save(state: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByPhone(phone: string): User | undefined {
    return this.state.users.find((u) => u.phone === phone);
  }

  public getCurrentUser(): User {
    const user = this.getUserById(this.state.currentUserId);
    if (user) return user;
    if (this.state.users && this.state.users.length > 0) {
      return this.state.users[0];
    }
    const initial = createInitialState();
    this.state.users = initial.users;
    this.state.currentUserId = initial.currentUserId;
    this.save(this.state);
    return this.state.users[0];
  }

  public setCurrentUserId(id: string): User {
    const user = this.getUserById(id);
    if (!user) throw new Error(`User ${id} not found`);
    this.state.currentUserId = id;
    this.save(this.state);
    return user;
  }

  public updateUserLanguage(userId: string, language: 'am' | 'om' | 'ti' | 'en'): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');
    user.language = language;
    this.save(this.state);
    return user;
  }

  public getProducts(filters?: {
    category?: string;
    region?: string;
    woreda?: string;
    search?: string;
    maxDistanceKm?: number;
    userLat?: number;
    userLng?: number;
  }): (Product & { distanceKm?: number })[] {
    let list = [...this.state.products];

    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter((p) => p.category === filters.category);
    }
    if (filters?.region && filters.region !== 'ALL') {
      list = list.filter((p) => p.region.toLowerCase() === filters.region?.toLowerCase());
    }
    if (filters?.woreda && filters.woreda !== 'ALL') {
      list = list.filter((p) => p.woreda.toLowerCase().includes(filters.woreda!.toLowerCase()));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brandOrVariety.toLowerCase().includes(q) ||
          (p.titleAm && p.titleAm.includes(q)) ||
          (p.titleOm && p.titleOm.toLowerCase().includes(q))
      );
    }

    const userLat = filters?.userLat ?? this.getCurrentUser().lat;
    const userLng = filters?.userLng ?? this.getCurrentUser().lng;

    const mapped = list.map((item) => {
      const dist = calculateDistanceKm(userLat, userLng, item.lat, item.lng);
      return { ...item, distanceKm: dist };
    });

    if (filters?.maxDistanceKm && filters.maxDistanceKm > 0) {
      return mapped.filter((item) => item.distanceKm <= filters.maxDistanceKm!);
    }

    // Sort by proximity
    return mapped.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.products.unshift(newProduct);
    this.save(this.state);
    return newProduct;
  }

  public getProduceListings(filters?: {
    crop?: string;
    grade?: string;
    region?: string;
    search?: string;
    userLat?: number;
    userLng?: number;
  }): (ProduceListing & { distanceKm?: number; farmerName: string; farmerPhone: string })[] {
    let list = [...this.state.produceListings];

    if (filters?.crop && filters.crop !== 'ALL') {
      list = list.filter((l) => l.cropOrLivestock.toLowerCase() === filters.crop?.toLowerCase());
    }
    if (filters?.grade && filters.grade !== 'ALL') {
      list = list.filter((l) => l.grade === filters.grade);
    }
    if (filters?.region && filters.region !== 'ALL') {
      list = list.filter((l) => l.region.toLowerCase() === filters.region?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.cropOrLivestock.toLowerCase().includes(q) ||
          l.variety.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.woreda.toLowerCase().includes(q)
      );
    }

    const userLat = filters?.userLat ?? this.getCurrentUser().lat;
    const userLng = filters?.userLng ?? this.getCurrentUser().lng;

    return list.map((item) => {
      const farmer = this.getUserById(item.farmerId);
      const dist = calculateDistanceKm(userLat, userLng, item.lat, item.lng);
      return {
        ...item,
        distanceKm: dist,
        farmerName: farmer?.fullName ?? 'Ethiopian Farmer',
        farmerPhone: farmer?.phone ?? '+251911000000',
      };
    });
  }

  public addProduceListing(listing: Omit<ProduceListing, 'id' | 'createdAt'>): ProduceListing {
    const newListing: ProduceListing = {
      ...listing,
      id: `listing-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.produceListings.unshift(newListing);
    this.save(this.state);
    return newListing;
  }

  public getPriceReports(region?: string, commodity?: string): PriceReport[] {
    let list = [...this.state.priceReports];
    if (region && region !== 'ALL') {
      list = list.filter((p) => p.region.toLowerCase() === region.toLowerCase());
    }
    if (commodity && commodity !== 'ALL') {
      list = list.filter((p) => p.commodity.toLowerCase().includes(commodity.toLowerCase()));
    }
    return list;
  }

  public getOrders(userId?: string): Order[] {
    const uid = userId || this.state.currentUserId;
    return this.state.orders.filter((o) => o.buyerId === uid || o.sellerId === uid);
  }

  public getOrderById(id: string): Order | undefined {
    return this.state.orders.find((o) => o.id === id);
  }

  public createOrder(data: {
    orderType: 'INPUT_PURCHASE' | 'PRODUCE_PURCHASE';
    buyerId: string;
    sellerId: string;
    productId?: string;
    produceListingId?: string;
    quantity: number;
    unitPriceEtb: number;
    deliveryMethod: 'PICKUP' | 'SUPPLIER_DELIVERY' | 'COOP_POINT';
    deliveryAddress: string;
    paymentMethod: 'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'CASH_ON_DELIVERY';
  }): Order {
    const buyer = this.getUserById(data.buyerId);
    const seller = this.getUserById(data.sellerId);
    if (!buyer || !seller) throw new Error('Invalid buyer or seller');

    const totalAmountEtb = data.quantity * data.unitPriceEtb;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderNum = `ETH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let prodTitle = '';
    let produceTitle = '';
    let unit = 'Unit';

    if (data.productId) {
      const p = this.state.products.find((i) => i.id === data.productId);
      if (p) {
        prodTitle = p.title;
        unit = p.unit;
      }
    } else if (data.produceListingId) {
      const l = this.state.produceListings.find((i) => i.id === data.produceListingId);
      if (l) {
        produceTitle = `${l.cropOrLivestock} (${l.variety}) ${l.grade}`;
        unit = l.unit;
      }
    }

    // When paid via digital money (Telebirr/CBE/Chapa), escrow is immediately held
    const isDigital = data.paymentMethod !== 'CASH_ON_DELIVERY';
    const status: Order['status'] = isDigital ? 'ESCROW_HELD' : 'CONFIRMED';
    const paymentStatus: Order['paymentStatus'] = isDigital ? 'ESCROW_HELD' : 'PENDING';

    const order: Order = {
      id: `order-${Date.now()}`,
      orderNumber: orderNum,
      orderType: data.orderType,
      buyerId: buyer.id,
      buyerName: buyer.fullName,
      buyerPhone: buyer.phone,
      sellerId: seller.id,
      sellerName: seller.businessName || seller.fullName,
      sellerPhone: seller.phone,
      productId: data.productId,
      productTitle: prodTitle,
      produceListingId: data.produceListingId,
      produceTitle: produceTitle,
      quantity: data.quantity,
      unit,
      unitPriceEtb: data.unitPriceEtb,
      totalAmountEtb,
      status,
      deliveryMethod: data.deliveryMethod,
      deliveryAddress: data.deliveryAddress,
      confirmationOtp: otp,
      paymentMethod: data.paymentMethod,
      paymentStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.orders.unshift(order);
    this.save(this.state);
    return order;
  }

  public updateOrderStatus(orderId: string, status: Order['status']): Order {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.save(this.state);
    return order;
  }

  public releaseEscrow(orderId: string, enteredOtp: string): { success: boolean; message: string; order: Order } {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    if (order.confirmationOtp !== enteredOtp.trim()) {
      return {
        success: false,
        message: 'Invalid OTP verification code. Please request the 4-digit code from the buyer upon physical handover.',
        order,
      };
    }

    order.status = 'COMPLETED';
    order.paymentStatus = 'RELEASED';
    order.updatedAt = new Date().toISOString();
    this.save(this.state);

    return {
      success: true,
      message: `Escrow payment of ${order.totalAmountEtb.toLocaleString()} ETB successfully transferred to seller's ${order.paymentMethod} account.`,
      order,
    };
  }
}

export const db = new Database();
