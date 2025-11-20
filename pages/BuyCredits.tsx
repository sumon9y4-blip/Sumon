import React, { useState } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { CURRENCY_SYMBOL } from '../config';
import { Check, X, CreditCard, QrCode } from 'lucide-react';

const BuyCredits: React.FC = () => {
  const { settings, requestPayment } = useGlobalState();
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [trxId, setTrxId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBuyClick = (pkgId: string) => {
    setSelectedPkg(pkgId);
    setIsModalOpen(true);
    setTrxId('');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPkg && trxId) {
      requestPayment(selectedPkg, trxId);
      setIsModalOpen(false);
    }
  };

  const activePkg = settings.creditPackages.find(p => p.id === selectedPkg);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-3">Upgrade Your Creativity</h2>
        <p className="text-slate-400">Choose a credit package that suits your needs. Instant delivery upon verification.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {settings.creditPackages.map((pkg, idx) => (
          <div 
            key={pkg.id} 
            className={`relative bg-dark-card border rounded-2xl p-8 flex flex-col
              ${idx === 1 
                ? 'border-brand-500 shadow-2xl shadow-brand-900/20 scale-105 z-10' 
                : 'border-dark-border hover:border-brand-500/30 transition-colors'
              }`}
          >
            {idx === 1 && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-brand-400 text-white text-xs font-bold uppercase px-4 py-1 rounded-full shadow-lg">
                Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-4xl font-bold tracking-tight">{CURRENCY_SYMBOL}{pkg.price}</span>
              </div>
              <p className="mt-2 text-slate-400 text-sm">One-time payment</p>
            </div>

            <div className="flex-1">
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <Check size={14} />
                  </div>
                  <span className="text-white font-bold">{pkg.credits} Image Generations</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <Check size={14} />
                  </div>
                  <span>Access to Image Editing</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <Check size={14} />
                  </div>
                  <span>High Priority Processing</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleBuyClick(pkg.id)}
              className={`w-full py-3 rounded-xl font-bold transition-all
                ${idx === 1 
                  ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/25' 
                  : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {isModalOpen && activePkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="text-brand-400" /> Payment Details
            </h3>

            <div className="bg-slate-900/50 p-4 rounded-xl mb-6 border border-dark-border">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-sm">Package</span>
                <span className="text-white font-medium">{activePkg.name}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-slate-400 text-sm">Amount</span>
                <span className="text-brand-400 font-bold">{CURRENCY_SYMBOL}{activePkg.price}</span>
              </div>
              <div className="border-t border-dark-border pt-4">
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Send Payment To:</p>
                <p className="text-white text-sm mb-1"><span className="text-slate-400">Method:</span> {settings.paymentDetails.methodName}</p>
                <p className="text-white text-lg font-mono bg-black/30 p-2 rounded text-center border border-brand-500/30 text-brand-300">
                    {settings.paymentDetails.accountNumber}
                </p>
              </div>
              {settings.paymentDetails.qrCodeUrl && (
                  <div className="mt-4 flex justify-center">
                      <img src={settings.paymentDetails.qrCodeUrl} alt="QR Code" className="w-32 h-32 object-contain bg-white rounded-lg p-2" />
                  </div>
              )}
            </div>

            <form onSubmit={handleSubmitPayment}>
              <label className="block text-sm font-medium text-slate-300 mb-2">Transaction ID (TrxID)</label>
              <input 
                type="text" 
                required
                placeholder="e.g. 8X92M..."
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full bg-slate-900 border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 mb-6"
              />
              <button 
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyCredits;