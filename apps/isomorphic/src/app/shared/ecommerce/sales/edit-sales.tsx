'use client';
import { useState, useEffect } from 'react'; // Ensured React imports
import { Button, Text } from 'rizzui';
import { Form } from '@core/ui/form';
import { SubmitHandler, useForm } from 'react-hook-form';
import { salesData } from '@/data/sales-data';
import {
  CreateSalesInput,
  createSalesSchema,
} from '@/validators/create-sale.schema';
import SaleInfoForm from './components/SaleInfoForm';
import SaleTypeSpecificFields from './components/SaleTypeSpecificFields';
import SaleVariantsForm from './components/SaleVariantsForm';

// Define ProductType based on salesData structure
interface ProductType {
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
  coverImage?: string;
}

// This should align with CreateSalesInput but might include _id, createdAt, etc.
interface SaleDataType extends CreateSalesInput {
  _id: string;
  // Add any other fields that your backend returns for a sale
}

interface EditSalesProps {
  saleId: string; // ID of the sale to edit
  initialSaleData: SaleDataType; // Pre-fetched sale data passed from server
}

export default function EditSales({ saleId, initialSaleData }: EditSalesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(salesData); // Full product list for selector
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );

  const methods = useForm<CreateSalesInput>({
    mode: 'onChange',
    resolver: async (data, context, options) => {
      // console.log('Validating form data:', data);
      const result = await createSalesSchema.safeParseAsync(data);
      console.log(result);

      // console.log('Validation result:', result);
      return result as any; // Casting for now, ensure proper resolver typing
    },
  });

  useEffect(() => {
    // Initialize form and selected product from pre-fetched data
    const data = initialSaleData;
    // Find the full product details
    const productDetails = salesData.find((p) => p.product._id === data.product)
      ?.product as ProductType | undefined;
    setSelectedProduct(productDetails || null);
    // Format data for the form, especially dates and numeric types
    const formData: CreateSalesInput = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(),
      limit: Number(data.limit) || 0,
      variants: data.variants.map((v) => ({
        ...v,
        discount: Number(v.discount) || 0,
        maxBuys: Number(v.maxBuys) || 0,
        boughtCount: Number(v.boughtCount) || 0,
      })),
    };
    methods.reset(formData);
  }, [initialSaleData, methods.reset]);

  const onSubmit: SubmitHandler<CreateSalesInput> = async (data) => {
    setIsSubmitting(true);
    console.log('Updating Sale Data:', data);
    // Simulate API call for update
    try {
      // const response = await yourActualUpdateApiCall(saleId, data);
      // console.log('Update successful', response);
      alert('Sale updated successfully! (Check console for data)');
      // Optionally, re-fetch data or update initialSaleData
      // setInitialSaleData({ ...initialSaleData, ...data, _id: saleId });
    } catch (error) {
      console.error('Failed to update sale:', error);
      alert('Failed to update sale. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (query: string) => {
    setFilteredProducts(
      salesData.filter((item) =>
        item.product.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const description =
    'Modify the details below to update the sale. Adjust the title, type, product, campaign, and variants as needed.';

  // Render form directly since data is pre-fetched

  return (
    <Form<CreateSalesInput>
      onSubmit={onSubmit} // Pass the submit handler to RHF Form component
      useFormProps={{
        ...methods,
        mode: methods.formState.isSubmitted ? 'onSubmit' : 'onChange', // Example mapping
        defaultValues: methods.getValues(), // Map default values
      }} // Pass mapped RHF methods
      className="isomorphic-form flex max-w-3xl flex-col justify-start gap-3 rounded-lg bg-white"
    >
      {({
        register,
        control,
        setValue,
        watch,
        formState: { errors },
        // handleSubmit is implicitly used by the Form component if onSubmit is passed to it
      }) => {
        const getCircularReplacer = () => {
          const seen = new WeakSet();
          return (key: string, value: any) => {
            if (key === 'ref' && value instanceof HTMLElement) {
              return `[HTMLElement: ${value.tagName}]`;
            }
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) {
                return '[Circular]';
              }
              seen.add(value);
            }
            return value;
          };
        };

        return (
          <>
            <Text className="mb-6 text-sm text-gray-500">{description}</Text>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <SaleInfoForm
                  control={control}
                  errors={errors}
                  register={register}
                  setValue={setValue}
                  selectedProduct={selectedProduct}
                  setSelectedProduct={setSelectedProduct}
                  isDrawerOpen={isDrawerOpen}
                  setDrawerOpen={setDrawerOpen}
                  filteredProducts={filteredProducts}
                  handleSearch={handleSearch}
                  isEditMode={true}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SaleTypeSpecificFields
                control={control}
                errors={errors}
                watch={watch}
                register={register}
              />
            </section>

            <section>
              <SaleVariantsForm
                control={control}
                errors={errors}
                watch={watch}
                register={register}
                setValue={setValue}
                selectedProduct={selectedProduct}
              />
            </section>

            <footer className="mt-8 flex justify-end gap-4 border-t border-gray-200 pt-6">
              <Button
                type="submit" // RHF handles submission via Form component's onSubmit
                isLoading={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 @xl:w-auto"
              >
                Update Sale
              </Button>
            </footer>
          </>
        );
      }}
    </Form>
  );
}
