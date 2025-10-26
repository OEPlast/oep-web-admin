import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import { CouponDataType } from '@/data/coupon-data';

export type CouponListParams = {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  couponType?: 'one-off' | 'one-off-user' | 'one-off-for-one-person' | 'normal';
  startDate?: string;
  endDate?: string;
  sort?: string;
};

export type CouponListResponse = {
  items: CouponDataType[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CouponListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Hook to fetch all coupons with pagination and filters
export function useCoupons(
  params?: CouponListParams,
  options?: Omit<
    UseQueryOptions<CouponListResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.active !== undefined)
    queryParams.append('active', params.active.toString());
  if (params?.couponType) queryParams.append('couponType', params.couponType);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.sort) queryParams.append('sort', params.sort);

  const url = `${api.coupons.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useQuery<CouponListResponse, Error>({
    queryKey: ['coupons', params],
    queryFn: async () => {
      const response = await apiClient.getWithMeta<
        { items: CouponDataType[] },
        CouponListMeta
      >(url);

      return {
        items: response.data?.items || [],
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 10,
        total: response.meta?.total || 0,
        totalPages: response.meta?.totalPages || 1,
      };
    },
    ...options,
  });
}

// Hook to fetch a single coupon by ID
export function useCoupon(
  id: string,
  options?: Omit<UseQueryOptions<CouponDataType, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CouponDataType, Error>({
    queryKey: ['coupon', id],
    queryFn: async () => {
      const response = await apiClient.get<CouponDataType>(
        api.coupons.byId(id)
      );

      if (!response.data) {
        throw new Error('Coupon not found');
      }

      return response.data;
    },
    enabled: !!id,
    ...options,
  });
}
