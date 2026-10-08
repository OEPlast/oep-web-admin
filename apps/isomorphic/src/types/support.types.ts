// Support inbox, back-in-stock alerts and pickup locations (Main-server routes/admin/support.ts).

export type TicketStatus = 'open' | 'pending' | 'closed';
export type TicketTopic = 'order' | 'returns' | 'product' | 'sizing' | 'other';

export const TICKET_STATUS_OPTIONS: Array<{ value: TicketStatus; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending (waiting on customer)' },
  { value: 'closed', label: 'Closed' },
];

export const TICKET_STATUS_COLOR: Record<TicketStatus, 'warning' | 'info' | 'secondary'> = {
  open: 'warning',
  pending: 'info',
  closed: 'secondary',
};

export const TICKET_TOPIC_LABEL: Record<TicketTopic, string> = {
  order: 'Order',
  returns: 'Returns',
  product: 'Product',
  sizing: 'Sizing',
  other: 'General',
};

/** List rows (the list endpoint leaves out notes; `order` is an unpopulated id there). */
export interface TicketSummary {
  _id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone?: string;
  orderNumber?: string;
  order?: string;
  topic: TicketTopic;
  message: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketNote {
  _id: string;
  by?: { _id: string; firstName?: string; lastName?: string } | null;
  text: string;
  emailed: boolean;
  at: string;
}

export interface Ticket extends Omit<TicketSummary, 'order'> {
  order?: { _id: string; orderNumber?: string; status: string; total: number; createdAt: string } | null;
  notes: TicketNote[];
}

export interface TicketListFilters {
  status?: TicketStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TicketListMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  /** Open tickets across the whole inbox, whatever the filter. */
  open: number;
}

export interface StockAlertSummaryRow {
  productId: string;
  waiting: number;
  notified: number;
  lastRequestedAt: string;
  lastNotifiedAt?: string | null;
  /** Empty when the product has since been deleted. */
  product: { name?: string; slug?: string; stock?: number; sku?: number };
}

export interface StockAlert {
  _id: string;
  email: string;
  attribute?: { name: string; value: string };
  createdAt: string;
  notifiedAt?: string;
  /** true while waiting; removed once the email has gone out. */
  pending?: boolean;
}

export interface PickupLocation {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  hours?: string;
  readyIn?: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PickupLocationInput {
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  hours?: string;
  readyIn?: string;
  active?: boolean;
  order?: number;
}
