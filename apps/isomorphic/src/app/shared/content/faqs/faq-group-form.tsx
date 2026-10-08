'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActionIcon, Alert, Button, Input, Loader, Text, Textarea } from 'rizzui';
import { PiArrowDownBold, PiArrowUpBold, PiPlusBold, PiTrashBold } from 'react-icons/pi';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import { routes } from '@/config/routes';
import { describeApiError } from '@/libs/form-errors';
import { useFaqGroups } from '@/hooks/queries/useContent';
import { useCreateFaqGroup, useUpdateFaqGroup } from '@/hooks/mutations/useContentMutations';
import { FaqGroup, FaqGroupInput } from '@/types/content.types';

const faqGroupSchema = z.object({
  label: z.string().trim().min(1, 'Label is required'),
  key: z.string().trim(),
  order: z.number({ invalid_type_error: 'Order must be a whole number' }).int('Order must be a whole number'),
  items: z.array(
    z.object({
      question: z.string().trim().min(1, 'Question is required'),
      answer: z.string().trim().min(1, 'Answer is required'),
    })
  ),
});

type FaqGroupFormValues = z.infer<typeof faqGroupSchema>;

const toFormValues = (group?: FaqGroup, nextOrder = 0): FaqGroupFormValues => ({
  label: group?.label ?? '',
  key: group?.key ?? '',
  order: group?.order ?? nextOrder,
  items: group?.items.map((i) => ({ question: i.question, answer: i.answer })) ?? [{ question: '', answer: '' }],
});

const toPayload = (v: FaqGroupFormValues): FaqGroupInput => ({
  label: v.label.trim(),
  // Empty key: the backend derives it from the label on create and keeps it on update.
  ...(v.key.trim() ? { key: v.key.trim() } : {}),
  order: v.order,
  items: v.items.map((i) => ({ question: i.question.trim(), answer: i.answer.trim() })),
});

export default function FaqGroupForm({ group, nextOrder }: { group?: FaqGroup; nextOrder?: number }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const methods = useForm<FaqGroupFormValues>({
    resolver: zodResolver(faqGroupSchema),
    defaultValues: toFormValues(group, nextOrder),
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  const { fields, append, remove, move } = useFieldArray({ control, name: 'items' });

  const onSaved = () => router.push(routes.content.faqs);
  const onFailed = (error: unknown) => setFormError(describeApiError(error));
  const createMutation = useCreateFaqGroup({ onSuccess: onSaved, onError: onFailed });
  const updateMutation = useUpdateFaqGroup({ onSuccess: onSaved, onError: onFailed });

  const onSubmit = (values: FaqGroupFormValues) => {
    setFormError(null);
    const payload = toPayload(values);
    if (group) updateMutation.mutate({ id: group._id, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="@container flex max-w-[860px] flex-col gap-8">
        {formError && (
          <Alert color="danger" variant="flat">
            <Text>{formError}</Text>
          </Alert>
        )}

        <VerticalFormBlockWrapper title="Group" description="A section of the FAQ page.">
          <Input label="Label" placeholder="Shipping & delivery" {...register('label')} error={errors.label?.message} />
          <div className="grid gap-4 @lg:grid-cols-2">
            <Input
              label="Key"
              placeholder="shipping"
              helperText="Used in the page anchor (#shipping). Defaults to the label."
              {...register('key')}
            />
            <Input
              type="number"
              label="Order"
              helperText="Lower numbers come first."
              {...register('order', { valueAsNumber: true })}
              error={errors.order?.message}
            />
          </div>
        </VerticalFormBlockWrapper>

        <VerticalFormBlockWrapper title="Questions" className="border-t border-dashed border-muted pt-7">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-muted p-4">
              <div className="flex items-center justify-between">
                <Text className="font-medium">Question {index + 1}</Text>
                <div className="flex items-center gap-1">
                  <ActionIcon
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label="Move up"
                  >
                    <PiArrowUpBold className="h-4 w-4" />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="outline"
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label="Move down"
                  >
                    <PiArrowDownBold className="h-4 w-4" />
                  </ActionIcon>
                  <ActionIcon size="sm" variant="flat" color="danger" onClick={() => remove(index)} aria-label="Remove">
                    <PiTrashBold className="h-4 w-4" />
                  </ActionIcon>
                </div>
              </div>
              <Input
                label="Question"
                {...register(`items.${index}.question`)}
                error={errors.items?.[index]?.question?.message}
              />
              <Textarea
                label="Answer"
                rows={4}
                {...register(`items.${index}.answer`)}
                error={errors.items?.[index]?.answer?.message}
              />
            </div>
          ))}
          <Button type="button" variant="outline" className="w-fit" onClick={() => append({ question: '', answer: '' })}>
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add question
          </Button>
        </VerticalFormBlockWrapper>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(routes.content.faqs)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {group ? 'Save group' : 'Create group'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

/** The create page: places a new group after the existing ones. */
export function CreateFaqGroup() {
  const { data: groups, isLoading } = useFaqGroups();
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }
  const nextOrder = groups?.length ? Math.max(...groups.map((g) => g.order ?? 0)) + 1 : 0;
  return <FaqGroupForm nextOrder={nextOrder} />;
}

/** The edit page. There is no single-group endpoint, so it reads the group from the list. */
export function EditFaqGroup({ id }: { id: string }) {
  const { data: groups, isLoading, error } = useFaqGroups();
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }
  const group = groups?.find((g) => g._id === id);
  if (error || !group) {
    return (
      <Alert color="danger" variant="flat">
        <Text>Could not load this FAQ group. It may have been deleted.</Text>
      </Alert>
    );
  }
  return <FaqGroupForm group={group} />;
}
