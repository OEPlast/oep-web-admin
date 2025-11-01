// Sales client - now using React Query hooks for real API calls
// This file kept for type compatibility - use hooks for actual data fetching

export type Sale = {
  _id: string;
  title: string;
  type: string;
  status: string;
  // Add other Sale properties as needed
};

// This function is deprecated - use useSales hook instead
export async function getAllSales() {
  throw new Error('getAllSales is deprecated - use useSales hook instead');
}
