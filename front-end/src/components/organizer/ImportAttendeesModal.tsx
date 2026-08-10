import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import organizerService, { type Event as OrganizerEvent } from '../../services/organizerService';
import { useAuth } from '../../context/AuthContext';

interface ImportedPerson {
  email: string;
  name: string;
  photo?: string;
  eventId: string;
}

interface ImportAttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Emails déjà invités : ils restent visibles mais non sélectionnables. */
  alreadyInvited: string[];
  /** Reçoit les emails retenus à la validation. */
  onImport: (emails: string[]) => void;
}

/**
 * Importe des participants d'événements passés de l'organisateur pour les
 * inviter à un événement privé. Ne montre que ses propres événements.
 */
const ImportAttendeesModal = ({ isOpen, onClose, alreadyInvited, onImport }: ImportAttendeesModalProps) => {
  const { t } = useTranslation('organizer');
  const { user } = useAuth();

  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [people, setPeople] = useState<ImportedPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Chargement des participants de tous les événements de l'organisateur.
  useEffect(() => {
    if (!isOpen || !user?.id) return;
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const organizerId = user.organizationId || user.id;
        const eventsData = await organizerService.getEvents({ organizerId });
        if (cancelled) return;
        setEvents(eventsData);

        const lists = await Promise.all(
          eventsData.map((e) =>
            organizerService.getAttendeesByEvent(e.id).catch(() => []),
          ),
        );
        if (cancelled) return;

        // Un même participant peut revenir sur plusieurs événements : on
        // dédoublonne par email en gardant la première occurrence.
        const seen = new Set<string>();
        const collected: ImportedPerson[] = [];
        lists.forEach((list, i) => {
          list.forEach((a) => {
            const owner = a.ticket?.owner;
            const email = owner?.email?.toLowerCase();
            if (!email || seen.has(email)) return;
            seen.add(email);
            collected.push({
              email,
              name: owner?.name || email,
              photo: owner?.profilePhoto,
              eventId: eventsData[i].id,
            });
          });
        });
        setPeople(collected);
      } catch {
        if (!cancelled) setError(t('importAttendees.error'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen, user?.id, user?.organizationId, t]);

  // Réinitialise la sélection à chaque ouverture.
  useEffect(() => {
    if (isOpen) {
      setSelected([]);
      setEventFilter('all');
      setShowCancelConfirm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsEventDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const invitedSet = useMemo(
    () => new Set(alreadyInvited.map((e) => e.toLowerCase())),
    [alreadyInvited],
  );

  const visiblePeople = useMemo(
    () => (eventFilter === 'all' ? people : people.filter((p) => p.eventId === eventFilter)),
    [people, eventFilter],
  );

  /** Seuls les participants pas encore invités peuvent être cochés. */
  const selectablePeople = useMemo(
    () => visiblePeople.filter((p) => !invitedSet.has(p.email)),
    [visiblePeople, invitedSet],
  );

  const allSelected =
    selectablePeople.length > 0 && selectablePeople.every((p) => selected.includes(p.email));

  const toggleAll = () => {
    setSelected(allSelected ? [] : selectablePeople.map((p) => p.email));
  };

  const togglePerson = (email: string) => {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );
  };

  /** Annuler : confirmation seulement si une sélection serait perdue. */
  const handleCancel = () => {
    if (selected.length > 0) setShowCancelConfirm(true);
    else onClose();
  };

  if (!isOpen) return null;

  const eventName = (id: string) => events.find((e) => e.id === id)?.title || '';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="p-6 pb-4">
          <h2 className="text-xl font-bold text-black mb-1">{t('importAttendees.title')}</h2>
          <p className="text-sm text-[#4F4F4F]">{t('importAttendees.subtitle')}</p>
        </div>

        {/* Filtre par événement */}
        <div className="px-6 pb-3">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-light-gray rounded-lg text-sm text-black hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
            >
              <span className="truncate">
                {eventFilter === 'all' ? t('importAttendees.allEvents') : eventName(eventFilter)}
              </span>
              <svg className="w-4 h-4 text-gray shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isEventDropdownOpen && (
              <div className="absolute top-full start-0 end-0 mt-2 bg-white rounded-lg shadow-lg border border-light-gray py-1 z-[60] max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setEventFilter('all'); setIsEventDropdownOpen(false); }}
                  className={`w-full text-start px-4 py-2.5 text-sm transition-colors ${
                    eventFilter === 'all' ? 'bg-primary-light text-primary font-semibold' : 'text-black hover:bg-secondary-light'
                  }`}
                >
                  {t('importAttendees.allEvents')}
                </button>
                {events.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => { setEventFilter(e.id); setIsEventDropdownOpen(false); }}
                    className={`w-full text-start px-4 py-2.5 text-sm transition-colors truncate ${
                      eventFilter === e.id ? 'bg-primary-light text-primary font-semibold' : 'text-black hover:bg-secondary-light'
                    }`}
                  >
                    {e.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tout sélectionner */}
        {selectablePeople.length > 0 && (
          <div className="px-6 pb-2 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="w-4 h-4 accent-[#FF4000] cursor-pointer"
              />
              <span className="text-sm font-medium text-black">{t('importAttendees.selectAll')}</span>
            </label>
            <span className="text-xs text-gray">
              {t('importAttendees.selectedCount', { count: selected.length })}
            </span>
          </div>
        )}

        {/* Liste */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 min-h-[160px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4000]"></div>
            </div>
          ) : error ? (
            <p className="text-sm text-[#FF3425] py-8 text-center">{error}</p>
          ) : visiblePeople.length === 0 ? (
            <p className="text-sm text-gray py-8 text-center">{t('importAttendees.empty')}</p>
          ) : (
            <div className="space-y-1">
              {visiblePeople.map((p) => {
                const already = invitedSet.has(p.email);
                const checked = selected.includes(p.email);
                return (
                  <label
                    key={p.email}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      already ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-secondary-light'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={already}
                      onChange={() => togglePerson(p.email)}
                      className="w-4 h-4 accent-[#FF4000] cursor-pointer disabled:cursor-not-allowed"
                    />
                    {p.photo ? (
                      <img src={p.photo} alt={p.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {p.name.trim().charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">{p.name}</p>
                      <p className="text-xs text-gray truncate">{p.email}</p>
                    </div>
                    {already && (
                      <span className="text-[10px] font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full shrink-0">
                        {t('importAttendees.alreadyInvited')}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-4 border-t border-light-gray">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 bg-white border border-light-gray text-gray hover:text-black hover:border-gray-400 font-medium text-sm rounded-full transition-all cursor-pointer"
          >
            {t('importAttendees.cancel')}
          </button>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => { onImport(selected); onClose(); }}
            className="flex-1 px-4 py-2.5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF4000]"
          >
            {t('importAttendees.invite')}
          </button>
        </div>
      </div>

      {/* Confirmation d'abandon — uniquement si une sélection serait perdue */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-black mb-4">{t('importAttendees.discardTitle')}</h2>
            <p className="text-[#4F4F4F] text-base leading-relaxed mb-8">
              {t('importAttendees.discardMessage', { count: selected.length })}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-8 py-3 bg-white text-black font-semibold rounded-full border-2 border-[#EEEEEE] hover:bg-[#F8F8F8] transition-colors"
              >
                {t('importAttendees.discardKeep')}
              </button>
              <button
                type="button"
                onClick={() => { setShowCancelConfirm(false); onClose(); }}
                className="px-8 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
              >
                {t('importAttendees.discardConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportAttendeesModal;
