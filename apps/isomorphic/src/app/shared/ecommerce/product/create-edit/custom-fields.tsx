'use client';

import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { Input, Button, ActionIcon, Select } from 'rizzui';
import TrashIcon from '@core/components/icons/trash';
import { PiPlusBold } from 'react-icons/pi';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import QuillEditor from '@core/ui/quill-editor';

export default function CustomFields() {
  const { control, register, formState: { errors } } = useFormContext();

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: 'specifications',
  });

  const { fields: dimFields, append: appendDim, remove: removeDim } = useFieldArray({
    control,
    name: 'dimensions',
  });

  return (
    <>
      <VerticalFormBlockWrapper
        title="Product Description"
        description="Write a detailed description of your product"
        className="col-span-full my-6"
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <QuillEditor
              value={field.value}
              onChange={field.onChange}
              label="Description"
              error={errors.description?.message as string}
              className="col-span-full [&_.ql-editor]:min-h-[200px]"
            />
          )}
        />
      </VerticalFormBlockWrapper>

      <VerticalFormBlockWrapper
        title="Specifications"
        description="Add custom product specifications as key-value pairs"
        className="col-span-full mt-2"
      >
        {specFields.map((item, index) => (
          <div key={item.id} className="flex gap-4 xl:gap-7">
            <Input
              label="Specification Name"
              placeholder="e.g. Material, Color, etc."
              className="flex-grow"
              {...register(`specifications.${index}.key`)}
              error={(errors.specifications as any)?.[index]?.key?.message}
            />
            <Input
              label="Specification Value"
              placeholder="e.g. Cotton, Red, etc."
              className="flex-grow"
              {...register(`specifications.${index}.value`)}
              error={(errors.specifications as any)?.[index]?.value?.message}
            />
            <ActionIcon
              onClick={() => removeSpec(index)}
              variant="flat"
              className="mt-7 shrink-0"
            >
              <TrashIcon className="h-4 w-4" />
            </ActionIcon>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => appendSpec({ key: '', value: '' })}
          variant="outline"
          className="ml-auto w-auto"
        >
          <PiPlusBold className="me-2 h-4 w-4" strokeWidth={2} /> Add Specification
        </Button>
      </VerticalFormBlockWrapper>

      <VerticalFormBlockWrapper
        title="Dimensions"
        description="Add product dimensions (weight, length, height, width)"
        className="col-span-full"
      >
        {dimFields.map((item, index) => (
          <div key={item.id} className="flex gap-4 xl:gap-7">
            <Controller
              name={`dimensions.${index}.key`}
              control={control}
              render={({ field }) => (
                <Select
                  label="Dimension Type"
                  className="flex-grow"
                  options={[
                    { value: 'weight', label: 'Weight' },
                    { value: 'length', label: 'Length' },
                    { value: 'height', label: 'Height' },
                    { value: 'width', label: 'Width' },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  error={(errors.dimensions as any)?.[index]?.key?.message}
                />
              )}
            />
            <Input
              label="Value"
              placeholder="e.g. 5 kg, 30 cm"
              className="flex-grow"
              {...register(`dimensions.${index}.value`)}
              error={(errors.dimensions as any)?.[index]?.value?.message}
            />
            <ActionIcon
              onClick={() => removeDim(index)}
              variant="flat"
              className="mt-7 shrink-0"
            >
              <TrashIcon className="h-4 w-4" />
            </ActionIcon>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => appendDim({ key: 'weight', value: '' })}
          variant="outline"
          className="ml-auto w-auto"
        >
          <PiPlusBold className="me-2 h-4 w-4" strokeWidth={2} /> Add Dimension
        </Button>
      </VerticalFormBlockWrapper>
    </>
  );
}
