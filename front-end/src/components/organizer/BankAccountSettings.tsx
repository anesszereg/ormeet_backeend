import { useState } from 'react';
import EditIcon from '../../assets/Svgs/edit.svg';
import SuccessIcon from '../../assets/Svgs/success.svg';
import ErrorIcon from '../../assets/Svgs/error.svg';

interface BankAccount {
  accountHolderName: string;
  bankName: string;
  country: string;
  iban: string;
  swiftBic: string;
  status: 'verified' | 'pending';
}

const BankAccountSettings = () => {
  // Bank account state
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  
  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  // Success/Error states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    country: '',
    iban: '',
    swiftBic: ''
  });
  
  // Form validation error
  const [formError, setFormError] = useState('');
  const [ibanError, setIbanError] = useState('');
  const [swiftError, setSwiftError] = useState('');
  
  // Delete confirmation states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  
  // Mock current user role (in real app, this would come from auth context)
  const userRole = 'admin'; // or 'member'
  const isAdmin = userRole === 'admin';

  // Validate IBAN - basic international format
  const validateIban = (value: string): string => {
    if (!value) return '';
    // Remove spaces for validation
    const cleanValue = value.replace(/\s/g, '');
    // IBAN: 2 letters (country code) + 2 digits (check digits) + up to 30 alphanumeric characters
    // Length: 15-34 characters
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
    if (!ibanRegex.test(cleanValue.toUpperCase())) {
      return 'Invalid IBAN format';
    }
    return '';
  };

  // Validate SWIFT/BIC - international format
  const validateSwift = (value: string): string => {
    if (!value) return '';
    // SWIFT/BIC: 8 or 11 characters (letters and digits)
    // Format: 4 letters (bank code) + 2 letters (country code) + 2 alphanumeric (location) + optional 3 alphanumeric (branch)
    const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    if (!swiftRegex.test(value.toUpperCase())) {
      return 'Invalid SWIFT/BIC code';
    }
    return '';
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.accountHolderName.trim() !== '' &&
      formData.bankName.trim() !== '' &&
      formData.country.trim() !== '' &&
      formData.iban.trim() !== '' &&
      formData.swiftBic.trim() !== '' &&
      ibanError === '' &&
      swiftError === ''
    );
  };

  // Mask IBAN to show only last 4 digits
  const maskIban = (iban: string) => {
    if (!iban) return '';
    const last4 = iban.slice(-4);
    return `****${last4}`;
  };

  // Handle opening modal
  const handleOpenModal = (mode: 'add' | 'edit') => {
    setModalMode(mode);
    setFormError('');
    setIbanError('');
    setSwiftError('');
    
    if (mode === 'edit' && bankAccount) {
      setFormData({
        accountHolderName: bankAccount.accountHolderName,
        bankName: bankAccount.bankName,
        country: bankAccount.country,
        iban: bankAccount.iban,
        swiftBic: bankAccount.swiftBic
      });
    } else {
      setFormData({
        accountHolderName: '',
        bankName: '',
        country: '',
        iban: '',
        swiftBic: ''
      });
    }
    
    setIsAddEditModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validation
    if (!formData.accountHolderName.trim()) {
      setFormError('Account holder name is required');
      return;
    }
    if (!formData.bankName.trim()) {
      setFormError('Bank name is required');
      return;
    }
    if (!formData.country.trim()) {
      setFormError('Country is required');
      return;
    }
    if (!formData.iban.trim()) {
      setFormError('IBAN is required');
      return;
    }
    if (!formData.swiftBic.trim()) {
      setFormError('SWIFT/BIC is required');
      return;
    }

    // Simulate API call
    try {
      // In real app, make API call here
      const newBankAccount: BankAccount = {
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        country: formData.country,
        iban: formData.iban,
        swiftBic: formData.swiftBic,
        status: 'pending'
      };
      
      setBankAccount(newBankAccount);
      
      // Show success popup
      setSuccessMessage('Bank account saved successfully');
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setIsAddEditModalOpen(false);
      }, 3000);
      
    } catch (error) {
      // Show error popup
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsAddEditModalOpen(false);
    setFormError('');
    setIbanError('');
    setSwiftError('');
    setFormData({
      accountHolderName: '',
      bankName: '',
      country: '',
      iban: '',
      swiftBic: ''
    });
  };

  // Handle delete bank account
  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setBankAccount(null);
    setShowDeleteSuccess(true);
    setTimeout(() => {
      setShowDeleteSuccess(false);
      setIsDeleteConfirmOpen(false);
    }, 3000);
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setShowDeleteSuccess(false);
  };

  return (
    <div className="w-full">
      {/* Bank Account Section */}
      <div className="bg-white rounded-xl border border-light-gray p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-black">Bank Account</h2>
            <p className="text-sm text-gray mt-1">
              Manage the bank account that will receive event payouts
            </p>
          </div>
        </div>

        {!bankAccount ? (
          // Empty State
          <div className="py-12 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-light-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-black mb-2">No bank account added</h3>
            <p className="text-sm text-gray mb-6">
              You must add a bank account to receive payouts from your events.
            </p>
            {isAdmin ? (
              <button
                onClick={() => handleOpenModal('add')}
                className="px-6 py-2.5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer"
                style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
              >
                Add bank account
              </button>
            ) : (
              <p className="text-sm text-[#9CA3AF] italic">Only admin can add bank account</p>
            )}
          </div>
        ) : (
          // Bank Account Card
          <div className="border border-light-gray rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1">Account Holder Name</p>
                      <p className="text-sm font-medium text-black">{bankAccount.accountHolderName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1">Bank Name</p>
                      <p className="text-sm font-medium text-black">{bankAccount.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1">Country</p>
                      <p className="text-sm font-medium text-black">{bankAccount.country}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1">IBAN</p>
                      <p className="text-sm font-medium text-black">{maskIban(bankAccount.iban)}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {bankAccount.status === 'verified' ? (
                    <div className="flex items-center gap-1 px-3 py-1 bg-[#E8F5E9] rounded-full">
                      <svg className="w-3 h-3 text-[#2E7D32]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-[#2E7D32]">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1 bg-[#FFF4E6] rounded-full">
                      <svg className="w-3 h-3 text-[#F57C00]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-[#F57C00]">Pending verification</span>
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-between pt-3 border-t border-light-gray">
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#FF4000] hover:bg-[#FFF4F3] rounded-lg transition-all cursor-pointer group"
                    title="Delete bank account"
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="group-hover:underline">Delete</span>
                  </button>
                  <button
                    onClick={() => handleOpenModal('edit')}
                    className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light rounded-lg transition-all cursor-pointer hover:shadow-sm"
                  >
                    Edit bank account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Bank Account Modal */}
      {isAddEditModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
          onClick={() => !showSuccess && handleCancel()}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 overflow-y-auto flex-1">
              {!showSuccess && !showError ? (
                <>
                  <h2 className="text-xl font-bold text-black mb-4">
                    {modalMode === 'add' ? 'Add Bank Account' : 'Edit Bank Account'}
                  </h2>

                  <div className="space-y-4">
                    {/* Account Holder Name */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Account Holder Name <span className="text-[#FF3425]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.accountHolderName}
                        onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                        placeholder="Enter account holder name"
                      />
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Bank Name <span className="text-[#FF3425]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                        placeholder="Enter bank name"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Country <span className="text-[#FF3425]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-2.5 border border-[#E0E0E0] rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                        placeholder="Enter country"
                      />
                    </div>

                    {/* IBAN */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        IBAN <span className="text-[#FF3425]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.iban}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          setFormData({ ...formData, iban: value });
                          setIbanError(validateIban(value));
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 transition-all ${
                          ibanError ? 'border-[#FF3425] focus:border-[#FF3425] focus:ring-[#FF3425]/10' : 'border-[#E0E0E0] focus:border-[#FF4000] focus:ring-[#FF4000]/10'
                        }`}
                        placeholder="Enter IBAN (e.g., GB29NWBK60161331926819)"
                      />
                      {ibanError && (
                        <p className="text-xs text-[#FF3425] mt-1">{ibanError}</p>
                      )}
                    </div>

                    {/* SWIFT/BIC */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        SWIFT / BIC <span className="text-[#FF3425]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.swiftBic}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          setFormData({ ...formData, swiftBic: value });
                          setSwiftError(validateSwift(value));
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 transition-all ${
                          swiftError ? 'border-[#FF3425] focus:border-[#FF3425] focus:ring-[#FF3425]/10' : 'border-[#E0E0E0] focus:border-[#FF4000] focus:ring-[#FF4000]/10'
                        }`}
                        placeholder="Enter SWIFT/BIC code (e.g., NWBKGB2L)"
                      />
                      {swiftError && (
                        <p className="text-xs text-[#FF3425] mt-1">{swiftError}</p>
                      )}
                    </div>

                    {/* Error Message */}
                    {formError && (
                      <div className="text-sm text-[#FF3425] bg-primary-light px-3 py-2 rounded-lg">
                        {formError}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      onClick={handleCancel}
                      className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!isFormValid()}
                      className={`px-5 py-2 font-medium text-sm rounded-full transition-all whitespace-nowrap ${
                        isFormValid()
                          ? 'bg-[#FF4000] hover:bg-[#E63900] text-white cursor-pointer'
                          : 'bg-[#E0E0E0] text-[#9CA3AF] cursor-not-allowed'
                      }`}
                      style={isFormValid() ? { boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' } : {}}
                    >
                      Save changes
                    </button>
                  </div>
                </>
              ) : showSuccess ? (
                // Success Popup
                <div className="flex flex-col items-center justify-center py-8">
                  <img 
                    src={SuccessIcon} 
                    alt="Success" 
                    className="w-16 h-16 mb-4" 
                    style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} 
                  />
                  <p className="text-lg font-semibold text-black">
                    {successMessage}
                  </p>
                </div>
              ) : (
                // Error Popup
                <div className="flex flex-col items-center justify-center py-8">
                  <img 
                    src={ErrorIcon} 
                    alt="Error" 
                    className="w-16 h-16 mb-4"
                  />
                  <p className="text-lg font-semibold text-black">Action failed. Please try again</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
          onClick={() => !showDeleteSuccess && handleCancelDelete()}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {!showDeleteSuccess ? (
                <>
                  <h2 className="text-xl font-bold text-black mb-4">Confirm deletion</h2>
                  <p className="text-sm text-gray mb-6">
                    Are you sure you want to delete this bank account?
                  </p>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={handleCancelDelete}
                      className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                      style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                    >
                      Confirm
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <img 
                    src={SuccessIcon} 
                    alt="Success" 
                    className="w-16 h-16 mb-4" 
                    style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} 
                  />
                  <p className="text-lg font-semibold text-black">
                    Bank account deleted successfully
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountSettings;
