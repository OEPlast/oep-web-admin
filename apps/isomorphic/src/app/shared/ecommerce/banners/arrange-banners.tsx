'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Loader, Text, Title, ActionIcon, cn } from 'rizzui';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PiDotsSixVerticalBold, PiXBold } from 'react-icons/pi';
import { getCdnUrl } from '@core/utils/cdn-url';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import { useBanners } from '@/hooks/queries/useBanners';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { BannerType } from './banner-types';

/**
 * Drag banners into one order and save it. The order is shared by every category: on the
 * storefront each category shows its banners in this order (an A above another A comes first,
 * whatever B or C banners sit between them).
 */
export default function ArrangeBanners() {
  const { closeModal } = useModal();
  const queryClient = useQueryClient();
  const { data, isLoading } = useBanners({ page: 1, limit: 100 });
  const [order, setOrder] = useState<BannerType[]>([]);
  useEffect(() => {
    if (data?.items) setOrder(data.items);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const from = prev.findIndex((b) => b._id === active.id);
      const to = prev.findIndex((b) => b._id === over.id);
      return from === -1 || to === -1 ? prev : arrayMove(prev, from, to);
    });
  }, []);

  const save = useMutation({
    mutationFn: async (ids: string[]) => apiClient.post(api.banners.reorder, { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner order saved');
      closeModal();
    },
    onError: (error) => toast.error(handleApiError(error)),
  });

  const changed = JSON.stringify(order.map((b) => b._id)) !== JSON.stringify((data?.items ?? []).map((b) => b._id));
  // Each banner's place within its own category, as the storefront will show it.
  const rankInCategory = (index: number) => order.slice(0, index + 1).filter((b) => b.category === order[index]!.category).length;

  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-2 flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Arrange banners
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <Text className="mb-5 text-sm text-gray-500">
        Drag to set the order. Each category shows its banners in this order on the store, so an A above another A comes
        first, whatever sits between them.
      </Text>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : order.length === 0 ? (
        <Text className="py-10 text-center text-gray-500">No banners yet.</Text>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis, restrictToParentElement]} onDragEnd={handleDragEnd}>
          <SortableContext items={order.map((b) => b._id)} strategy={verticalListSortingStrategy}>
            <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
              {order.map((banner, index) => (
                <SortableBannerRow key={banner._id} banner={banner} rank={rankInCategory(index)} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => closeModal()}>
          Cancel
        </Button>
        <Button disabled={!changed} isLoading={save.isPending} onClick={() => save.mutate(order.map((b) => b._id))}>
          Save order
        </Button>
      </div>
    </div>
  );
}

function SortableBannerRow({ banner, rank }: { banner: BannerType; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: banner._id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-3 rounded-lg border border-muted bg-gray-0 p-3', isDragging && 'z-10 shadow-lg')}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-gray-400 hover:text-gray-700 active:cursor-grabbing"
        aria-label={`Move ${banner.name}`}
        {...attributes}
        {...listeners}
      >
        <PiDotsSixVerticalBold className="h-5 w-5" />
      </button>
      <Image
        src={getCdnUrl(banner.imageUrl) || '/placeholder.png'}
        alt=""
        width={64}
        height={40}
        className="h-10 w-16 flex-shrink-0 rounded-md border border-muted object-cover"
      />
      <div className="min-w-0 flex-1">
        <Text className="truncate font-medium">{banner.name}</Text>
        <Text className="truncate text-xs text-gray-500">{banner.pageLink}</Text>
      </div>
      <Badge variant="flat" className="flex-shrink-0">
        {banner.category} · #{rank}
      </Badge>
      <Badge variant="flat" color={banner.active ? 'success' : 'secondary'} className="flex-shrink-0">
        {banner.active ? 'Active' : 'Off'}
      </Badge>
    </li>
  );
}
