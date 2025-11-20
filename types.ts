export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  role: UserRole;
  isBlocked: boolean;
  joinedAt: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  amount: number;
  trxId: string;
  status: PaymentStatus;
  timestamp: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
  type: 'generated' | 'edited';
}

export interface PaymentSettings {
  methodName: string;
  accountNumber: string;
  qrCodeUrl: string;
}

export interface GlobalSettings {
  paymentDetails: PaymentSettings;
  creditPackages: CreditPackage[];
}