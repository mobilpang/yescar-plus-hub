export type FinanceType = "lease" | "rent";

export interface Listing {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  color: string;
  financeType: FinanceType;
  monthlyPayment: number; // 만원
  remainingMonths: number;
  takeoverFee: number; // 만원
  deposit: number; // 만원, 0 = 무보증금
  residualValue: number;
  imageUrl: string;
  status: "active" | "paused" | "sold";
}

const placeholder = (seed: string) =>
  `https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=70&auto=format&fit=crop&sig=${seed}`;

export const listings: Listing[] = [
  {
    id: "bmw-520i-2023",
    brand: "BMW",
    model: "5시리즈 520i",
    year: 2023,
    mileage: 15000,
    fuelType: "가솔린",
    color: "알파인 화이트",
    financeType: "lease",
    monthlyPayment: 89,
    remainingMonths: 18,
    takeoverFee: 350,
    deposit: 0,
    residualValue: 3200,
    imageUrl: placeholder("1"),
    status: "active",
  },
  {
    id: "benz-e300-2022",
    brand: "벤츠",
    model: "E300 4MATIC",
    year: 2022,
    mileage: 22000,
    fuelType: "가솔린",
    color: "옵시디언 블랙",
    financeType: "lease",
    monthlyPayment: 110,
    remainingMonths: 12,
    takeoverFee: 480,
    deposit: 500,
    residualValue: 3800,
    imageUrl: placeholder("2"),
    status: "active",
  },
  {
    id: "audi-a6-2023",
    brand: "아우디",
    model: "A6 45 TFSI",
    year: 2023,
    mileage: 9800,
    fuelType: "가솔린",
    color: "글레이셔 화이트",
    financeType: "rent",
    monthlyPayment: 95,
    remainingMonths: 24,
    takeoverFee: 280,
    deposit: 0,
    residualValue: 3500,
    imageUrl: placeholder("3"),
    status: "active",
  },
  {
    id: "genesis-g80-2024",
    brand: "제네시스",
    model: "G80 2.5T",
    year: 2024,
    mileage: 5400,
    fuelType: "가솔린",
    color: "마칼루 그레이",
    financeType: "lease",
    monthlyPayment: 78,
    remainingMonths: 30,
    takeoverFee: 220,
    deposit: 0,
    residualValue: 3000,
    imageUrl: placeholder("4"),
    status: "active",
  },
  {
    id: "volvo-xc60-2023",
    brand: "볼보",
    model: "XC60 B5",
    year: 2023,
    mileage: 18700,
    fuelType: "마일드 하이브리드",
    color: "크리스탈 화이트",
    financeType: "rent",
    monthlyPayment: 84,
    remainingMonths: 15,
    takeoverFee: 310,
    deposit: 300,
    residualValue: 2900,
    imageUrl: placeholder("5"),
    status: "active",
  },
  {
    id: "porsche-macan-2022",
    brand: "포르쉐",
    model: "마칸 2.0",
    year: 2022,
    mileage: 26500,
    fuelType: "가솔린",
    color: "젯 블랙 메탈릭",
    financeType: "lease",
    monthlyPayment: 145,
    remainingMonths: 9,
    takeoverFee: 690,
    deposit: 0,
    residualValue: 5400,
    imageUrl: placeholder("6"),
    status: "active",
  },
];

export const featuredListings = listings;
