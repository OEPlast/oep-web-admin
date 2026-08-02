'use client';

import { Alert, Loader, Text } from 'rizzui';
import { useIntent } from '@/hooks/queries/useIntents';
import IntentForm from '@/app/shared/marketing/intent/intent-form';

export default function EditIntentClient({ id }: { id: string }) {
  const { data: intent, isLoading, error } = useIntent(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !intent) {
    return (
      <Alert color="danger" variant="flat">
        <Text>Could not load this intent shop. It may have been deleted.</Text>
      </Alert>
    );
  }

  return <IntentForm intent={intent} />;
}
