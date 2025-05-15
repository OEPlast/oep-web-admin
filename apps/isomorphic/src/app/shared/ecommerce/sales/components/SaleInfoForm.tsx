'use client';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { Button, Drawer, Input, Select, Text } from 'rizzui';
import { CreateSalesInput } from '@/validators/create-sale.schema';
import { LuReplace } from 'react-icons/lu';
import { salesData } from '@/data/sales-data'; // Assuming salesData is correctly typed
import { useState } from 'react';

const typeOptions = [
  { value: 'Flash', label: 'Flash' },
  { value: 'Limited', label: 'Limited' },
  { value: 'Normal', label: 'Normal' },
];

interface SaleInfoFormProps {
  control: Control<CreateSalesInput>;
  errors: FieldErrors<CreateSalesInput>;
  register: UseFormRegister<CreateSalesInput>;
  setValue: UseFormSetValue<CreateSalesInput>;
  selectedProduct: {
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
  } | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>; // Adjust 'any' to the correct product type
  isDrawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filteredProducts: typeof salesData; // Assuming salesData is correctly typed
  handleSearch: (query: string) => void;
  isEditMode?: boolean; // Added isEditMode prop
}

export default function SaleInfoForm({
  control,
  errors,
  register,
  setValue,
  selectedProduct,
  setSelectedProduct,
  isDrawerOpen,
  setDrawerOpen,
  filteredProducts,
  handleSearch,
  isEditMode, // Destructure isEditMode
}: SaleInfoFormProps) {
  return (
    <>
      <Input
        className="mb-3"
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
            className="mb-3"
            label="Type"
            options={typeOptions}
            value={field.value}
            onChange={(selectedOption) => {
              const selectedValue =
                (selectedOption as unknown as { value: string })?.value || '';
              field.onChange(selectedValue);

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
        <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
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
                  setValue('variants', [
                    {
                      attributeName: 'All', // Reset to 'All'
                      attributeValue: 'All', // Reset to 'All'
                      discount: 10,
                      maxBuys: 0,
                      boughtCount: 0,
                      // limit is part of the main sale, not variant here based on schema
                    },
                  ]);
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
          <span className="text-sm font-medium">{selectedProduct.name}</span>
          <span className="text-xs text-gray-500">
            ID: {selectedProduct._id}
          </span>
        </div>
      )}
      {/* Campaign input can be added here if needed */}
      {/* <Input
        label="Campaign"
        placeholder="Campaign Name"
        {...register('campaign')}
        error={errors.campaign?.message}
      /> */}
    </>
  );
}
