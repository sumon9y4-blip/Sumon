import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PaymentRequest, GlobalSettings, CreditPackage, GeneratedImage } from '../types';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config';
import toast from 'react-hot-toast';

interface GlobalState {
  currentUser: User | null;
  users: User[];
  payments: PaymentRequest[];
  settings: GlobalSettings;
  userImages: GeneratedImage[]; // Images generated in this session
  
  // Auth
  login: (email: string, pass: string) => boolean;
  signup: (name: string, email: string, pass: string) => void;
  logout: () => void;

  // Actions
  deductCredit: () => boolean;
  requestPayment: (packageId: string, trxId: string) => void;
  addImageToGallery: (url: string, prompt: string, type: 'generated' | 'edited') => void;
  
  // Admin Actions
  updateSettings: (newSettings: GlobalSettings) => void;
  approvePayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  addCreditsToUser: (userId: string, amount: number) => void;
}

const defaultSettings: GlobalSettings = {
  paymentDetails: {
    methodName: 'Bkash/Nagad',
    accountNumber: '01700000000',
    qrCodeUrl: 'https://picsum.photos/200/200', // Placeholder
  },
  creditPackages: [
    { id: 'pkg1', name: 'Starter Pack', credits: 100, price: 50 },
    { id: 'pkg2', name: 'Pro Pack', credits: 500, price: 200 },
    { id: 'pkg3', name: 'Enterprise', credits: 1500, price: 500 },
  ]
};

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [userImages, setUserImages] = useState<GeneratedImage[]>([]);

  // Initialize Admin User if not present
  useEffect(() => {
    // We don't actually store the admin in the users array to keep logic clean,
    // or we could. For now, Admin is a special login case.
  }, []);

  const login = (email: string, pass: string): boolean => {
    // Admin Check
    if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
      setCurrentUser({
        id: 'admin-001',
        name: 'System Administrator',
        email: ADMIN_EMAIL,
        credits: 999999,
        role: 'admin',
        isBlocked: false,
        joinedAt: new Date().toISOString()
      });
      toast.success("Welcome back, Administrator.");
      return true;
    }

    // User Check
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.isBlocked) {
        toast.error("Account is blocked. Contact support.");
        return false;
      }
      // In a real app, check password hash. Here we assume generic success for mock users
      // For simplicity in this mock, we just check if user exists. 
      // Adding a dummy password check:
      if (pass.length < 4) {
        toast.error("Invalid credentials");
        return false;
      }
      
      setCurrentUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    }

    toast.error("User not found.");
    return false;
  };

  const signup = (name: string, email: string, pass: string) => {
    if (users.find(u => u.email === email) || email === ADMIN_EMAIL) {
      toast.error("Email already registered.");
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      credits: 10, // 10 Free Starter Credits
      role: 'user',
      isBlocked: false,
      joinedAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    toast.success("Account created! You got 10 free credits.");
  };

  const logout = () => {
    setCurrentUser(null);
    setUserImages([]); // Clear session gallery
    toast.success("Logged out successfully.");
  };

  const deductCredit = (): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Admin has infinite

    if (currentUser.credits < 1) {
      toast.error("Insufficient credits. Please purchase more.");
      return false;
    }

    const updatedUser = { ...currentUser, credits: currentUser.credits - 1 };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    return true;
  };

  const requestPayment = (packageId: string, trxId: string) => {
    if (!currentUser) return;
    const pkg = settings.creditPackages.find(p => p.id === packageId);
    if (!pkg) return;

    const newPayment: PaymentRequest = {
      id: `pay-${Date.now()}`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      packageId: pkg.id,
      packageName: pkg.name,
      amount: pkg.price,
      trxId,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    setPayments([...payments, newPayment]);
    toast.success("Payment submitted for verification.");
  };

  const addImageToGallery = (url: string, prompt: string, type: 'generated' | 'edited') => {
    const newImg: GeneratedImage = {
      id: `img-${Date.now()}`,
      url,
      prompt,
      createdAt: new Date().toISOString(),
      type
    };
    setUserImages(prev => [newImg, ...prev]);
  };

  // Admin Functions
  const updateSettings = (newSettings: GlobalSettings) => {
    setSettings(newSettings);
    toast.success("System settings updated.");
  };

  const approvePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment || payment.status !== 'pending') return;

    // Find associated package to know how many credits to add
    const pkg = settings.creditPackages.find(p => p.id === payment.packageId);
    if (!pkg) {
      toast.error("Package not found associated with this payment.");
      return;
    }

    // Update payment status
    setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'approved' } : p));

    // Add credits to user
    const userIndex = users.findIndex(u => u.id === payment.userId);
    if (userIndex > -1) {
      const updatedUsers = [...users];
      updatedUsers[userIndex].credits += pkg.credits;
      setUsers(updatedUsers);
      
      // If the approved user is currently logged in (unlikely for admin view, but logic holds)
      if (currentUser?.id === payment.userId) {
        setCurrentUser({ ...currentUser, credits: currentUser.credits + pkg.credits });
      }
    }
    toast.success("Payment approved. Credits added.");
  };

  const rejectPayment = (paymentId: string) => {
    setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'rejected' } : p));
    toast.success("Payment rejected.");
  };

  const blockUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: true } : u));
    toast.success("User blocked.");
  };

  const unblockUser = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: false } : u));
    toast.success("User unblocked.");
  };

  const addCreditsToUser = (userId: string, amount: number) => {
    setUsers(users.map(u => u.id === userId ? { ...u, credits: u.credits + amount } : u));
    toast.success(`Added ${amount} credits to user.`);
  };

  return (
    <GlobalStateContext.Provider value={{
      currentUser,
      users,
      payments,
      settings,
      userImages,
      login,
      signup,
      logout,
      deductCredit,
      requestPayment,
      addImageToGallery,
      updateSettings,
      approvePayment,
      rejectPayment,
      blockUser,
      unblockUser,
      addCreditsToUser
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) throw new Error("useGlobalState must be used within a GlobalProvider");
  return context;
};