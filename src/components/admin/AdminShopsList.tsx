import React, { useState, useMemo } from 'react';
import { ShopRecord } from '../../types/index.ts';
import {
  Search,
  Phone,
  Clock,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import { getHoursSincePayment, isPaidBeforeCutoffAndNotLive } from './adminHelpers.ts';

interface AdminShopsListProps {
  shops: ShopRecord[];
  cutoffTime: string;
  onSelectShop: (shop: ShopRecord) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const AdminShopsList: React.FC<AdminShopsListProps> = ({
  shops,
  cutoffTime,
  onSelectShop,
  loading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'needs_setup' | 'live' | 'past_due' | 'canceled'>('all');

  // Counts for cards
  const counts = useMemo(() => {
    let needsSetup = 0;
    let live = 0;
    let pastDue = 0;
    let canceled = 0;

    shops.forEach((s) => {
      const isNeeds = s.status === 'paid_setup' || s.status === 'provisioning';
      const isLive = s.status === 'live' || s.status === 'active';
      const isPastDue = s.status === 'past_due' || s.subscriptionStatus === 'past_due';
      const isCanceled = s.status === 'canceled' || s.subscriptionStatus === 'canceled';

      if (isNeeds) needsSetup++;
      if (isLive) live++;
      if (isPastDue) pastDue++;
      if (isCanceled) canceled++;
    });

    return { needsSetup, live, pastDue, canceled };
  }, [shops]);

  // Filtered & sorted shops
  const processedShops = useMemo(() => {
    let list = [...shops];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => {
        return (
          (s.shopName && s.shopName.toLowerCase().includes(q)) ||
          (s.ownerName && s.ownerName.toLowerCase().includes(q)) ||
          (s.ownerMobile && s.ownerMobile.replace(/\D/g, '').includes(q.replace(/\D/g, '')))
        );
      });
    }

    // Status filter
    if (statusFilter === 'needs_setup') {
      list = list.filter((s) => s.status === 'paid_setup' || s.status === 'provisioning');
    } else if (statusFilter === 'live') {
      list = list.filter((s) => s.status === 'live' || s.status === 'active');
    } else if (statusFilter === 'past_due') {
      list = list.filter((s) => s.status === 'past_due' || s.subscriptionStatus === 'past_due');
    } else if (statusFilter === 'canceled') {
      list = list.filter((s) => s.status === 'canceled' || s.subscriptionStatus === 'canceled');
    }

    // Sort: "Needs setup" shops pinned to the top, then newest first
    list.sort((a, b) => {
      const aNeeds = a.status === 'paid_setup' || a.status === 'provisioning';
      const bNeeds = b.status === 'paid_setup' || b.status === 'provisioning';

      if (aNeeds && !bNeeds) return -1;
      if (!aNeeds && bNeeds) return 1;

      // Both in same bucket: sort newest first by createdAt
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });

    return list;
  }, [shops, searchQuery, statusFilter]);

  const getStatusBadge = (status: string, subStatus?: string) => {
    if (status === 'live' || status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      );
    }
    if (status === 'provisioning') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-300">
          <Clock className="w-3 h-3 text-purple-600" />
          Provisioning
        </span>
      );
    }
    if (status === 'paid_setup') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
          <Clock className="w-3 h-3 text-amber-600" />
          Paid Setup
        </span>
      );
    }
    if (status === 'paused') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
          Paused
        </span>
      );
    }
    if (status === 'canceled' || subStatus === 'canceled') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300">
          <XCircle className="w-3 h-3 text-rose-600" />
          Canceled
        </span>
      );
    }
    if (status === 'past_due' || subStatus === 'past_due') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Past Due
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. COUNT CARDS AT TOP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Needs Setup Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'needs_setup' ? 'all' : 'needs_setup')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            statusFilter === 'needs_setup'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
              : 'bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Needs Setup</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-950">{counts.needsSetup}</span>
            <span className="text-xs text-gray-500">shops</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Paid setup or provisioning</p>
        </button>

        {/* Live Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'live' ? 'all' : 'live')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            statusFilter === 'live'
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/20 shadow-sm'
              : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Live</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-950">{counts.live}</span>
            <span className="text-xs text-gray-500">shops</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Answering calls 24/7</p>
        </button>

        {/* Past Due Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'past_due' ? 'all' : 'past_due')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            statusFilter === 'past_due'
              ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-400/20 shadow-sm'
              : 'bg-white border-gray-200 hover:border-rose-300 hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Past Due</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-950">{counts.pastDue}</span>
            <span className="text-xs text-gray-500">shops</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Payment failure</p>
        </button>

        {/* Canceled Card */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'canceled' ? 'all' : 'canceled')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            statusFilter === 'canceled'
              ? 'bg-gray-100 border-gray-400 ring-2 ring-gray-400/20 shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Canceled</span>
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-950">{counts.canceled}</span>
            <span className="text-xs text-gray-500">shops</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Inactive subscriptions</p>
        </button>
      </div>

      {/* 2. SEARCH & STATUS FILTER */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by shop name, owner name, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm min-h-[44px] focus:bg-white focus:outline-none focus:border-black transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 pl-1 pr-2">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['all', 'needs_setup', 'live', 'past_due', 'canceled'] as const).map((filter) => {
            const labels = {
              all: 'All',
              needs_setup: 'Needs Setup',
              live: 'Live',
              past_due: 'Past Due',
              canceled: 'Canceled',
            };
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap min-h-[38px] transition-all ${
                  statusFilter === filter
                    ? 'bg-black text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SHOP LIST (Newest first, "Needs setup" pinned to top) */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-950">
              Auto Repair Shops ({processedShops.length})
            </h2>
            <p className="text-xs text-gray-500">
              Needs setup shops are pinned to the top. Tap mobile to call owner directly.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs font-semibold text-gray-600 hover:text-black px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-gray-500 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-purple-700" />
            Loading shops...
          </div>
        ) : processedShops.length === 0 ? (
          <div className="text-center py-16 text-xs text-gray-500">
            No shops match your search or filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {processedShops.map((shop) => {
              const isNeedsSetup = shop.status === 'paid_setup' || shop.status === 'provisioning';
              const hoursSincePayment = getHoursSincePayment(shop.paidAt);
              const isCutoffPending = isPaidBeforeCutoffAndNotLive(shop, cutoffTime);

              return (
                <div
                  key={shop.id}
                  onClick={() => onSelectShop(shop)}
                  className={`p-5 transition-all cursor-pointer hover:bg-gray-50/80 ${
                    isCutoffPending
                      ? 'bg-amber-50/60 border-l-4 border-amber-400'
                      : isNeedsSetup
                      ? 'bg-purple-50/30'
                      : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Shop Info & Badges */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-gray-950 text-base hover:text-purple-700 transition-colors">
                          {shop.shopName}
                        </span>

                        {getStatusBadge(shop.status, shop.subscriptionStatus)}

                        {isNeedsSetup && hoursSincePayment !== null && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                            <Clock className="w-3 h-3" />
                            {hoursSincePayment}h since payment
                          </span>
                        )}

                        {isCutoffPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-400">
                            <AlertTriangle className="w-3 h-3 text-amber-800" />
                            Paid before cutoff ({cutoffTime}) - Setup pending!
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                        <div>
                          <span className="text-gray-400 font-medium">Owner:</span>{' '}
                          <span className="font-semibold text-gray-900">{shop.ownerName || 'Unknown'}</span>
                        </div>

                        {shop.ownerMobile && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 font-medium">Mobile:</span>
                            <a
                              href={`tel:${shop.ownerMobile}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
                            >
                              <Phone className="w-3 h-3" />
                              {shop.ownerMobile}
                            </a>
                          </div>
                        )}

                        {shop.locationId && (
                          <div>
                            <span className="text-gray-400 font-medium">HighLevel ID:</span>{' '}
                            <span className="font-mono text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">
                              {shop.locationId}
                            </span>
                          </div>
                        )}

                        {shop.autointelNumber && (
                          <div>
                            <span className="text-gray-400 font-medium">AutoIntel Line:</span>{' '}
                            <span className="font-semibold text-emerald-800">{shop.autointelNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Setup Score & Date & Action */}
                    <div className="flex items-center justify-between lg:justify-end gap-5">
                      <div className="text-left lg:text-right">
                        <div className="text-xs text-gray-500 font-medium">Setup Score</div>
                        <div className="flex items-center lg:justify-end gap-1 font-black text-sm">
                          <span
                            className={
                              (shop.setupScore ?? 0) >= 80
                                ? 'text-emerald-700'
                                : (shop.setupScore ?? 0) >= 60
                                ? 'text-purple-700'
                                : 'text-amber-700'
                            }
                          >
                            {shop.setupScore !== undefined ? `${shop.setupScore}%` : '0%'}
                          </span>
                        </div>
                      </div>

                      <div className="text-left lg:text-right text-xs">
                        <div className="text-gray-400 font-medium">Paid Date</div>
                        <div className="font-semibold text-gray-800">
                          {shop.paidAt ? new Date(shop.paidAt).toLocaleDateString() : 'Unpaid'}
                        </div>
                      </div>

                      <div className="flex items-center text-gray-400 group-hover:text-purple-700 pl-2">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
