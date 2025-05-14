import { useState } from 'react';
import { Button, Input, Text, Drawer, Select } from 'rizzui';
import { Form } from '@core/ui/form';
import { SubmitHandler, Controller } from 'react-hook-form';
import { DatePicker } from '@core/ui/datepicker';
import { salesData } from '@/data/sales-data';

type VariantType = {
  attributeName: string | null;
  attributeValue: string | null;
  discount: number;
  maxBuys: number;
  boughtCount: number;
  limit: number;
};

type SalesDataType2 = {
  title: string;
  product: string;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
  type: 'Flash' | 'Limited' | 'Normal';
  campaign?: string;
  limit: number;
  startDate: Date;
  endDate: Date;
  deleted?: boolean;
  variants: VariantType[];
};

const typeOptions = [
  { value: 'Flash', label: 'Flash' },
  { value: 'Limited', label: 'Limited' },
  { value: 'Normal', label: 'Normal' },
];

export default function EditSales({ sale }: { sale: SalesDataType2 }) {
  const [isLoading, setLoading] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(salesData);

  const onSubmit: SubmitHandler<SalesDataType2> = (data) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('editSales data ->', data);
    }, 600);
  };

  const handleSearch = (query: string) => {
    setFilteredProducts(
      salesData.filter((sale) =>
        sale.product.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const description =
    'Edit the details below to update the sale. Modify the title, type, product, campaign, and variants.';

  return (
    <Form<SalesDataType2>
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onChange',
        defaultValues: sale,
      }}
      className="isomorphic-form flex max-w-[700px] flex-col gap-6"
    >
      {({ register, control, setValue, watch, formState: { errors } }) => (
        <>
          <div className="col-span-2 mb-1 pe-4 @5xl:mb-0">
            <Text className="mt-1 text-sm text-gray-500">{description}</Text>
          </div>
          <div className="flex flex-col gap-6">
            <Input
              label="Title"
              placeholder="Sale Title"
              {...register('title', { required: true })}
              error={errors.title?.message}
            />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  label="Type"
                  as="select"
                  options={typeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.type?.message as string}
                />
              )}
            />
            <div>
              <label className="mb-1 block font-medium">Product</label>
              <Button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="w-full"
              >
                Select Product
              </Button>
              <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
                <Input
                  placeholder="Search products..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="mb-4"
                />
                <div className="space-y-2">
                  {filteredProducts.slice(0, 40).map((sale) => (
                    <div
                      key={sale.product._id}
                      className="flex cursor-pointer items-center gap-2 p-2 hover:bg-gray-100"
                      onClick={() => {
                        setValue('product', sale.product._id);
                        setDrawerOpen(false);
                      }}
                    >
                      <img
                        src={sale.product.coverImage}
                        alt={sale.product.name}
                        className="h-8 w-8 rounded-md object-cover"
                      />
                      <span>{sale.product.name}</span>
                    </div>
                  ))}
                </div>
              </Drawer>
              {errors.product && (
                <Text className="text-sm text-red-500">
                  {errors.product.message as string}
                </Text>
              )}
            </div>
            <Input
              label="Campaign"
              placeholder="Campaign"
              {...register('campaign')}
              error={errors.campaign?.message}
            />
            <Input
              label="Limit"
              type="number"
              {...register('limit', { required: true })}
              error={errors.limit?.message}
            />
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <div className="flex-1">
                  <label className="mb-1 block font-medium">Start Date</label>
                  <DatePicker
                    selected={new Date(field.value)}
                    onChange={field.onChange}
                    dateFormat="yyyy-MM-dd"
                    inputProps={{ placeholder: 'Start Date' }}
                    className="w-full"
                  />
                </div>
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <div className="flex-1">
                  <label className="mb-1 block font-medium">End Date</label>
                  <DatePicker
                    selected={new Date(field.value)}
                    onChange={field.onChange}
                    dateFormat="yyyy-MM-dd"
                    inputProps={{ placeholder: 'End Date' }}
                    className="w-full"
                  />
                </div>
              )}
            />
            <div>
              <h4>Variants</h4>
              {watch('variants').map((variant, index) => (
                <div key={index} className="space-y-2">
                  <Input
                    label="Attribute Name"
                    placeholder="Attribute Name"
                    {...register(`variants.${index}.attributeName`)}
                    error={errors.variants?.[index]?.attributeName?.message}
                  />
                  <Input
                    label="Attribute Value"
                    placeholder="Attribute Value"
                    {...register(`variants.${index}.attributeValue`)}
                    error={errors.variants?.[index]?.attributeValue?.message}
                  />
                  <Input
                    label="Discount"
                    type="number"
                    {...register(`variants.${index}.discount`, {
                      required: true,
                    })}
                    error={errors.variants?.[index]?.discount?.message}
                  />
                  <Input
                    label="Max Buys"
                    type="number"
                    {...register(`variants.${index}.maxBuys`)}
                    error={errors.variants?.[index]?.maxBuys?.message}
                  />
                  <Input
                    label="Bought Count"
                    type="number"
                    {...register(`variants.${index}.boughtCount`)}
                    error={errors.variants?.[index]?.boughtCount?.message}
                  />
                  <Input
                    label="Limit"
                    type="number"
                    {...register(`variants.${index}.limit`, { required: true })}
                    error={errors.variants?.[index]?.limit?.message}
                  />
                </div>
              ))}
              <Button
                type="button"
                onClick={() =>
                  setValue('variants', [
                    ...watch('variants'),
                    {
                      attributeName: '',
                      attributeValue: '',
                      discount: 10,
                      maxBuys: 0,
                      boughtCount: 0,
                      limit: 0,
                    },
                  ])
                }
                className="mt-2"
              >
                Add Variant
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full @xl:w-auto"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </>
      )}
    </Form>
  );
}
