import React, { useState, useRef } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { CURRENCY_SYMBOL } from '../config';
import { 
  Users, 
  CreditCard, 
  Settings, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash,
  Upload,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { 
    users, 
    payments, 
    settings, 
    approvePayment, 
    rejectPayment, 
    blockUser, 
    unblockUser, 
    addCreditsToUser,
    updateSettings
  } = useGlobalState();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'settings'>('overview');
  
  // Settings State
  const [localSettings, setLocalSettings] = useState(settings);
  const qrInputRef = useRef<HTMLInputElement>(null);

  // Derived Stats
  const totalRevenue = payments.filter(p => p.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const totalUsers = users.length;

  const handleSaveSettings = () => {
    updateSettings(localSettings);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({
          ...localSettings,
          paymentDetails: {
            ...localSettings.paymentDetails,
            qrCodeUrl: reader.result as string
          }
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- SUB-COMPONENTS ---

  const OverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-dark-card border border-dark-border p-6 rounded-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Users</p>
            <h3 className="text-2xl font-bold text-white">{totalUsers}</h3>
          </div>
        </div>
      </div>
      <div className="bg-dark-card border border-dark-border p-6 rounded-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Pending Payments</p>
            <h3 className="text-2xl font-bold text-white">{pendingPayments}</h3>
          </div>
        </div>
      </div>
      <div className="bg-dark-card border border-dark-border p-6 rounded-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <span className="text-2xl font-bold">{CURRENCY_SYMBOL}</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Total Revenue</p>
            <h3 className="text-2xl font-bold text-white">{CURRENCY_SYMBOL}{totalRevenue}</h3>
          </div>
        </div>
      </div>
    </div>
  );

  const UsersTab = () => (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400 font-medium border-b border-dark-border">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Credits</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border text-slate-300">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.credits}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => {
                        const amount = parseInt(prompt("Enter credits to add:", "10") || "0");
                        if(amount > 0) addCreditsToUser(user.id, amount);
                    }}
                    className="px-3 py-1 bg-brand-600/20 text-brand-400 hover:bg-brand-600 hover:text-white rounded transition-colors"
                  >
                    + Credits
                  </button>
                  {user.isBlocked ? (
                    <button 
                      onClick={() => unblockUser(user.id)}
                      className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded transition-colors"
                    >
                      Unblock
                    </button>
                  ) : (
                    <button 
                      onClick={() => blockUser(user.id)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors"
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const PaymentsTab = () => (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
       <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400 font-medium border-b border-dark-border">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Package</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">TrxID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border text-slate-300">
            {payments.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(pay => (
              <tr key={pay.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4">
                    <div className="font-medium text-white">{pay.userEmail}</div>
                    <div className="text-xs text-slate-500">{new Date(pay.timestamp).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">{pay.packageName}</td>
                <td className="px-6 py-4 font-mono">{CURRENCY_SYMBOL}{pay.amount}</td>
                <td className="px-6 py-4 font-mono text-xs bg-slate-900 rounded p-1">{pay.trxId}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold 
                    ${pay.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                      pay.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                      'bg-yellow-500/20 text-yellow-400'}`}>
                    {pay.status.charAt(0).toUpperCase() + pay.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {pay.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => approvePayment(pay.id)}
                        className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                         onClick={() => rejectPayment(pay.id)}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
             {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No payment requests yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-8">
      {/* Payment Settings */}
      <section className="bg-dark-card border border-dark-border p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-4 border-b border-dark-border pb-2">Payment Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-1">Payment Method Name</label>
             <input 
               type="text"
               value={localSettings.paymentDetails.methodName}
               onChange={(e) => setLocalSettings({...localSettings, paymentDetails: {...localSettings.paymentDetails, methodName: e.target.value}})}
               className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2 text-white"
             />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-1">Account Number</label>
             <input 
               type="text"
               value={localSettings.paymentDetails.accountNumber}
               onChange={(e) => setLocalSettings({...localSettings, paymentDetails: {...localSettings.paymentDetails, accountNumber: e.target.value}})}
               className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-2 text-white"
             />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-slate-400 mb-1">QR Code</label>
             <div className="flex items-center gap-4">
               {localSettings.paymentDetails.qrCodeUrl && (
                   <img src={localSettings.paymentDetails.qrCodeUrl} alt="QR" className="w-16 h-16 object-contain bg-white rounded" />
               )}
               <input 
                 type="file" 
                 ref={qrInputRef}
                 className="hidden"
                 onChange={handleQrUpload}
                 accept="image/*"
               />
               <button 
                 onClick={() => qrInputRef.current?.click()}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
               >
                 <Upload size={16} /> Upload New QR
               </button>
             </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-dark-card border border-dark-border p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-dark-border pb-2">
           <h3 className="text-lg font-bold text-white">Credit Packages</h3>
           <button 
            onClick={() => {
                const newPkg = { id: `pkg-${Date.now()}`, name: 'New Package', credits: 100, price: 50 };
                setLocalSettings({...localSettings, creditPackages: [...localSettings.creditPackages, newPkg]});
            }}
            className="text-xs flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg transition-colors"
           >
               <Plus size={14} /> Add Package
           </button>
        </div>
        
        <div className="space-y-4">
           {localSettings.creditPackages.map((pkg, idx) => (
               <div key={pkg.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-900/50 p-4 rounded-xl border border-dark-border">
                   <div>
                       <label className="text-xs text-slate-500">Name</label>
                       <input 
                        type="text" 
                        value={pkg.name}
                        onChange={(e) => {
                            const newPkgs = [...localSettings.creditPackages];
                            newPkgs[idx].name = e.target.value;
                            setLocalSettings({...localSettings, creditPackages: newPkgs});
                        }}
                        className="w-full bg-transparent border-b border-slate-700 focus:border-brand-500 text-white text-sm py-1 outline-none"
                       />
                   </div>
                   <div>
                       <label className="text-xs text-slate-500">Credits</label>
                       <input 
                        type="number" 
                        value={pkg.credits}
                         onChange={(e) => {
                            const newPkgs = [...localSettings.creditPackages];
                            newPkgs[idx].credits = parseInt(e.target.value);
                            setLocalSettings({...localSettings, creditPackages: newPkgs});
                        }}
                        className="w-full bg-transparent border-b border-slate-700 focus:border-brand-500 text-white text-sm py-1 outline-none"
                       />
                   </div>
                   <div>
                       <label className="text-xs text-slate-500">Price ({CURRENCY_SYMBOL})</label>
                       <input 
                        type="number" 
                        value={pkg.price}
                         onChange={(e) => {
                            const newPkgs = [...localSettings.creditPackages];
                            newPkgs[idx].price = parseInt(e.target.value);
                            setLocalSettings({...localSettings, creditPackages: newPkgs});
                        }}
                        className="w-full bg-transparent border-b border-slate-700 focus:border-brand-500 text-white text-sm py-1 outline-none"
                       />
                   </div>
                   <div className="flex justify-end">
                       <button 
                        onClick={() => {
                            const newPkgs = localSettings.creditPackages.filter(p => p.id !== pkg.id);
                            setLocalSettings({...localSettings, creditPackages: newPkgs});
                        }}
                        className="text-red-400 hover:text-red-300 p-2"
                       >
                           <Trash size={18} />
                       </button>
                   </div>
               </div>
           ))}
        </div>
      </section>

      <div className="flex justify-end">
          <button 
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-900/20 transition-all"
          >
              <Save size={20} /> Save All Changes
          </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-white tracking-tight mb-6">Command Center</h2>
      
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-dark-border pb-1 mb-6">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${activeTab === 'overview' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${activeTab === 'users' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${activeTab === 'payments' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Payment Requests
          {pendingPayments > 0 && <span className="ml-2 bg-yellow-500 text-black text-[10px] px-1.5 py-0.5 rounded-full">{pendingPayments}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${activeTab === 'settings' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          System Settings
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;