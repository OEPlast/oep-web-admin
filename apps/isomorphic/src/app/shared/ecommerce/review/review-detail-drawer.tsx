/**
 * Review Detail Drawer Component
 * Displays full review details in a slide-over panel
 */

'use client';

import { useDrawer } from '@/app/shared/drawer-views/use-drawer';
import { useReviewById } from '@/hooks/queries/useReviews';
import {
  useModerateReview,
  useDeleteReview,
  useAddReply,
} from '@/hooks/mutations/useReviewMutations';
import { Avatar, Badge, Button, Text, Title, Loader, Textarea } from 'rizzui';
import {
  PiStarFill,
  PiX,
  PiTrash,
  PiCheckCircle,
  PiXCircle,
} from 'react-icons/pi';
import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import cn from '@core/utils/class-names';
import type { ReviewUser, ReviewProduct } from '@/types/review.types';
import { getCdnUrl } from '@core/utils/cdn-url';

dayjs.extend(relativeTime);

// Type guards
const isReviewUser = (user: string | ReviewUser): user is ReviewUser => {
  return typeof user === 'object' && user !== null && '_id' in user;
};

const isReviewProduct = (
  product: string | ReviewProduct
): product is ReviewProduct => {
  return typeof product === 'object' && product !== null && '_id' in product;
};

interface ReviewDetailDrawerProps {
  reviewId: string;
}

