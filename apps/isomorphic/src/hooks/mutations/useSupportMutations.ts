'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import { describeApiError } from '@/libs/form-errors';
import { PickupLocation, PickupLocationInput, Ticket, TicketStatus } from '@/types/support.types';

type Options<TData, TVariables> = Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>;

export const useUpdateTicketStatus = (options?: Options<unknown, { id: string; status: TicketStatus }>) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { id: string; status: TicketStatus }>({
    mutationFn: async ({ id, status }) => (await apiClient.patch(api.support.ticket(id), { status })).data,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['support'] });
      queryClient.invalidateQueries({ queryKey: ['staff-notifications'] });
      toast.success(`Ticket marked ${variables.status}`);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(describeApiError(error));
      options?.onError?.(error, variables, context);
    },
  });
};

/** Adds a staff note; `email: true` also sends it to the customer (and moves an open ticket to pending). */
export const useAddTicketNote = (options?: Options<Ticket, { id: string; text: string; email: boolean }>) => {
  const queryClient = useQueryClient();
  return useMutation<Ticket, Error, { id: string; text: string; email: boolean }>({
    mutationFn: async ({ id, text, email }) => {
      const response = await apiClient.post<Ticket>(api.support.ticketNotes(id), { text, email });
      if (!response.data) throw new Error('No data returned from server');
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(['support', 'ticket', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['staff-notifications'] });
      toast.success(variables.email ? 'Reply emailed to the customer' : 'Note added');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // 502: the note was not saved because the email could not be sent; the message says so.
      toast.error(describeApiError(error));
      options?.onError?.(error, variables, context);
    },
  });
};

function usePickupMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  successMessage: string,
  options?: Options<TData, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['pickup-locations'] });
      toast.success(successMessage);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(describeApiError(error));
      options?.onError?.(error, variables, context);
    },
  });
}

export const useCreatePickupLocation = (options?: Options<PickupLocation, PickupLocationInput>) =>
  usePickupMutation(
    async (data) => {
      const response = await apiClient.post<PickupLocation>(api.pickupLocations.list, data);
      if (!response.data) throw new Error('No data returned from server');
      return response.data;
    },
    'Pickup location created',
    options
  );

export const useUpdatePickupLocation = (
  options?: Options<PickupLocation, { id: string; data: Partial<PickupLocationInput> }>
) =>
  usePickupMutation(
    async ({ id, data }) => {
      const response = await apiClient.patch<PickupLocation>(api.pickupLocations.byId(id), data);
      if (!response.data) throw new Error('No data returned from server');
      return response.data;
    },
    'Pickup location saved',
    options
  );

export const useDeletePickupLocation = (options?: Options<void, string>) =>
  usePickupMutation(
    async (id) => {
      await apiClient.delete(api.pickupLocations.byId(id));
    },
    'Pickup location deleted',
    options
  );
