import Link from 'next/link';
import { Metadata } from 'next';
import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';
import EditCampaignClient from './EditCampaignClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return metaObject(`Edit Campaign ${id}`);
}

export default async function EditCampaignPage({ params }: Props) {
  const { id } = await params;

  return <EditCampaignClient id={id} />;
}
