import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import organizerService from '../../services/organizerService';

interface Event {
  id: string;
  name: string;
}

interface ScanResult {
  type: 'success' | 'error';
  message: string;
  attendeeName?: string;
  ticketType?: string;
}

interface QRCheckInScannerProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  onCheckedIn?: () => void;
}

const QR_REGION_ID = 'qr-checkin-reader';

const QRCheckInScanner = ({ isOpen, onClose, events, onCheckedIn }: QRCheckInScannerProps) => {
  const { t } = useTranslation(['organizer', 'common']);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });
  const selectedEventRef = useRef<string>('');

  selectedEventRef.current = selectedEvent;

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        // isScanning() is internal; guard with try/catch.
        await scanner.stop();
        await scanner.clear();
      } catch {
        /* already stopped */
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const handleDecoded = useCallback(
    async (decodedText: string) => {
      const code = decodedText.trim();
      const now = Date.now();
      // Debounce repeated reads of the same QR within 3s.
      if (code === lastScanRef.current.code && now - lastScanRef.current.time < 3000) {
        return;
      }
      lastScanRef.current = { code, time: now };

      const eventId = selectedEventRef.current;
      if (!eventId) return;

      setIsProcessing(true);
      try {
        const res = await organizerService.checkInAttendee({ ticketCode: code, eventId });
        if (res.success) {
          setResult({
            type: 'success',
            message: res.message || t('organizer:qrCheckIn.success', 'Check-in successful'),
            attendeeName: res.attendee?.name,
            ticketType: res.attendee?.ticketType,
          });
          onCheckedIn?.();
        } else {
          setResult({
            type: 'error',
            message: res.message || t('organizer:qrCheckIn.failed', 'Check-in failed'),
          });
        }
      } catch (err: any) {
        setResult({
          type: 'error',
          message:
            err?.response?.data?.message ||
            t('organizer:qrCheckIn.failed', 'Check-in failed'),
        });
      } finally {
        setIsProcessing(false);
        // Clear the result banner after a short delay so scanning can continue.
        setTimeout(() => setResult(null), 3500);
      }
    },
    [onCheckedIn, t],
  );

  const startScanner = useCallback(async () => {
    if (!selectedEvent) return;
    setCameraError('');
    setResult(null);

    const scanner = new Html5Qrcode(QR_REGION_ID);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleDecoded(decodedText),
        () => {
          /* per-frame decode errors are expected; ignore */
        },
      );
      setIsScanning(true);
    } catch (err: any) {
      scannerRef.current = null;
      setCameraError(
        err?.message ||
          t('organizer:qrCheckIn.cameraError', 'Unable to access camera. Please grant camera permission.'),
      );
      setIsScanning(false);
    }
  }, [selectedEvent, handleDecoded, t]);

  // Stop scanning when the modal closes or unmounts.
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setSelectedEvent('');
      setResult(null);
      setCameraError('');
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, stopScanner]);

  if (!isOpen) return null;

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black">
              {t('organizer:qrCheckIn.title', 'Scan to check-in')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray hover:text-black transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Event selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              {t('organizer:qrCheckIn.selectEvent', 'Select event')} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              disabled={isScanning}
              className="w-full px-4 py-3 bg-white border border-light-gray rounded-lg text-sm text-black focus:outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">{t('organizer:qrCheckIn.eventPlaceholder', 'Choose an event...')}</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scanner viewport */}
          <div className="relative mb-4">
            <div
              id={QR_REGION_ID}
              className="w-full overflow-hidden rounded-lg bg-black/5 min-h-[250px] flex items-center justify-center"
            >
              {!isScanning && (
                <p className="text-sm text-gray px-6 text-center">
                  {t('organizer:qrCheckIn.idleHint', 'Select an event and start the camera to scan ticket QR codes.')}
                </p>
              )}
            </div>

            {/* Result overlay */}
            {result && (
              <div
                className={`absolute inset-x-0 bottom-0 p-3 text-sm font-medium ${
                  result.type === 'success'
                    ? 'bg-[#E8F5E9] text-[#2E7D32]'
                    : 'bg-[#FDECEA] text-[#C62828]'
                }`}
              >
                <p>{result.message}</p>
                {result.attendeeName && (
                  <p className="text-xs mt-0.5">
                    {result.attendeeName}
                    {result.ticketType ? ` · ${result.ticketType}` : ''}
                  </p>
                )}
              </div>
            )}
          </div>

          {cameraError && <p className="text-sm text-red-500 mb-3">{cameraError}</p>}
          {isProcessing && (
            <p className="text-sm text-gray mb-3">{t('organizer:qrCheckIn.processing', 'Processing...')}</p>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-white border border-light-gray text-gray hover:text-black hover:border-gray-400 font-medium text-sm rounded-full transition-all cursor-pointer"
            >
              {t('common:cta.close', 'Close')}
            </button>
            {!isScanning ? (
              <button
                onClick={startScanner}
                disabled={!selectedEvent}
                className="flex-1 px-4 py-2.5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: !selectedEvent ? 'none' : '0 4px 12px rgba(255, 64, 0, 0.25)' }}
              >
                {t('organizer:qrCheckIn.start', 'Start camera')}
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="flex-1 px-4 py-2.5 bg-black hover:bg-[#333] text-white font-medium text-sm rounded-full transition-all cursor-pointer"
              >
                {t('organizer:qrCheckIn.stop', 'Stop camera')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCheckInScanner;
