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
import { PiStarFill, PiX, PiTrash, PiCheckCircle, PiXCircle } from 'react-icons/pi';
import { useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import cn from '@core/utils/class-names';
import type { ReviewUser, ReviewProduct } from '@/types/review.types';

dayjs.extend(relativeTime);

// Type guards
const isReviewUser = (user: string | ReviewUser): user is ReviewUser => {
  return typeof user === 'object' && user !== null && '_id' in user;
};

const isReviewProduct = (product: string | ReviewProduct): product is ReviewProduct => {
  return typeof product === 'object' && product !== null && '_id' in product;
};

interface ReviewDetailDrawerProps {
  reviewId: string;
}

export default function ReviewDetailDrawer({ reviewId }: ReviewDetailDrawerProps) {
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
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
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

  const statusColor = review.isApproved ? 'success' : 'warning';
  const statusText = review.isApproved ? 'Approved' : 'Pending';

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-muted p-6">
        <div>
          <Title as="h3" className="text-lg font-semibold">
            Review Details
          </Title>
          <Text className="text-sm text-gray-500">Review ID: {review._id}</Text>
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
      <div className="flex-1 overflow-y-auto p-6">
        {/* Status Badge */}
        <div className="mb-6 flex items-center gap-3">
          <Badge color={statusColor} className="capitalize">
            {statusText}
          </Badge>
          {review.moderatedBy && isReviewUser(review.moderatedBy) && (
            <Text className="text-sm text-gray-500">
              Moderated by {review.moderatedBy.name || 'Admin'}{' '}
              {review.moderatedAt && dayjs(review.moderatedAt).fromNow()}
            </Text>
          )}
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-700">Customer</Text>
          {isReviewUser(review.reviewBy) ? (
            <div className="flex items-center gap-3">
              <Avatar
                name={review.reviewBy.name || review.reviewBy.email}
                src={review.reviewBy.image}
                size="lg"
              />
              <div>
                <Title as="h6" className="text-sm font-medium">
                  {review.reviewBy.name || 'Unknown User'}
                </Title>
                <Text className="text-sm text-gray-500">{review.reviewBy.email}</Text>
              </div>
            </div>
          ) : (
            <Text className="text-sm text-gray-500">User ID: {review.reviewBy}</Text>
          )}
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-700">Product</Text>
          {isReviewProduct(review.product) ? (
            <div className="flex items-center gap-3">
              <Avatar
                name={review.product.name}
                src={review.product.image}
                size="lg"
                className="rounded-lg"
              />
              <div>
                <Title as="h6" className="text-sm font-medium">
                  {review.product.name}
                </Title>
                <Text className="text-sm text-gray-500">SKU: {review.product.sku}</Text>
              </div>
            </div>
          ) : (
            <Text className="text-sm text-gray-500">Product ID: {review.product}</Text>
          )}
        </div>

        {/* Rating */}
        <div className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-700">Rating</Text>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <PiStarFill
                key={i}
                className={cn(
                  'h-5 w-5',
                  i < review.rating ? 'fill-orange text-orange' : 'fill-gray-300 text-gray-300'
                )}
              />
            ))}
            <Text className="ml-2 text-sm font-medium">{review.rating}/5</Text>
          </div>
        </div>

        {/* Review Title */}
        {review.title && (
          <div className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Title</Text>
            <Title as="h5" className="text-base font-semibold">
              {review.title}
            </Title>
          </div>
        )}

        {/* Review Text */}
        <div className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-700">Review</Text>
          <Text className="leading-relaxed text-gray-600">{review.review}</Text>
        </div>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-700">Images</Text>
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
          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <Text className="mb-3 text-sm font-medium text-gray-700">Additional Details</Text>
            <div className="space-y-2">
              {review.size && (
                <div className="flex items-center justify-between">
                  <Text className="text-sm text-gray-600">Size:</Text>
                  <Text className="text-sm font-medium">{review.size}</Text>
                </div>
              )}
              {review.style?.color && (
                <div className="flex items-center justify-between">
                  <Text className="text-sm text-gray-600">Color:</Text>
                  <Text className="text-sm font-medium">{review.style.color}</Text>
                </div>
              )}
              {review.fit && (
                <div className="flex items-center justify-between">
                  <Text className="text-sm text-gray-600">Fit:</Text>
                  <Text className="text-sm font-medium capitalize">{review.fit}</Text>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Helpfulness Stats */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <Text className="mb-3 text-sm font-medium text-gray-700">Engagement</Text>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text className="text-sm text-gray-600">Helpful votes:</Text>
              <Text className="text-sm font-medium">
                {review.helpfulVotes?.helpful?.length || 0}
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-sm text-gray-600">Not helpful votes:</Text>
              <Text className="text-sm font-medium">
                {review.helpfulVotes?.notHelpful?.length || 0}
              </Text>
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-sm text-gray-600">Likes:</Text>
              <Text className="text-sm font-medium">{review.likes?.length || 0}</Text>
            </div>
          </div>
        </div>

        {/* Moderation Note */}
        {review.moderationNote && (
          <div className="mb-6 rounded-lg border border-warning bg-warning-lighter p-4">
            <Text className="mb-2 text-sm font-medium text-warning-dark">Moderation Note</Text>
            <Text className="text-sm text-gray-700">{review.moderationNote}</Text>
          </div>
        )}

        {/* Moderation Section */}
        {!review.isApproved && (
          <div className="mb-6">
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
                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    isLoading={moderateMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <PiCheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={handleReject}
                    isLoading={moderateMutation.isPending}
                    color="danger"
                    className="flex-1"
                  >
                    <PiXCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Replies Section */}
        <div className="mb-6">
          <Text className="mb-3 text-sm font-medium text-gray-700">
            Admin Replies ({review.replies?.length || 0})
          </Text>

          {/* Existing Replies */}
          {review.replies && review.replies.length > 0 ? (
            <div className="mb-4 space-y-3">
              {review.replies.map((reply) => {
                const replyByUser = isReviewUser(reply.replyBy) ? reply.replyBy : null;
                return (
                  <div key={reply._id} className="rounded-lg border border-muted bg-gray-50 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={replyByUser?.name || replyByUser?.email || 'Admin'}
                          src={replyByUser?.image}
                          size="sm"
                        />
                        <div>
                          <Text className="text-sm font-medium">
                            {replyByUser?.name || 'Admin'}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {dayjs(reply.createdAt).fromNow()}
                          </Text>
                        </div>
                      </div>
                    </div>
                    <Text className="text-sm text-gray-700">{reply.reply}</Text>
                  </div>
                );
              })}
            </div>
          ) : (
            <Text className="mb-4 text-sm text-gray-500">No replies yet</Text>
          )}

          {/* Add Reply Form */}
          <div className="space-y-3">
            <Textarea
              placeholder="Write a reply to this review..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleAddReply}
              isLoading={addReplyMutation.isPending}
              disabled={!replyText.trim()}
              className="w-full"
            >
              Add Reply
            </Button>
          </div>
        </div>

        {/* Timestamps */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <Text className="mb-3 text-sm font-medium text-gray-700">Timeline</Text>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text className="text-sm text-gray-600">Created:</Text>
              <Text className="text-sm font-medium">
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
                <Text className="text-sm text-gray-600">Updated:</Text>
                <Text className="text-sm font-medium">
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
            className="flex-1"
          >
            <PiTrash className="mr-2 h-4 w-4" />
            Delete Review
          </Button>
        </div>
      </div>
    </div>
  );
}
