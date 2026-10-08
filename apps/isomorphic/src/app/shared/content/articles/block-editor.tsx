'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { ActionIcon, Button, Input, Select, Text, Textarea } from 'rizzui';
import { PiArrowDownBold, PiArrowUpBold, PiPlusBold, PiTrashBold } from 'react-icons/pi';
import ImageField from '@/app/shared/content/image-field';
import { ArticleBlockType, BLOCK_TYPE_OPTIONS } from '@/types/content.types';

/** Form shape of one block: every field is a string so blocks can switch type without losing text. */
export type BlockFormValue = { type: ArticleBlockType; text: string; src: string; alt: string };

const TEXT_TYPE_OPTIONS = BLOCK_TYPE_OPTIONS.filter((o) => o.value !== 'image');

const PLACEHOLDER: Record<ArticleBlockType, string> = {
  lead: 'The opening paragraph, shown larger than the rest.',
  heading: 'Section heading',
  paragraph: 'Write a paragraph…',
  quote: 'A pull quote',
  image: '',
};

/**
 * The article body as a list of blocks (lead, heading, paragraph, quote, image). The storefront
 * owns the layout; this only edits the content and its order. Must sit inside a FormProvider
 * whose values have `body: BlockFormValue[]`.
 */
export default function BlockEditor() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<{ body: BlockFormValue[] }>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'body' });
  const blocks = useWatch({ control, name: 'body' });
  const [newType, setNewType] = useState<ArticleBlockType>('paragraph');

  const blockErrors = errors.body as unknown as
    | Array<{ text?: { message?: string }; src?: { message?: string } } | undefined>
    | undefined;

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && (
        <Text className="rounded-lg border border-dashed border-muted py-8 text-center text-gray-500">
          No blocks yet. Start with a lead paragraph, then add headings, paragraphs, quotes and images.
        </Text>
      )}

      {fields.map((field, index) => {
        const isImage = field.type === 'image';
        return (
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-muted p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {isImage ? (
                <Text className="font-medium">Image</Text>
              ) : (
                <Controller
                  control={control}
                  name={`body.${index}.type`}
                  render={({ field: typeField }) => (
                    <Select
                      size="sm"
                      className="w-56"
                      options={TEXT_TYPE_OPTIONS}
                      value={TEXT_TYPE_OPTIONS.find((o) => o.value === typeField.value) ?? null}
                      onChange={(v: ArticleBlockType) => typeField.onChange(v)}
                      getOptionValue={(o) => o.value}
                      getOptionDisplayValue={(o) => o.label}
                      aria-label="Block type"
                    />
                  )}
                />
              )}
              <div className="flex items-center gap-1">
                <ActionIcon
                  size="sm"
                  variant="outline"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label="Move block up"
                >
                  <PiArrowUpBold className="h-4 w-4" />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="outline"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label="Move block down"
                >
                  <PiArrowDownBold className="h-4 w-4" />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="flat"
                  color="danger"
                  onClick={() => remove(index)}
                  aria-label="Remove block"
                >
                  <PiTrashBold className="h-4 w-4" />
                </ActionIcon>
              </div>
            </div>

            {isImage ? (
              <div className="grid gap-3 @2xl:grid-cols-2">
                <Controller
                  control={control}
                  name={`body.${index}.src`}
                  render={({ field: srcField }) => (
                    <ImageField
                      value={srcField.value}
                      onChange={srcField.onChange}
                      error={blockErrors?.[index]?.src?.message}
                    />
                  )}
                />
                <Input
                  label="Alt text"
                  placeholder="Describe the image for screen readers"
                  {...register(`body.${index}.alt`)}
                />
              </div>
            ) : (
              <Textarea
                rows={blocks?.[index]?.type === 'heading' ? 1 : 4}
                placeholder={PLACEHOLDER[blocks?.[index]?.type ?? 'paragraph']}
                {...register(`body.${index}.text`)}
                error={blockErrors?.[index]?.text?.message}
              />
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-2">
        <Select
          size="sm"
          className="w-56"
          options={BLOCK_TYPE_OPTIONS}
          value={BLOCK_TYPE_OPTIONS.find((o) => o.value === newType) ?? null}
          onChange={(v: ArticleBlockType) => setNewType(v)}
          getOptionValue={(o) => o.value}
          getOptionDisplayValue={(o) => o.label}
          aria-label="New block type"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append({ type: newType, text: '', src: '', alt: '' })}
        >
          <PiPlusBold className="me-1.5 h-4 w-4" />
          Add block
        </Button>
      </div>
    </div>
  );
}