export default function ReviewDetailDrawer({
  reviewId,
}: ReviewDetailDrawerProps) {
  const { closeDrawer } = useDrawer();
  const { data: review, isLoading } = useReviewById(reviewId);
  const moderateMutation = useModerateReview();
  const deleteMutation = useDeleteReview();
  const addReplyMutation = useAddReply();

  const [replyText, setReplyText] = useState('');
  const [moderationNote, setModerationNote] = useState('');
  const [showModeration, setShowModeration] = useState(false);

  const handleApprove = () => {
    moderateMutation.mutate(
      {
        id: reviewId,
        data: {
          action: 'approve',
          moderationNote: moderationNote || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowModeration(false);
          setModerationNote('');
        },
      }
    );
  };

  const handleReject = () => {
    moderateMutation.mutate(
      {
        id: reviewId,
        data: {
          action: 'reject',
          moderationNote: moderationNote || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowModeration(false);
          setModerationNote('');
        },
      }
    );
  };

  const handleDelete = () => {
    if (
      confirm(
        'Are you sure you want to delete this review? This action cannot be undone.'
      )
    ) {
      deleteMutation.mutate(reviewId, {
        onSuccess: () => {
          closeDrawer();
        },
      });
    }
  };

  const handleAddReply = () => {
    if (!replyText.trim()) return;

    addReplyMutation.mutate(
      {
        reviewId,
        data: { reply: replyText },
      },
      {
        onSuccess: () => {
          setReplyText('');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex h-full items-center justify-center">
        <Text className="text-gray-500">Review not found</Text>
      </div>
    );
  }

  // Reviews go live on submit; `isApproved: false` means an admin took it down.
  // Labelling that "Pending" read as though it were awaiting approval.
  const statusColor = review.isApproved ? 'success' : 'danger';
  const statusText = review.isApproved ? 'Live' : 'Removed';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-muted p-6">
        <div>
          <Title as="h3" className="text-lg font-semibold">
            Review Details
          </Title>
          <Text className="text-xs text-gray-400">Review ID: {review._id}</Text>
        </div>
        <Button
          variant="text"
          onClick={closeDrawer}
          className="h-auto p-1 hover:bg-gray-100"
        >
          <PiX className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-8 overflow-y-auto p-6">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <Badge color={statusColor} className="px-3 py-1 text-sm capitalize">
            {statusText}
          </Badge>
          {review.moderatedBy && isReviewUser(review.moderatedBy) && (
            <Text className="text-xs text-gray-500">
              Moderated by {review.moderatedBy.name || 'Admin'}{' '}
              {review.moderatedAt && dayjs(review.moderatedAt).fromNow()}
            </Text>
          )}
        </div>

        {/* Customer & Product Info */}
        <div className="border-line grid grid-cols-1 gap-6 rounded-lg border bg-gray-50 p-4 md:grid-cols-2">
          {/* Customer */}
          <div>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Customer
            </Text>
            {isReviewUser(review.reviewBy) ? (
              <div className="flex items-center gap-3">
                <Avatar
                  name={review.reviewBy.name || review.reviewBy.email}
                  src={getCdnUrl(review.reviewBy.image)}
                  size="lg"
                />
                <div>
                  <Title as="h6" className="text-sm font-medium">
                    {review.reviewBy.firstName + ' ' + review.reviewBy.lastName}
                  </Title>
                  <Text className="text-xs text-gray-500">
                    {review.reviewBy.email}
                  </Text>
                </div>
              </div>
            ) : (
              <Text className="text-xs text-gray-500">
                User ID: {review.reviewBy}
              </Text>
            )}
          </div>
          {/* Product */}
          <div>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Product
            </Text>
            {isReviewProduct(review.product) ? (
              <div className="flex items-center gap-3">
                
                <img
                  alt={review.product.name}
                  src={getCdnUrl(review.product.description_images.find(img => img.cover_image)?.url || '')}
                  className="rounded-lg h-10 w-10 object-cover"
                />
                <div>
                  <Title as="h6" className="text-sm font-medium">
                    {review.product.name}
                  </Title>
                </div>
              </div>
            ) : (
              <Text className="text-xs text-gray-500">
                Product ID: {review.product}
              </Text>
            )}
          </div>
        </div>

        {/* Rating */}
        <div>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Rating
          </Text>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <PiStarFill
                key={i}
                className={cn(
                  'h-5 w-5',
                  i < review.rating
                    ? 'fill-orange text-orange'
                    : 'fill-gray-300 text-gray-300'
                )}
              />
            ))}
            <Text className="ml-2 text-sm font-medium">{review.rating}/5</Text>
          </div>
        </div>

        {/* Review Title & Text */}
        <div>
          {review.title && (
            <Title as="h5" className="mb-2 text-lg font-bold text-gray-800">
              {review.title}
            </Title>
          )}
          <blockquote className="rounded-md border-l-4 border-primary bg-primary-lighter/10 p-4 text-gray-700">
            {review.review}
          </blockquote>
        </div>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Images
            </Text>
            <div className="grid grid-cols-3 gap-2">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="h-24 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Additional Details */}
        {(review.size || review.style?.color || review.fit) && (
          <div className="border-line rounded-lg border bg-gray-50 p-4">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Additional Details
            </Text>
            <div className="space-y-2">
              {review.size && (
                <div className="flex items-center justify-between">
                  <Text className="text-xs text-gray-600">Size:</Text>
                  <Text className="text-xs font-medium">{review.size}</Text>
                </div>
              )}
              {review.style?.color && (
                <div className="flex items-center justify-between">
                  <Text className="text-xs text-gray-600">Color:</Text>
                  <Text className="text-xs font-medium">
                    {review.style.color}
                  </Text>
                </div>
              )}
              {review.fit && (
                <div className="flex items-center justify-between">
                  <Text className="text-xs text-gray-600">Fit:</Text>
                  <Text className="text-xs font-medium capitalize">
                    {review.fit}
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Engagement */}
        <div className="border-line rounded-lg border bg-gray-50 p-4">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Engagement
          </Text>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold">
                {review.helpfulVotes?.helpful?.length || 0}
              </span>
              <span className="text-xs text-gray-500">Helpful</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold">
                {review.helpfulVotes?.notHelpful?.length || 0}
              </span>
              <span className="text-xs text-gray-500">Not Helpful</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold">
                {review.likes?.length || 0}
              </span>
              <span className="text-xs text-gray-500">Likes</span>
            </div>
          </div>
        </div>

        {/* Moderation Note */}
        {review.moderationNote && (
          <div className="border-warning bg-warning-lighter rounded-lg border p-4">
            <Text className="text-warning-dark mb-2 text-xs font-semibold">
              Moderation Note
            </Text>
            <Text className="text-xs text-gray-700">
              {review.moderationNote}
            </Text>
          </div>
        )}

        {/* Moderation Section.
            Reviews publish immediately (post-moderation) — moderation is how an
            admin takes a live review DOWN, so this must be reachable for live
            reviews. Gating it on `!review.isApproved` made it reachable only for
            reviews that were already removed, i.e. never. */}
        <div>
          <Button
            variant="outline"
            onClick={() => setShowModeration(!showModeration)}
            className="w-full"
          >
            {showModeration ? 'Hide Moderation' : 'Moderate Review'}
          </Button>
          {showModeration && (
            <div className="mt-4 space-y-3 rounded-lg border border-muted p-4">
              <Textarea
                label="Moderation Note (optional)"
                placeholder="Add a note about this moderation decision..."
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                rows={3}
              />
              {review.isApproved ? (
                <Button
                  onClick={handleReject}
                  isLoading={moderateMutation.isPending}
                  color="danger"
                  className="w-full"
                >
                  <PiXCircle className="mr-2 h-4 w-4" />
                  Remove from storefront
                </Button>
              ) : (
                <Button
                  onClick={handleApprove}
                  isLoading={moderateMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <PiCheckCircle className="mr-2 h-4 w-4" />
                  Restore to storefront
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="border-line rounded-lg border bg-gray-50 p-4">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Timeline
          </Text>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text className="text-xs text-gray-600">Created:</Text>
              <Text className="text-xs font-medium">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </div>
            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <div className="flex items-center justify-between">
                <Text className="text-xs text-gray-600">Updated:</Text>
                <Text className="text-xs font-medium">
                  {new Date(review.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-muted p-6">
        <div className="flex gap-3">
          <Button onClick={closeDrawer} variant="outline" className="flex-1">
            Close
          </Button>
          <Button
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
            color="danger"
            variant="outline"
            className="flex-1 hover:bg-red hover:text-white"
          >
            <PiTrash className="mr-2 h-4 w-4" />
            Delete Review
          </Button>
        </div>
      </div>
    </div>
  );
}
