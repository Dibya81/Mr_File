import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, Clock, X, Send, Inbox } from 'lucide-react';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { cn, formatDate } from '@/utils/helpers';
import { communityApi } from '@/api/community';
import { toast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import CommunityLayout from '@/components/community/CommunityLayout';
import CreateRequestDialog from '@/components/community/CreateRequestDialog';
import MakeOfferSheet from '@/components/community/MakeOfferSheet';
import { WorkspaceLayout } from '@/components/workspace';
import type { CommunityRequest, CommunityOffer, CommunityTransfer } from '@/types';

type Tab = 'browse' | 'mine' | 'offers' | 'transfers';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  filled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  declined: 'bg-red-500/10 text-red-400 border-red-500/20',
  withdrawn: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  received: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

function StatusPill({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border',
        STATUS_COLORS[status] || STATUS_COLORS.pending,
      )}
    >
      {t(`community.status.${status}`, status)}
    </span>
  );
}

export default function CommunityPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>('browse');
  const [showCreate, setShowCreate] = useState(false);
  const [offerTarget, setOfferTarget] = useState<CommunityRequest | null>(null);

  const requestsQuery = useQuery({
    queryKey: ['community-requests', tab],
    queryFn: () =>
      tab === 'mine'
        ? communityApi.requests.mine({ status: undefined })
        : communityApi.requests.list({}),
    enabled: tab === 'browse' || tab === 'mine',
  });

  const offersQuery = useQuery({
    queryKey: ['community-my-offers'],
    queryFn: () => communityApi.offers.mine(),
    enabled: tab === 'offers',
  });

  const transfersQuery = useQuery({
    queryKey: ['community-transfers'],
    queryFn: () => communityApi.transfers.list(),
    enabled: tab === 'transfers',
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => communityApi.requests.cancel(id),
    onSuccess: () => {
      toast.success('Request cancelled');
      qc.invalidateQueries({ queryKey: ['community-requests'] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => communityApi.offers.accept(id),
    onSuccess: () => {
      toast.success('Offer accepted');
      qc.invalidateQueries({ queryKey: ['community-requests'] });
      qc.invalidateQueries({ queryKey: ['community-transfers'] });
    },
  });

  const declineOfferMutation = useMutation({
    mutationFn: (id: string) => communityApi.offers.decline(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-requests'] });
      qc.invalidateQueries({ queryKey: ['community-my-offers'] });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => communityApi.offers.withdraw(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-my-offers'] });
    },
  });

  const receiveMutation = useMutation({
    mutationFn: (id: string) => communityApi.transfers.receive(id),
    onSuccess: () => {
      toast.success('Document saved to Community Received');
      qc.invalidateQueries({ queryKey: ['community-transfers'] });
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const declineTransferMutation = useMutation({
    mutationFn: (id: string) => communityApi.transfers.decline(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-transfers'] });
    },
  });

  const requests: CommunityRequest[] = (requestsQuery.data?.data as any)?.requests ?? [];
  const offers: CommunityOffer[] = (offersQuery.data?.data as any)?.offers ?? [];
  const transfers: CommunityTransfer[] = (transfersQuery.data?.data as any)?.transfers ?? [];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'browse', label: t('community.browseRequests') },
    { id: 'mine', label: t('community.myRequests') },
    { id: 'offers', label: t('community.myOffers') },
    { id: 'transfers', label: t('community.transfers') },
  ];

  return (
    <WorkspaceLayout>
      <CommunityLayout>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/[0.04] rounded-lg p-1">
            {tabs.map((tt) => (
              <button
                key={tt.id}
                onClick={() => setTab(tt.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition',
                  tab === tt.id
                    ? 'bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                )}
              >
                {tt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-500 text-white"
          >
            <Plus size={14} />
            New Request
          </button>
        </div>

        {(tab === 'browse' || tab === 'mine') && (
          <RequestsList
            requests={requests}
            isLoading={requestsQuery.isLoading}
            isDark={isDark}
            currentUserId={user?.id}
            tab={tab}
            onOffer={(r) => setOfferTarget(r)}
            onCancel={(id) => cancelMutation.mutate(id)}
          />
        )}

        {tab === 'offers' && (
          <OffersList
            offers={offers}
            isLoading={offersQuery.isLoading}
            isDark={isDark}
            onDecline={(id) => declineOfferMutation.mutate(id)}
            onWithdraw={(id) => withdrawMutation.mutate(id)}
            onAccept={(id) => acceptMutation.mutate(id)}
            currentUserId={user?.id}
          />
        )}

        {tab === 'transfers' && (
          <TransfersList
            transfers={transfers}
            isLoading={transfersQuery.isLoading}
            isDark={isDark}
            currentUserId={user?.id}
            onReceive={(id) => receiveMutation.mutate(id)}
            onDecline={(id) => declineTransferMutation.mutate(id)}
          />
        )}

        {showCreate && <CreateRequestDialog onClose={() => setShowCreate(false)} />}
        {offerTarget && <MakeOfferSheet request={offerTarget} onClose={() => setOfferTarget(null)} />}
      </CommunityLayout>
    </WorkspaceLayout>
  );
}

function RequestsList({
  requests,
  isLoading,
  isDark,
  currentUserId,
  tab,
  onOffer,
  onCancel,
}: {
  requests: CommunityRequest[];
  isLoading: boolean;
  isDark: boolean;
  currentUserId?: string;
  tab: Tab;
  onOffer: (r: CommunityRequest) => void;
  onCancel: (id: string) => void;
}) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn('h-32 rounded-xl animate-pulse', isDark ? 'bg-white/[0.03]' : 'bg-gray-100')} />
        ))}
      </div>
    );
  }
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-4', isDark ? 'bg-white/[0.04]' : 'bg-gray-100')}>
          <Inbox size={28} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
        </div>
        <h3 className={cn('text-base font-semibold mb-1', isDark ? 'text-white' : 'text-gray-900')}>
          {tab === 'mine' ? 'No requests yet' : t('community.noRequests')}
        </h3>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {requests.map((r) => {
        const isMine = currentUserId === r.requester_id;
        return (
          <div
            key={r.id}
            className={cn(
              'rounded-xl p-4 border',
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200',
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-semibold truncate', isDark ? 'text-white' : 'text-gray-900')}>
                  {r.title}
                </p>
                <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-gray-500')}>
                  @{r.requester_username} · {formatDate(r.created_at)}
                </p>
              </div>
              <StatusPill status={r.status} />
            </div>
            {r.description && (
              <p className={cn('text-xs line-clamp-2', isDark ? 'text-slate-300' : 'text-gray-600')}>
                {r.description}
              </p>
            )}
            {r.document_type && (
              <span className={cn('inline-flex mt-2 items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider', isDark ? 'bg-white/10 text-slate-300' : 'bg-gray-100 text-gray-600')}>
                {r.document_type}
              </span>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-gray-500')}>
                {r.offer_count ?? 0} offer{r.offer_count === 1 ? '' : 's'}
              </p>
              {r.status === 'open' && (
                isMine ? (
                  <button
                    onClick={() => onCancel(r.id)}
                    className="text-xs font-medium text-red-500 hover:text-red-400 inline-flex items-center gap-1"
                  >
                    <X size={12} /> {t('community.cancel')}
                  </button>
                ) : (
                  <button
                    onClick={() => onOffer(r)}
                    className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Send size={12} /> {t('community.offer')}
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OffersList({
  offers,
  isLoading,
  isDark,
  onAccept,
  onDecline,
  onWithdraw,
  currentUserId,
}: {
  offers: CommunityOffer[];
  isLoading: boolean;
  isDark: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onWithdraw: (id: string) => void;
  currentUserId?: string;
}) {
  const { t } = useTranslation();
  if (isLoading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (offers.length === 0) {
    return <p className={cn('text-sm text-center py-12', isDark ? 'text-slate-400' : 'text-gray-500')}>{t('community.noOffers')}</p>;
  }
  return (
    <div className="space-y-2">
      {offers.map((o) => (
        <div key={o.id} className={cn('rounded-xl p-4 border', isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200')}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className={cn('text-sm font-semibold truncate', isDark ? 'text-white' : 'text-gray-900')}>
                {o.request_title}
              </p>
              <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-gray-500')}>
                {o.document_filename} · {formatDate(o.created_at)}
              </p>
              {o.message && <p className={cn('text-xs mt-2 italic', isDark ? 'text-slate-300' : 'text-gray-600')}>"{o.message}"</p>}
            </div>
            <StatusPill status={o.status} />
          </div>
          {o.status === 'pending' && (
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => onWithdraw(o.id)}
                className="px-2.5 py-1 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Withdraw
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TransfersList({
  transfers,
  isLoading,
  isDark,
  currentUserId,
  onReceive,
  onDecline,
}: {
  transfers: CommunityTransfer[];
  isLoading: boolean;
  isDark: boolean;
  currentUserId?: string;
  onReceive: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const { t: tc } = useTranslation();
  if (isLoading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (transfers.length === 0) {
    return <p className={cn('text-sm text-center py-12', isDark ? 'text-slate-400' : 'text-gray-500')}>{tc('community.noTransfers')}</p>;
  }
  return (
    <div className="space-y-2">
      {transfers.map((transfer) => {
        const isMine = currentUserId === transfer.requester_id;
        return (
          <div key={transfer.id} className={cn('rounded-xl p-4 border', isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200')}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                  {isMine ? 'You received a transfer' : 'You sent a transfer'}
                </p>
                <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-gray-500')}>
                  {formatDate(transfer.created_at)}
                </p>
              </div>
              <StatusPill status={transfer.status} />
            </div>
            {isMine && transfer.status === 'pending' && (
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => onDecline(transfer.id)}
                  className="px-2.5 py-1 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  Decline
                </button>
                <button
                  onClick={() => onReceive(transfer.id)}
                  className="px-3 py-1 text-xs font-medium rounded-md bg-primary-600 hover:bg-primary-500 text-white"
                >
                  {tc('community.markReceived')}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
