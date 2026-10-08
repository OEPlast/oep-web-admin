'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActionIcon, Alert, Button, Input, Loader, Text, Textarea } from 'rizzui';
import { PiPlusBold, PiTrashBold } from 'react-icons/pi';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import SizeChartGrid from '@/app/shared/content/size-charts/size-chart-grid';
import { routes } from '@/config/routes';
import { describeApiError } from '@/libs/form-errors';
import { useSizeChart } from '@/hooks/queries/useContent';
import { useCreateSizeChart, useUpdateSizeChart } from '@/hooks/mutations/useContentMutations';
import { SizeChart, SizeChartInput } from '@/types/content.types';

const sizeChartSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z.string().trim(),
  grid: z
    .object({ columns: z.array(z.string()), rows: z.array(z.array(z.string())) })
    .refine((g) => g.columns.length >= 1 && g.columns.length <= 12, 'A chart needs 1 to 12 columns')
    .refine((g) => g.columns.every((c) => c.trim()), 'Every column needs a heading')
    .refine((g) => g.rows.length <= 100, 'A chart can have at most 100 rows')
    .refine((g) => g.rows.every((r) => r.length === g.columns.length), 'Every row needs one value per column'),
  howToMeasure: z.array(
    z.object({
      label: z.string().trim().min(1, 'Label is required'),
      text: z.string().trim().min(1, 'Instructions are required'),
    })
  ),
  fitNote: z.string(),
});

type SizeChartFormValues = z.infer<typeof sizeChartSchema>;

const toFormValues = (chart?: SizeChart): SizeChartFormValues => ({
  title: chart?.title ?? '',
  slug: chart?.slug ?? '',
  grid: chart
    ? { columns: [...chart.columns], rows: chart.rows.map((r) => [...r]) }
    : { columns: ['Size'], rows: [] },
  howToMeasure: chart?.howToMeasure.map((h) => ({ label: h.label, text: h.text })) ?? [],
  fitNote: chart?.fitNote ?? '',
});

const toPayload = (v: SizeChartFormValues): SizeChartInput => ({
  title: v.title.trim(),
  // Empty slug: derived from the title on create, unchanged on update.
  ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
  columns: v.grid.columns.map((c) => c.trim()),
  rows: v.grid.rows.map((r) => r.map((cell) => cell.trim())),
  howToMeasure: v.howToMeasure.map((h) => ({ label: h.label.trim(), text: h.text.trim() })),
  fitNote: v.fitNote.trim(),
});

export default function SizeChartForm({ chart }: { chart?: SizeChart }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const methods = useForm<SizeChartFormValues>({
    resolver: zodResolver(sizeChartSchema),
    defaultValues: toFormValues(chart),
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'howToMeasure' });

  const onSaved = () => router.push(routes.content.sizeCharts);
  const onFailed = (error: unknown) => setFormError(describeApiError(error));
  const createMutation = useCreateSizeChart({ onSuccess: onSaved, onError: onFailed });
  const updateMutation = useUpdateSizeChart({ onSuccess: onSaved, onError: onFailed });

  const onSubmit = (values: SizeChartFormValues) => {
    setFormError(null);
    const payload = toPayload(values);
    if (chart) updateMutation.mutate({ id: chart._id, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="@container flex flex-col gap-8">
        {formError && (
          <Alert color="danger" variant="flat">
            <Text>{formError}</Text>
          </Alert>
        )}

        <VerticalFormBlockWrapper title="Size chart" description="Products and categories pick a chart by its slug.">
          <div className="grid gap-4 @lg:grid-cols-2">
            <Input label="Title" placeholder="Ring sizes" {...register('title')} error={errors.title?.message} />
            <Input
              label="Slug"
              placeholder="ring-sizes"
              helperText={chart ? 'Changing it unlinks products and categories that use the old slug.' : 'Defaults to the title.'}
              {...register('slug')}
            />
          </div>
        </VerticalFormBlockWrapper>

        <VerticalFormBlockWrapper title="Sizes" className="max-w-none border-t border-dashed border-muted pt-7">
          <Controller
            control={control}
            name="grid"
            render={({ field }) => (
              <SizeChartGrid value={field.value} onChange={field.onChange} error={errors.grid?.message ?? errors.grid?.root?.message} />
            )}
          />
        </VerticalFormBlockWrapper>

        <VerticalFormBlockWrapper
          title="How to measure"
          description="Optional steps shown under the chart."
          className="border-t border-dashed border-muted pt-7"
        >
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <Input
                className="w-48 shrink-0"
                label={index === 0 ? 'Label' : undefined}
                placeholder="Measure a ring"
                {...register(`howToMeasure.${index}.label`)}
                error={errors.howToMeasure?.[index]?.label?.message}
              />
              <Textarea
                className="flex-grow"
                label={index === 0 ? 'Instructions' : undefined}
                rows={2}
                {...register(`howToMeasure.${index}.text`)}
                error={errors.howToMeasure?.[index]?.text?.message}
              />
              <ActionIcon
                size="sm"
                variant="flat"
                color="danger"
                className={index === 0 ? 'mt-8' : 'mt-2'}
                onClick={() => remove(index)}
                aria-label="Remove step"
              >
                <PiTrashBold className="h-4 w-4" />
              </ActionIcon>
            </div>
          ))}
          <Button type="button" variant="outline" className="w-fit" onClick={() => append({ label: '', text: '' })}>
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add step
          </Button>
        </VerticalFormBlockWrapper>

        <VerticalFormBlockWrapper title="Fit note" className="border-t border-dashed border-muted pt-7">
          <Textarea
            rows={3}
            placeholder="Between sizes? Choose the larger one; wide bands fit snugger."
            {...register('fitNote')}
          />
        </VerticalFormBlockWrapper>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(routes.content.sizeCharts)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {chart ? 'Save size chart' : 'Create size chart'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

/** The edit page: loads the chart, then shows the form. */
export function EditSizeChart({ id }: { id: string }) {
  const { data, isLoading, error } = useSizeChart(id);
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <Alert color="danger" variant="flat">
        <Text>Could not load this size chart. It may have been deleted.</Text>
      </Alert>
    );
  }
  return <SizeChartForm chart={data} />;
}
