import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import organizerService, { Event as ApiEvent } from '../../services/organizerService';
import promotionService, { Promotion, PromotionType } from '../../services/promotionService';
import { useAuth } from '../../context/AuthContext';

interface PromoForm {
  code: string;
  description: string;
  type: PromotionType;
  value: string;
  eventId: string;
  maxUses: string;
  validFrom: string;
  validUntil: string;
}

const emptyForm: PromoForm = {
  code: '',
  description: '',
  type: 'percent',
  value: '',
  eventId: '',
  maxUses: '',
  validFrom: '',
  validUntil: '',
};

const PromotionsTable = () => {
  const { t } = useTranslation('organizer');
  const { user } = useAuth();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<PromoForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const eventNameById = useCallback(
    (id?: string) => events.find((e) => e.id === id)?.title,
    [events],
  );

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const organizerId = user.organizationId || user.id;
      const [eventsData, promosData] = await Promise.all([
        organizerService.getEvents({ organizerId }),
        promotionService.getAll(),
      ]);
      setEvents(eventsData);
      // Only show promos that are global or scoped to this organizer's events
      const eventIds = new Set(eventsData.map((e) => e.id));
      setPromotions(promosData.filter((p) => !p.eventId || eventIds.has(p.eventId)));
    } catch (err: any) {
      setError(err.response?.data?.message || t('promotions.loadError', 'Failed to load promotions.'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.organizationId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setFormError(null);
    const code = form.code.trim();
    const value = Number(form.value);
    if (!code) {
      setFormError(t('promotions.errors.codeRequired', 'Code is required'));
      return;
    }
    if (!form.value || isNaN(value) || value <= 0) {
      setFormError(t('promotions.errors.valueRequired', 'Enter a valid discount value'));
      return;
    }
    if (form.type === 'percent' && value > 100) {
      setFormError(t('promotions.errors.percentMax', 'Percentage cannot exceed 100'));
      return;
    }
    if (!form.validFrom || !form.validUntil) {
      setFormError(t('promotions.errors.datesRequired', 'Valid from and until dates are required'));
      return;
    }
    if (new Date(form.validUntil) < new Date(form.validFrom)) {
      setFormError(t('promotions.errors.dateOrder', 'End date must be after start date'));
      return;
    }

    setSubmitting(true);
    try {
      await promotionService.create({
        code: code.toUpperCase(),
        description: form.description.trim() || undefined,
        type: form.type,
        value,
        eventId: form.eventId || undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        validFrom: new Date(form.validFrom).toISOString(),
        validUntil: new Date(form.validUntil).toISOString(),
      });
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || t('promotions.errors.createFailed', 'Failed to create promotion'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (promo: Promotion) => {
    try {
      if (promo.isActive) {
        await promotionService.deactivate(promo.id);
      } else {
        await promotionService.update(promo.id, { isActive: true });
      }
      await fetchData();
    } catch {
      /* keep UI responsive; refetch on next action */
    }
  };

  const handleDelete = async (promo: Promotion) => {
    if (!window.confirm(t('promotions.confirmDelete', 'Delete this promo code?'))) return;
    try {
      await promotionService.delete(promo.id);
      await fetchData();
    } catch {
      /* no-op */
    }
  };

  const formatDiscount = (promo: Promotion) =>
    promo.type === 'percent' ? `${Number(promo.value)}%` : `$${Number(promo.value).toFixed(2)}`;

  const formatDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString() : '—');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">{t('promotions.title', 'Promo codes')}</h1>
          <p className="text-sm text-dark-gray mt-1">
            {t('promotions.subtitle', 'Create and manage discount codes for your events.')}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          {t('promotions.create', 'Create promo code')}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-3">{error}</p>
          <button onClick={fetchData} className="text-primary font-semibold hover:underline cursor-pointer">
            {t('promotions.retry', 'Retry')}
          </button>
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-16 bg-secondary-light rounded-2xl">
          <p className="text-dark-gray">{t('promotions.empty', 'No promo codes yet.')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-light-gray rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-dark-gray border-b border-light-gray">
                <th className="px-4 py-3 font-medium">{t('promotions.cols.code', 'Code')}</th>
                <th className="px-4 py-3 font-medium">{t('promotions.cols.discount', 'Discount')}</th>
                <th className="px-4 py-3 font-medium">{t('promotions.cols.event', 'Event')}</th>
                <th className="px-4 py-3 font-medium">{t('promotions.cols.usage', 'Usage')}</th>
                <th className="px-4 py-3 font-medium">{t('promotions.cols.validity', 'Validity')}</th>
                <th className="px-4 py-3 font-medium">{t('promotions.cols.status', 'Status')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('promotions.cols.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo.id} className="border-b border-light-gray last:border-0">
                  <td className="px-4 py-3 font-semibold text-black">{promo.code}</td>
                  <td className="px-4 py-3 text-black">{formatDiscount(promo)}</td>
                  <td className="px-4 py-3 text-dark-gray">
                    {promo.eventId ? eventNameById(promo.eventId) || '—' : t('promotions.allEvents', 'All events')}
                  </td>
                  <td className="px-4 py-3 text-dark-gray">
                    {promo.usedCount}
                    {promo.maxUses ? ` / ${promo.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-dark-gray">
                    {formatDate(promo.validFrom)} – {formatDate(promo.validUntil)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        promo.isActive ? 'bg-[#E8F7EE] text-[#34A853]' : 'bg-light-gray text-dark-gray'
                      }`}
                    >
                      {promo.isActive ? t('promotions.active', 'Active') : t('promotions.inactive', 'Inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleToggleActive(promo)}
                        className="text-xs font-medium text-primary hover:underline cursor-pointer"
                      >
                        {promo.isActive ? t('promotions.deactivate', 'Deactivate') : t('promotions.activate', 'Activate')}
                      </button>
                      <button
                        onClick={() => handleDelete(promo)}
                        className="text-xs font-medium text-red-500 hover:underline cursor-pointer"
                      >
                        {t('promotions.delete', 'Delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black">{t('promotions.create', 'Create promo code')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-dark-gray hover:text-black cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">{t('promotions.form.code', 'Code')}</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="SUMMER2025"
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-primary uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">{t('promotions.form.type', 'Type')}</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as PromotionType })}
                    className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="percent">{t('promotions.form.percent', 'Percentage (%)')}</option>
                    <option value="fixed">{t('promotions.form.fixed', 'Fixed amount ($)')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">{t('promotions.form.value', 'Value')}</label>
                  <input
                    type="number"
                    min={0}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">{t('promotions.form.event', 'Event (optional)')}</label>
                <select
                  value={form.eventId}
                  onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="">{t('promotions.allEvents', 'All events')}</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">{t('promotions.form.validFrom', 'Valid from')}</label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">{t('promotions.form.validUntil', 'Valid until')}</label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">{t('promotions.form.maxUses', 'Max uses (optional)')}</label>
                <input
                  type="number"
                  min={0}
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">{t('promotions.form.description', 'Description (optional)')}</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-light-gray rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-dark-gray hover:text-black cursor-pointer"
              >
                {t('promotions.form.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? t('promotions.form.saving', 'Saving...') : t('promotions.form.save', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsTable;
