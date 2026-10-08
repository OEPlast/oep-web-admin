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
import { useLegalDocument } from '@/hooks/queries/useContent';
import { useCreateLegalDocument, useUpdateLegalDocument } from '@/hooks/mutations/useContentMutations';
import { LegalDocument, LegalDocumentInput, SUGGESTED_LEGAL_SLUGS, toSlug } from '@/types/content.types';

const legalSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z.string().trim(),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  intro: z.string(),
  sections: z.array(
    z.object({
      // Anchor id; derived from the heading when left empty.
      id: z.string().trim(),
      heading: z.string().trim().min(1, 'Heading is required'),
      body: z.string().trim().min(1, 'Body is required'),
    })
  ),
});

type LegalFormValues = z.infer<typeof legalSchema>;

const toFormValues = (doc?: LegalDocument): LegalFormValues => ({
  title: doc?.title ?? '',
  slug: doc?.slug ?? '',
  // Stored as a UTC midnight date; show that calendar day.
  effectiveDate: doc?.effectiveDate ? new Date(doc.effectiveDate).toISOString().slice(0, 10) : '',
  intro: doc?.intro ?? '',
  sections: doc?.sections.map((s) => ({ id: s.id, heading: s.heading, body: s.body })) ?? [],
});

function toPayload(v: LegalFormValues): LegalDocumentInput {
  const used = new Set<string>();
  const sections = v.sections.map((s) => {
    const base = s.id.trim() || toSlug(s.heading) || 'section';
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return { id, heading: s.heading.trim(), body: s.body.trim() };
  });
  return {
    title: v.title.trim(),
    // Empty slug: derived from the title on create, unchanged on update.
    ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
    effectiveDate: v.effectiveDate,
    intro: v.intro.trim(),
    sections,
  };
}

export default function LegalForm({ doc }: { doc?: LegalDocument }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const methods = useForm<LegalFormValues>({
    resolver: zodResolver(legalSchema),
    defaultValues: toFormValues(doc),
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;
  const { fields, append, remove, move } = useFieldArray({ control, name: 'sections' });
  const sections = watch('sections');

  const onSaved = () => router.push(routes.content.legal);
  const onFailed = (error: unknown) => setFormError(describeApiError(error));
  const createMutation = useCreateLegalDocument({ onSuccess: onSaved, onError: onFailed });
  const updateMutation = useUpdateLegalDocument({ onSuccess: onSaved, onError: onFailed });

  const onSubmit = (values: LegalFormValues) => {
    setFormError(null);
    const payload = toPayload(values);
    if (doc) updateMutation.mutate({ id: doc._id, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="@container flex max-w-[900px] flex-col gap-8">
        {formError && (
          <Alert color="danger" variant="flat">
            <Text>{formError}</Text>
          </Alert>
        )}

        <VerticalFormBlockWrapper title="Page">
          <Input label="Title" placeholder="Privacy policy" {...register('title')} error={errors.title?.message} />
          <div className="grid gap-4 @lg:grid-cols-2">
            <div>
              <Input
                label="Slug"
                placeholder="privacy-policy"
                list="legal-slug-suggestions"
                helperText={`The storefront links to ${SUGGESTED_LEGAL_SLUGS.join(', ')}.`}
                {...register('slug')}
              />
              <datalist id="legal-slug-suggestions">
                {SUGGESTED_LEGAL_SLUGS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <Input
              type="date"
              label="Effective date"
              {...register('effectiveDate')}
              error={errors.effectiveDate?.message}
            />
          </div>
          <Textarea label="Introduction" rows={4} {...register('intro')} />
        </VerticalFormBlockWrapper>

        <VerticalFormBlockWrapper
          title="Sections"
          description="Each section gets an anchor so it can be linked (#cookies). The anchor defaults to the heading."
          className="border-t border-dashed border-muted pt-7"
        >
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-muted p-4">
              <div className="flex items-center justify-between">
                <Text className="font-medium">Section {index + 1}</Text>
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
              <div className="grid gap-3 @lg:grid-cols-[2fr_1fr]">
                <Input
                  label="Heading"
                  {...register(`sections.${index}.heading`)}
                  error={errors.sections?.[index]?.heading?.message}
                />
                <Input
                  label="Anchor"
                  placeholder={toSlug(sections?.[index]?.heading ?? '') || 'from the heading'}
                  {...register(`sections.${index}.id`)}
                />
              </div>
              <Textarea
                label="Body"
                rows={6}
                {...register(`sections.${index}.body`)}
                error={errors.sections?.[index]?.body?.message}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() => append({ id: '', heading: '', body: '' })}
          >
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add section
          </Button>
        </VerticalFormBlockWrapper>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(routes.content.legal)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {doc ? 'Save page' : 'Create page'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

/** The edit page: loads the document, then shows the form. */
export function EditLegalDocument({ id }: { id: string }) {
  const { data, isLoading, error } = useLegalDocument(id);
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
        <Text>Could not load this legal page. It may have been deleted.</Text>
      </Alert>
    );
  }
  return <LegalForm doc={data} />;
}
