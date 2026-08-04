import DeliveryInfoClient from './delivery-info-client';

export const metadata = {
  title: 'GIG Delivery Info',
};

export default async function GIGDeliveryInfoPage({
  params,
}: {
  params: Promise<{ waybill: string }>;
}) {
  const { waybill } = await params;
  return <DeliveryInfoClient waybill={waybill} />;
}
