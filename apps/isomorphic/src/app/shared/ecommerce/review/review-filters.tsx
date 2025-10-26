/**
 * Advanced Review Filters Component
 * Reusable filter panel for review tables
 */

'use client';

import { useState } from 'react';
import { Button, Input, Select, Badge } from 'rizzui';
import {
  PiMagnifyingGlassBold,
  PiStarFill,
  PiCheckCircle,
  PiXCircle,
  PiClockClockwise,
  PiFunnel,
  PiX,
} from 'react-icons/pi';
import { type ReviewFilters as ReviewFiltersType } from '@/types/review.types';
import cn from '@core/utils/class-names';

interface ReviewFiltersProps {
  filters: ReviewFiltersType;
  onFilterChange: (filters: ReviewFiltersType) => void;
  onClearFilters: () => void;
}

const APPROVAL_STATUS_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Approved', value: 'true' },
  { label: 'Pending', value: 'false' },
];

const RATING_OPTIONS = [
  { label: 'All Ratings', value: '' },
  { label: '5 Stars', value: '5' },
  { label: '4 Stars', value: '4' },
  { label: '3 Stars', value: '3' },
  { label: '2 Stars', value: '2' },
  { label: '1 Star', value: '1' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt-desc' },
  { label: 'Oldest First', value: 'createdAt-asc' },
  { label: 'Highest Rating', value: 'rating-desc' },
  { label: 'Lowest Rating', value: 'rating-asc' },
  { label: 'Most Helpful', value: 'helpfulness-desc' },
];

export default function ReviewFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ReviewFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value, page: 1 });
  };

  const handleApprovalChange = (value: string) => {
    const isApproved = value === 'all' ? 'all' : value === 'true';
    onFilterChange({ ...filters, isApproved, page: 1 });
  };

  const handleRatingChange = (value: string) => {
    onFilterChange({
      ...filters,
      rating: value ? Number(value) : undefined,
      page: 1,
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [
      'createdAt' | 'rating' | 'helpfulness',
      'asc' | 'desc'
    ];
    onFilterChange({ ...filters, sortBy, sortOrder, page: 1 });
  };

  const handleToggleHasReplies = () => {
    onFilterChange({
      ...filters,
      hasReplies: filters.hasReplies === undefined ? true : filters.hasReplies ? false : undefined,
      page: 1,
    });
  };

  const handleToggleHasImages = () => {
    onFilterChange({
      ...filters,
      hasImages: filters.hasImages === undefined ? true : filters.hasImages ? false : undefined,
      page: 1,
    });
  };

  // Count active filters
  const activeFiltersCount = [
    filters.search,
    filters.isApproved !== 'all' && filters.isApproved !== undefined,
    filters.rating,
    filters.hasReplies,
    filters.hasImages,
  ].filter(Boolean).length;

  const currentSort = filters.sortBy && filters.sortOrder
    ? `${filters.sortBy}-${filters.sortOrder}`
    : 'createdAt-desc';

  return (
    <div className="mb-5 space-y-4">
      {/* Primary Filters Row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="flex-1 md:max-w-md">
          <Input
            type="search"
            placeholder="Search reviews..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            onClear={() => handleSearchChange('')}
            clearable={true}
            prefix={<PiMagnifyingGlassBold className="size-4" />}
            className="w-full"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Approval Status */}
          <Select
            value={
              filters.isApproved === 'all' || filters.isApproved === undefined
                ? 'all'
                : filters.isApproved === true
                ? 'true'
                : 'false'
            }
            onChange={handleApprovalChange}
            options={APPROVAL_STATUS_OPTIONS}
            getOptionDisplayValue={(option) => (
              <div className="flex items-center gap-2">
                {option.value === 'true' && <PiCheckCircle className="h-4 w-4 text-green-600" />}
                {option.value === 'false' && (
                  <PiClockClockwise className="h-4 w-4 text-yellow-600" />
                )}
                {option.label}
              </div>
            )}
            displayValue={(value) => {
              const option = APPROVAL_STATUS_OPTIONS.find((o) => o.value === value);
              return option?.label || 'Status';
            }}
            className="w-40"
          />

          {/* Rating Filter */}
          <Select
            value={filters.rating?.toString() || ''}
            onChange={handleRatingChange}
            options={RATING_OPTIONS}
            getOptionDisplayValue={(option) => (
              <div className="flex items-center gap-2">
                {option.value && <PiStarFill className="h-4 w-4 text-orange" />}
                {option.label}
              </div>
            )}
            displayValue={(value) => {
              const option = RATING_OPTIONS.find((o) => o.value === value);
              return option?.label || 'Rating';
            }}
            className="w-40"
          />

          {/* Sort */}
          <Select
            value={currentSort}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
            displayValue={(value) => {
              const option = SORT_OPTIONS.find((o) => o.value === value);
              return option?.label || 'Sort';
            }}
            className="w-44"
          />

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="relative"
          >
            <PiFunnel className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge
                size="sm"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-primary p-0 text-xs text-white"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button variant="outline" onClick={onClearFilters} color="danger">
              <PiX className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="rounded-lg border border-muted bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">Advanced Filters</h4>
            <Button
              variant="text"
              size="sm"
              onClick={() => setShowAdvanced(false)}
              className="h-auto p-1"
            >
              <PiX className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Has Replies Filter */}
            <Button
              variant="outline"
              onClick={handleToggleHasReplies}
              className={cn(
                'justify-start',
                filters.hasReplies === true && 'border-primary bg-primary-lighter text-primary',
                filters.hasReplies === false && 'border-gray-400 bg-gray-100 text-gray-700'
              )}
            >
              <PiCheckCircle className="mr-2 h-4 w-4" />
              {filters.hasReplies === true
                ? 'With Replies'
                : filters.hasReplies === false
                ? 'Without Replies'
                : 'Any Replies'}
            </Button>

            {/* Has Images Filter */}
            <Button
              variant="outline"
              onClick={handleToggleHasImages}
              className={cn(
                'justify-start',
                filters.hasImages === true && 'border-primary bg-primary-lighter text-primary',
                filters.hasImages === false && 'border-gray-400 bg-gray-100 text-gray-700'
              )}
            >
              <PiCheckCircle className="mr-2 h-4 w-4" />
              {filters.hasImages === true
                ? 'With Images'
                : filters.hasImages === false
                ? 'Without Images'
                : 'Any Images'}
            </Button>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 border-t border-muted pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Active filters:</span>
                {filters.search && (
                  <Badge variant="outline" className="gap-1">
                    Search: {filters.search}
                    <button
                      onClick={() => handleSearchChange('')}
                      className="ml-1 hover:text-gray-700"
                    >
                      <PiX className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.isApproved !== 'all' && filters.isApproved !== undefined && (
                  <Badge variant="outline" className="gap-1">
                    {filters.isApproved ? 'Approved' : 'Pending'}
                    <button
                      onClick={() => handleApprovalChange('all')}
                      className="ml-1 hover:text-gray-700"
                    >
                      <PiX className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.rating && (
                  <Badge variant="outline" className="gap-1">
                    {filters.rating} Stars
                    <button
                      onClick={() => handleRatingChange('')}
                      className="ml-1 hover:text-gray-700"
                    >
                      <PiX className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.hasReplies !== undefined && (
                  <Badge variant="outline" className="gap-1">
                    {filters.hasReplies ? 'With' : 'Without'} Replies
                    <button
                      onClick={handleToggleHasReplies}
                      className="ml-1 hover:text-gray-700"
                    >
                      <PiX className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.hasImages !== undefined && (
                  <Badge variant="outline" className="gap-1">
                    {filters.hasImages ? 'With' : 'Without'} Images
                    <button
                      onClick={handleToggleHasImages}
                      className="ml-1 hover:text-gray-700"
                    >
                      <PiX className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
