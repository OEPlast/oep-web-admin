'use client';

import ShipmentPageHeader from './shipment-list/shipment-page-header';
import ShipmentsTable from './shipment-list/table';

export default function ShipmentsClient() {
  return (
    <div className="@container">
      <ShipmentPageHeader />
      <ShipmentsTable />
    </div>
  );
}
