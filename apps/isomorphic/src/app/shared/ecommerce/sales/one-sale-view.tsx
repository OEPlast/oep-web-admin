// UI client for displaying a single sale by id
'use client';
import { useEffect, useState } from 'react';
import { getSaleById, Sale } from './one-client';
import { Text, Badge, Tooltip, Avatar, Box } from 'rizzui';
import {
  PiSpinnerBallFill,
  PiCheckCircleFill,
  PiXCircleFill,
  PiLightningFill,
  PiCalendarCheckFill,
  PiUsersThreeFill,
  PiChartLineUpFill,
  PiTagFill,
  PiClockFill,
  PiTrendUpFill,
} from 'react-icons/pi';
import cn from '@core/utils/class-names';
export default function OneSaleView({
  id,
  initialSale,
}: {
  id: string;
  initialSale: Sale | null;
}) {
  const [sale, setSale] = useState<Sale | null>(initialSale);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialSale) {
      setLoading(true);
      getSaleById(id).then((data) => {
        setSale(data);
        setLoading(false);
      });
    }
  }, [id, initialSale]);

  if (loading) return <PiSpinnerBallFill />;
  if (!sale) return <Text className="text-red-500">Sale not found.</Text>;

  // 2025 modern Box UI, dynamic info, project-matching style
  const product = (sale as any).product;
  const productName = typeof product === 'object' ? product.name : product;
  const productImage =
    typeof product === 'object' ? product.coverImage : undefined;
  const productCategory =
    typeof product === 'object' ? product.category?.name : undefined;
  const productSubCategory =
    typeof product === 'object' ? product.subCategories?.name : undefined;
  const productStock = typeof product === 'object' ? product.stock : undefined;
  const campaign = sale.campaign || 'N/A';
  const now = Date.now();
  const start = new Date(sale.startDate).getTime();
  const end = new Date(sale.endDate).getTime();
  const isActive = sale.isActive && now >= start && now <= end && !sale.deleted;
  const statusColor = isActive
    ? 'success'
    : sale.deleted
      ? 'danger'
      : 'warning';
  const statusText = sale.deleted
    ? 'Deleted'
    : isActive
      ? 'Active'
      : now < start
        ? 'Upcoming'
        : 'Ended';
  const progress =
    sale.limit && sale.boughtCount
      ? Math.min(100, Math.round((sale.boughtCount / sale.limit) * 100))
      : 0;
  return (
    <div className="space-y-6">
      {/* Header Card - Product & Sale Overview */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="relative bg-gradient-to-br from-slate-50 to-gray-100 p-8">
          <div className="flex flex-col items-start gap-8 lg:flex-row">
            {/* Product Image */}
            {productImage && (
              <div className="flex-shrink-0">
                <img
                  src={productImage}
                  alt={productName}
                  className="h-64 w-full rounded-xl border border-white bg-white object-contain shadow-lg lg:w-64"
                />
              </div>
            )}

            {/* Sale Information */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {sale.title}
                  </h1>
                  <Badge
                    color={statusColor}
                    className={cn(
                      'rounded-full px-3 py-1 text-sm font-medium',
                      statusText === 'Ended' ? 'bg-red-500' : ''
                    )}
                  >
                    {statusText}
                  </Badge>
                  {sale.type === 'Flash' && (
                    <Tooltip content="Sale">
                      <PiLightningFill className="text-amber-500" size={24} />
                    </Tooltip>
                  )}
                </div>
                <p className="mb-1 text-xl font-semibold text-gray-700">
                  {productName}
                </p>
                <p className="text-gray-500">
                  {productCategory}
                  {productSubCategory ? ` • ${productSubCategory}` : ''}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-100 bg-white p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <PiTagFill className="text-blue-500" size={16} />
                    <span className="text-sm font-medium text-gray-600">
                      Type
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {sale.type}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-white p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <PiUsersThreeFill className="text-green-500" size={16} />
                    <span className="text-sm font-medium text-gray-600">
                      Limit
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {sale.limit}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-white p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <PiTrendUpFill className="text-purple-500" size={16} />
                    <span className="text-sm font-medium text-gray-600">
                      Sold
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {sale.boughtCount ?? 0}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-white p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <PiChartLineUpFill className="text-orange-500" size={16} />
                    <span className="text-sm font-medium text-gray-600">
                      Progress
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {progress}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sales Progress</span>
                  <span>
                    {sale.boughtCount ?? 0} / {sale.limit} sold
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      progress > 80
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : progress > 50
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <PiClockFill className="text-blue-500" size={20} />
          Sale Timeline
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50 p-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Start Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(sale.startDate).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 p-3">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">End Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(sale.endDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {campaign && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-medium text-gray-900">Campaign</p>
                <p className="text-sm text-gray-600">{campaign}</p>
              </div>
            )}
            {typeof productStock === 'number' && (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-900">
                  Product Stock
                </p>
                <p className="text-sm text-gray-600">{productStock} units</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variants Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Sale Variants
        </h3>
        <div className="grid gap-4">
          {sale.variants.map((variant, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge color="primary" className="text-sm font-medium">
                    {variant.attributeName || 'General'}
                  </Badge>
                  <Badge color="secondary" className="text-sm">
                    {variant.attributeValue || 'All'}
                  </Badge>
                  <Badge color="success" className="text-sm font-semibold">
                    {variant.discount}% OFF
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">Max: {variant.maxBuys}</span>
                  <span className="font-medium">
                    Sold: {variant.boughtCount}
                  </span>
                  {typeof variant.limit === 'number' && (
                    <span className="font-medium">Limit: {variant.limit}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Sale Details
        </h3>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="font-medium text-gray-900">Sale ID</p>
            <p className="font-mono text-xs text-gray-600">{sale._id}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-900">Created</p>
            <p className="text-gray-600">
              {sale.createdAt
                ? new Date(sale.createdAt).toLocaleDateString()
                : '-'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-900">Last Updated</p>
            <p className="text-gray-600">
              {sale.updatedAt
                ? new Date(sale.updatedAt).toLocaleDateString()
                : '-'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-900">Created By</p>
            <p className="text-gray-600">{sale.createdBy || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-900">Updated By</p>
            <p className="text-gray-600">{sale.updatedBy || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
