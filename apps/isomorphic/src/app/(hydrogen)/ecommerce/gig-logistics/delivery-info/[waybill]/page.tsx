import DeliveryInfoClient from './delivery-info-client';

export const metadata = {
  title: 'GIG Delivery Info',
};

export default function GIGDeliveryInfoPage({ params }: { params: { waybill: string } }) {
  return <DeliveryInfoClient waybill={params.waybill} />;
}
