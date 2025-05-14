'use client';
import { useEffect, useState } from 'react';
import { Button, Input, Text, Drawer, Select } from 'rizzui';
import { Form } from '@core/ui/form';
import { SubmitHandler, Controller } from 'react-hook-form';
import { DatePicker } from '@core/ui/datepicker';
import { salesData } from '@/data/sales-data';
import { LuReplace } from 'react-icons/lu';
import { FiDelete } from 'react-icons/fi';
import TrashIcon from '@core/components/icons/trash';
import { BiSolidError, BiTrash } from 'react-icons/bi';
import {
  CreateSalesInput,
  createSalesSchema,
} from '@/validators/create-sale.schema';
import { MdLabelImportant } from 'react-icons/md';

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

export default function CreateSales() {
  const [isLoading, setLoading] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(salesData);
  const [selectedProduct, setSelectedProduct] = useState<{
    _id: string;
    name: string;
    image: string;
    stock: number;
    slug: string;
    category: {
      _id: string;
      name: string;
    };
    subCategories: {
      _id: string;
      name: string;
    };
    attributes: {
      name: string;
      children: {
        name: string;
        price: number;
        discount: number;
        stock: number;
        image: string;
      }[];
    }[];
  } | null>(null);

  const onSubmit: SubmitHandler<CreateSalesInput> = (data) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('createSales data ->', data);
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
    'Fill in the details below to create a new sale. Set the title, type, product, campaign, and variants.';

  return (
    <Form<CreateSalesInput>
      onSubmit={onSubmit}
      validationSchema={createSalesSchema}
      useFormProps={{
        mode: 'onChange',
        defaultValues: {
          title: '',
          type: 'Normal',
          product: '',
          campaign: '',
          limit: 1,
          deleted: false,
          startDate: new Date(),
          endDate: new Date(),
          variants: [
            {
              attributeName: '',
              attributeValue: '',
              discount: 10,
              maxBuys: 0,
              boughtCount: 0,
              limit: 0,
            },
          ],
        },
      }}
      className="isomorphic-form flex max-w-[700px] flex-col gap-6"
    >
      {({ register, control, setValue, watch, formState: { errors } }) => {
        console.log(watch('variants'));
        return (
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
                    options={typeOptions}
                    value={field.value}
                    onChange={(selectedOption) => {
                      const selectedValue =
                        (selectedOption as unknown as { value: string })
                          ?.value || '';
                      field.onChange(selectedValue);

                      // Reset non-rendered fields to their default values
                      if (selectedValue !== 'Flash') {
                        setValue('startDate', new Date());
                        setValue('endDate', new Date());
                      }
                      if (selectedValue !== 'Limited') {
                        setValue('limit', 1);
                      }
                    }}
                    error={errors.type?.message as string}
                  />
                )}
              />
              <div>
                <label className="mb-1 block font-medium">Product</label>
                {!selectedProduct && (
                  <Button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="w-full"
                  >
                    Select Product
                  </Button>
                )}
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
                          setSelectedProduct({
                            _id: sale.product._id,
                            name: sale.product.name,
                            image: sale.product.coverImage,
                            stock: sale.product.stock,
                            slug: sale.product.slug,
                            category: sale.product.category,
                            subCategories: sale.product.subCategories,
                            attributes: sale.product.attributes,
                          });
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
              {selectedProduct && (
                <div className="relative flex flex-col items-start gap-2 rounded-md border bg-gray-50 p-4">
                  <div className="absolute right-2 top-2">
                    <Button
                      type="button"
                      onClick={() => setDrawerOpen(true)}
                      className="p-1 px-1.5"
                    >
                      <LuReplace className="h-4 w-4" />
                    </Button>
                  </div>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-8 w-8 rounded-md object-cover"
                  />
                  <span className="text-sm font-medium">
                    {selectedProduct.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ID: {selectedProduct._id}
                  </span>
                </div>
              )}
              {watch('type') === 'Flash' && (
                <>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <div className="flex-1">
                        <label className="mb-1 block font-medium">
                          Start Date
                        </label>
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
                        <label className="mb-1 block font-medium">
                          End Date
                        </label>
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
                </>
              )}
              {watch('type') === 'Limited' && (
                <Input
                  label="Limit"
                  type="number"
                  {...register('limit', { required: true })}
                  error={errors.limit?.message}
                />
              )}
              {!selectedProduct && (
                <div className="relative rounded p-3 text-center text-gray-500 outline outline-yellow-100">
                  <div className="absolute right-2 top-2">
                    <BiSolidError className="h-6 w-6 text-yellow-500" />
                  </div>
                  Select a product first to configure variants.
                </div>
              )}
              {selectedProduct && (
                <div>
                  <h4 className="mb-2">Variants</h4>
                  {watch('variants').map((variant, index) => (
                    <div
                      key={index}
                      className="mb-4 space-y-2 rounded-md p-4 outline outline-gray-200"
                    >
                      <Controller
                        name={`variants.${index}.attributeName`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Attribute Name"
                            options={selectedProduct.attributes.map((attr) => ({
                              value: attr.name,
                              label: attr.name,
                            }))}
                            value={field.value}
                            onChange={(selectedOption) =>
                              field.onChange(
                                (selectedOption as unknown as { value: string })
                                  ?.value || ''
                              )
                            }
                            error={
                              errors.variants?.[index]?.attributeName?.message
                            }
                          />
                        )}
                      />
                      <Controller
                        name={`variants.${index}.attributeValue`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Attribute Value"
                            options={
                              watch(`variants.${index}.attributeName`)
                                ? selectedProduct.attributes
                                    .find(
                                      (attr) =>
                                        attr.name ===
                                        watch(`variants.${index}.attributeName`)
                                    )
                                    ?.children.map((child) => ({
                                      value: child.name,
                                      label: child.name,
                                    })) || []
                                : []
                            }
                            value={field.value}
                            onChange={(selectedOption) =>
                              field.onChange(
                                (selectedOption as unknown as { value: string })
                                  ?.value || ''
                              )
                            }
                            error={
                              errors.variants?.[index]?.attributeValue?.message
                            }
                          />
                        )}
                      />
                      <Input
                        label="Discount"
                        type="number"
                        {...register(`variants.${index}.discount`, {
                          required: true,
                          setValueAs: (value) => parseFloat(value) || 0,
                        })}
                        error={errors.variants?.[index]?.discount?.message}
                      />
                      {watch('type') === 'Limited' && (
                        <Input
                          label="Max Buys"
                          type="number"
                          {...register(`variants.${index}.maxBuys`, {
                            setValueAs: (value) => parseInt(value, 10) || 0,
                          })}
                          error={errors.variants?.[index]?.maxBuys?.message}
                        />
                      )}
                      {!watch(`variants.${index}.attributeName`) &&
                      !watch(`variants.${index}.attributeValue`) ? (
                        <div className="text-sm text-gray-500">
                          Product Stock: {selectedProduct.stock}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Attribute Stock:{' '}
                          {selectedProduct.attributes
                            .find(
                              (attr) =>
                                attr.name ===
                                watch(`variants.${index}.attributeName`)
                            )
                            ?.children.find(
                              (child) =>
                                child.name ===
                                watch(`variants.${index}.attributeValue`)
                            )?.stock || 0}
                        </div>
                      )}
                      <div className="flex w-full justify-center">
                        <Button
                          type="button"
                          onClick={() => {
                            const updatedVariants = [...watch('variants')];
                            if (updatedVariants.length <= 1) return;
                            updatedVariants.splice(index, 1);
                            setValue('variants', updatedVariants);
                          }}
                          className="mt-2 bg-red-500 text-white"
                        >
                          <BiTrash />
                        </Button>
                      </div>
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
              )}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full @xl:w-auto"
                >
                  Create Sale
                </Button>
              </div>
            </div>
          </>
        );
      }}
    </Form>
  );
}
