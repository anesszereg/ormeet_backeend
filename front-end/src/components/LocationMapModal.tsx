import { useTranslation } from 'react-i18next';

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: string;
  address: string;
}

const LocationMapModal = ({ isOpen, onClose, venue, address }: LocationMapModalProps) => {
  const { t } = useTranslation('attendee');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[660px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#EEEEEE]">
          <h2 className="text-lg font-bold text-black mb-2">{t('locationMapModal.title')}</h2>
          <p className="text-sm text-black mb-1">
            {venue} <span className="text-[#757575] mx-2">|</span> {address}
          </p>
          <button onClick={onClose} className="text-sm font-medium text-[#FF4000] hover:underline">
            {t('locationMapModal.closeMap')}
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-[500px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.2!2d-122.3!3d37.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f9e6e0e0e0e0e%3A0x0!2sSunset%20Grove%20Park!5e0!3m2!1sen!2sus!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={t('locationMapModal.mapTitle')}
            className="absolute inset-0"
          />

          {/* Map Controls */}
          <div className="absolute top-4 end-4 flex flex-col gap-2">
            {/* Fullscreen button */}
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F8F8F8] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 7.5V2.5H7.5M12.5 2.5H17.5V7.5M17.5 12.5V17.5H12.5M7.5 17.5H2.5V12.5" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Zoom in */}
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F8F8F8] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 5V15M5 10H15" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Zoom out */}
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F8F8F8] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10H15" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* My location */}
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-[#F8F8F8] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="3" fill="#4F4F4F"/>
                <path d="M10 2V5M10 15V18M18 10H15M5 10H2" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMapModal;
