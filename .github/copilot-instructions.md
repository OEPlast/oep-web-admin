# OEPlast Admin Dashboard - GitHub Copilot Instructions

## Project Overview

Next.js 15 admin dashboard for OEPlast, built with **modern state management** (React Query + Zustand) and enterprise-grade UI components. This is the administrative control panel for managing the e-commerce platform.

**Architecture**: Monorepo structure using pnpm workspaces with shared packages.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **UI Library**: Rizzui (custom component library)
- **Auth**: NextAuth v4 (credentials-only, admin access)
- **State Management**:
  - **Server State**: @tanstack/react-query (API data, caching, mutations)
  - **Client State**: Zustand (UI state, global app state)
- **Styling**: TailwindCSS
- **Forms**: react-hook-form + @hookform/resolvers
- **TypeScript**: Strict mode enabled (NO `any` types)
- **HTTP Client**: Axios with custom interceptors
- **Icons**: react-icons (Phosphor Icons)

## Core Principles

### 1. **State Management Strategy**

#### **Use React Query for**:

- API calls (GET, POST, PUT, DELETE)
- Server data caching and synchronization
- Data fetching with loading/error states
- Optimistic updates
- Auto-refetching and cache invalidation

#### **Use Zustand for**:

- UI state (modals, sidebars, theme)
- Global app state (user preferences, filters)
- Non-persisted temporary state
- Simple synchronous state updates

```typescript
// ✅ GOOD: Use React Query for server data
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/axios";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await apiClient.get("/products");
      return response.data;
    },
  });
};

// ✅ GOOD: Use Zustand for UI state
import { create } from "zustand";

interface SidebarStore {
  isOpen: boolean;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
```

### 2. **API Integration Pattern**

#### **File Structure**:

```
src/
├── libs/
│   ├── axios.ts           # Axios client with interceptors
│   ├── endpoints.ts       # Centralized API endpoints
│   └── apiRoutes.ts       # Legacy route builder (if needed)
├── hooks/
│   ├── queries/           # React Query hooks for GET requests
│   │   ├── useUserProfile.ts
│   │   ├── useProducts.ts
│   │   └── useOrders.ts
│   └── mutations/         # React Query hooks for mutations
│       ├── useUpdateProfile.ts
│       ├── useCreateProduct.ts
│       └── useDeleteOrder.ts
└── store/                 # Zustand stores
    ├── useSidebarStore.ts
    ├── useThemeStore.ts
    └── useFilterStore.ts
```

#### **Axios Client Usage**:

The axios client automatically:

- Adds authentication token from NextAuth session
- Unwraps `response.data.data` → `response.data`
- Adds request IDs
- Logs requests/responses in development
- Handles 401 redirects
- Provides type-safe responses

```typescript
// ✅ GOOD: Using apiClient with automatic data unwrapping
import { apiClient } from "@/libs/axios";
import api from "@/libs/endpoints";

const response = await apiClient.get<Product[]>(api.products.list);
// response.data is already Product[], not { data: Product[] }

const created = await apiClient.post<Product>(api.products.create, productData);
// created.data is Product, created.message is the success message
```

#### **Endpoint Definition**:

```typescript
// src/libs/endpoints.ts
export const api = {
  products: {
    list: "/products",
    byId: (id: string) => `/products/${id}`,
    create: "/products",
    update: (id: string) => `/products/${id}`,
  },
  // ... more endpoints
} as const;
```

### 3. **React Query Patterns**

#### **Query Hook Pattern**:

```typescript
// src/hooks/queries/useProducts.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/axios";
import api from "@/libs/endpoints";

export interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await apiClient.get<Product[]>(api.products.list);
      if (!response.data) {
        throw new Error("No data returned");
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
  });
};

// With parameters
export const useProductById = (id: string) => {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await apiClient.get<Product>(api.products.byId(id));
      return response.data!;
    },
    enabled: !!id, // Only run if id exists
  });
};
```

#### **Mutation Hook Pattern**:

```typescript
// src/hooks/mutations/useCreateProduct.ts
"use client";

import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/libs/axios";
import api from "@/libs/endpoints";
import toast from "react-hot-toast";

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
}

type MutationContext = {
  previousProducts?: Product[];
};

export const useCreateProduct = (options?: Omit<UseMutationOptions<Product, Error, CreateProductInput, MutationContext>, "mutationFn">) => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateProductInput, MutationContext>({
    mutationFn: async (data: CreateProductInput) => {
      const response = await apiClient.post<Product>(api.products.create, data);
      if (!response.data) {
        throw new Error("No data returned");
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
      // Allow component to override/extend success handler
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Default error toast
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error("Create product error:", error);
      // Allow component to override/extend error handler
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
```

#### **Usage in Components**:

```typescript
'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/queries/useProducts';
import { useCreateProduct } from '@/hooks/mutations/useCreateProduct';
import { handleApiError } from '@/libs/axios';
import { Alert, Button } from 'rizzui';

export default function ProductsPage() {
  const [componentError, setComponentError] = useState<string | null>(null);

  const { data: products, isLoading, error } = useProducts();

  const createProduct = useCreateProduct({
    onSuccess: (data) => {
      // Component-specific success handling
      setComponentError(null);
      console.log('Product created:', data);
      // Optional: redirect, close modal, etc.
    },
    onError: (error) => {
      // Component-specific error handling
      const errorMessage = handleApiError(error);
      setComponentError(errorMessage);
      // Optional: focus error element, show modal, etc.
    },
  });

  const handleCreate = () => {
    setComponentError(null); // Clear previous errors
    createProduct.mutate({
      name: 'New Product',
      price: 99.99,
      stock: 100,
    });
  };

  // Handle query errors
  if (isLoading) return <div>Loading...</div>;
  if (error) {
    return (
      <Alert color="danger" className="mb-4">
        <strong>Error loading products:</strong> {handleApiError(error)}
      </Alert>
    );
  }

  return (
    <div>
      {/* Display mutation error natively in component */}
      {componentError && (
        <Alert color="danger" className="mb-4">
          <strong>Failed to create product:</strong> {componentError}
        </Alert>
      )}

      {/* Display mutation error from React Query state */}
      {createProduct.isError && (
        <Alert color="danger" className="mb-4">
          <strong>Error:</strong> {handleApiError(createProduct.error)}
        </Alert>
      )}

      <button
        onClick={handleCreate}
        disabled={createProduct.isPending}
      >
        {createProduct.isPending ? 'Creating...' : 'Create Product'}
      </button>

      {products?.map(product => (
        <div key={product._id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### 4. **Zustand Store Patterns**

#### **Simple Store**:

```typescript
// src/store/useSidebarStore.ts
import { create } from 'zustand';

interface SidebarStore {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen }));,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
```

#### **Store with Persistence** (optional):

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage", // localStorage key
    }
  )
);
```

#### **Usage in Components**:

```typescript
'use client';

import { useSidebarStore } from '@/store/useSidebarStore';

export default function Header() {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <button onClick={toggle}>
      {isOpen ? 'Close' : 'Open'} Sidebar
    </button>
  );
}
```

### 5. **Form Patterns**

Use `react-hook-form` with `@hookform/resolvers` for form validation:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from 'rizzui';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be positive'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = async (data: ProductFormData) => {
    // Handle form submission
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Product Name"
        {...register('name')}
        error={errors.name?.message}
      />
      <Input
        label="Price"
        type="number"
        {...register('price', { valueAsNumber: true })}
        error={errors.price?.message}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

### 6. **Error Handling**

#### **Multi-Layer Error Handling Strategy**:

React Query mutations and queries should use a **layered approach** to error handling:

1. **Hook-level**: Default toast notifications for all users
2. **Component-level**: Native UI error states (alerts, inline errors)
3. **State-level**: Track errors for conditional rendering

**CRITICAL**: Always provide `options` parameter in mutation hooks to allow component-level error handling overrides.

#### **API Error Handling**:

```typescript
import { handleApiError } from "@/libs/axios";

try {
  const response = await apiClient.post("/api/endpoint", data);
} catch (error) {
  const errorMessage = handleApiError(error);
  toast.error(errorMessage);
}
```

#### **React Query Error Handling**:

```typescript
// Query with retry and error handling
export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.get<Product[]>(api.products.list);
      return response.data!;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// In component - Native error display
const { data, error, isError, isLoading } = useProducts();

if (isLoading) {
  return <Loader />;
}

if (isError) {
  return (
    <Alert color="danger" className="mb-4">
      <strong>Failed to load products:</strong> {handleApiError(error)}
    </Alert>
  );
}
```

#### **Component-Level Mutation Error Handling**:

```typescript
'use client';

import { useState } from 'react';
import { useUpdateProduct } from '@/hooks/mutations/useUpdateProduct';
import { handleApiError } from '@/libs/axios';
import { Alert, Button, Input } from 'rizzui';

export default function EditProductForm({ productId }: { productId: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', price: 0 });

  const updateMutation = useUpdateProduct({
    onSuccess: (data) => {
      setFormError(null);
      // Optional: redirect or show success message
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      // Component-specific error handling
      const errorMessage = handleApiError(error);
      setFormError(errorMessage);

      // Optional: scroll to error, focus field, etc.
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors

    updateMutation.mutate({
      id: productId,
      data: formData,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Native error display - takes precedence over toast */}
      {formError && (
        <Alert color="danger" className="mb-4">
          <strong>Update failed:</strong> {formError}
        </Alert>
      )}

      {/* Alternative: Use React Query error state directly */}
      {updateMutation.isError && !formError && (
        <Alert color="danger" className="mb-4">
          {handleApiError(updateMutation.error)}
        </Alert>
      )}

      <Input
        label="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <Button
        type="submit"
        isLoading={updateMutation.isPending}
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? 'Updating...' : 'Update Product'}
      </Button>
    </form>
  );
}
```

#### **Best Practices for Error Handling**:

1. **Always use `UseMutationOptions`** in mutation hooks to accept component callbacks
2. **Display field-specific errors natively** in the component UI (inline on form fields)
3. **Use toast for general errors** - When no field-specific errors exist, show toast with backend message or fallback
4. **Track error state** with `useState` for field-specific error handling
5. **Clear errors** before new mutations (`setError(null)` before `mutate()`)
6. **Use `handleApiError`** utility for consistent error message extraction
7. **Provide user actions** - retry buttons, error recovery options
8. **Log errors** to console for debugging (but don't expose stack traces to users)
9. **CRITICAL: Always show fallback error message** - If no specific field errors from backend, use toast with `error.response.data?.message` first, then fallback to "Something went wrong, try again" if that's undefined/null

**Example: Multi-Layer Error Handling with Toast Fallback**:

```typescript
'use client';

import { useState } from 'react';
import { useCreateProduct } from '@/hooks/mutations/useCreateProduct';
import { BackendValidationError, extractBackendErrors } from '@/libs/form-errors';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CreateProduct() {
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(null);

  const createProduct = useCreateProduct({
    onSuccess: () => {
      // Handle success
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendErrors = extractBackendErrors(error.response.data);
        if (backendErrors) {
          // We have field-specific errors - set them on form fields
          setApiErrors(backendErrors);
        } else {
          // No field errors - show toast with backend message or generic error
          const backendMessage = error.response.data?.message;
          toast.error(backendMessage || 'Something went wrong, try again');
        }
      } else {
        // Network error or other non-API error - show toast
        toast.error('Something went wrong, try again');
      }
    },
  });

  const handleSubmit = (data: any) => {
    setApiErrors(null); // Clear previous errors
    createProduct.mutate(data);
  };

  return (
    <ProductForm 
      onSubmit={handleSubmit}
      apiErrors={apiErrors}
      isLoading={createProduct.isPending}
    />
  );
}
```

### 7. **TypeScript Best Practices**

```typescript
// ❌ NEVER use any
const data: any = response.data;

// ✅ Define proper interfaces
interface Product {
  _id: string;
  name: string;
  price: number;
}

const data: Product = response.data;

// ✅ Use generics for reusable types
interface ApiResponse<T> {
  data: T | null;
  message: string;
}

// ✅ Use type inference where possible
const products = await apiClient.get<Product[]>("/products");
// products.data is automatically typed as Product[] | null
```

### 8. **Component Organization**

```
src/app/
├── (dashboard)/            # Dashboard routes group
│   ├── products/
│   │   ├── page.tsx       # Server Component (data fetching)
│   │   └── products-client.tsx  # Client Component (UI, hooks)
│   └── orders/
│       ├── page.tsx
│       └── orders-client.tsx
└── shared/                 # Shared UI components
    ├── forms/
    ├── tables/
    └── modals/
```

#### **Server/Client Split Pattern**:

```typescript
// app/products/page.tsx (Server Component)
import ProductsClient from './products-client';

export default async function ProductsPage() {
  // Can fetch initial data here if needed
  return <ProductsClient />;
}

// app/products/products-client.tsx (Client Component)
'use client';

import { useProducts } from '@/hooks/queries/useProducts';

export default function ProductsClient() {
  const { data, isLoading } = useProducts();

  // Client-side logic, hooks, event handlers
  return <div>...</div>;
}
```

### \*\*\* in nextjs server page

This is how you use params

```typescript
  params: Promise<{ userId: string }>;
}) {
  const userId = (await params).userId;
```

## Code Quality Standards

### Component Size Rules:

- **Min**: 50 lines (below = consider inlining)
- **Max**: 300 lines (above = MUST refactor)
- **Sweet Spot**: 100-200 lines

### DRY Principle:

- Extract repeated logic to hooks
- Extract repeated UI to components
- Centralize constants and configurations

### TypeScript:

- NO `any` types
- Proper interface definitions
- Use generics for reusable code
- Leverage type inference

## Critical Do's ✅

1. **API Calls**: Always use `apiClient` from `@/libs/axios`
2. **Endpoints**: Use centralized `api` object from `@/libs/endpoints`
3. **Queries**: Create dedicated hooks in `src/hooks/queries/`
4. **Mutations**: Create dedicated hooks in `src/hooks/mutations/`
5. **Mutation Options**: Always accept `UseMutationOptions` parameter for component-level callbacks
6. **UI State**: Use Zustand stores in `src/store/`
7. **Forms**: Use `react-hook-form` + zod validation
8. **Errors**: Use multi-layer error handling (inline field errors + toast for general errors)
9. **Error Display**: Show field-specific errors inline on form fields, use toast for general errors
10. **Fallback Errors**: For non-field errors, ALWAYS use toast with backend message (`error.response.data?.message`) first, then "Something went wrong, try again" as final fallback
11. **Components**: Mark client components with `'use client'`
12. **Types**: Define proper interfaces for all data structures
13. **Cache**: Invalidate queries after mutations

## Critical Don'ts ❌

1. ❌ DO NOT use `fetch()` directly - use `apiClient` and endpoint
2. ❌ DO NOT hardcode API URLs - use `api` endpoints
3. ❌ DO NOT use `any` type
4. ❌ DO NOT mix server/client code without boundaries
5. ❌ DO NOT create components >300 lines
6. ❌ DO NOT use browser dialogs (`alert`, `confirm`, `prompt`)
7. ❌ DO NOT mutate query cache directly - use `invalidateQueries`
8. ❌ DO NOT store server state in Zustand - use React Query
9. ❌ DO NOT duplicate API logic - create reusable hooks
10. ❌ DO NOT ignore error handling
11. ❌ DO NOT show general errors in Alert components - use toast instead
12. ❌ DO NOT create mutation hooks without `UseMutationOptions` parameter

## Critical Must Do's

1. When making a change, if a file or component uses anything else, look at those things and check if a change in that file/code/component would affect the dependencies directly attached to it. Give me a feedback on those things, check what to change and confirm from me if you are to change them. Then start your process

## Authentication

**Framework**: NextAuth v4 (credentials-only for admin users)

```typescript
// Server Component
import { auth } from "@/app/api/auth/[...nextauth]/auth-options";
const session = await getServerSession(auth);

// Client Component
import { useSession } from "next-auth/react";
const { data: session } = useSession();

// Axios automatically adds token from session
// No manual token management needed!
```

## Environment Variables

Required in `.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000

# NextAuth
NEXTAUTH_URL=http://localhost:4999
NEXTAUTH_SECRET=your-secret-key

# Optional: Google OAuth (if needed)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Development Workflow

```bash
# Install dependencies
pnpm install

# Run dev server (port 4999)
pnpm --filter=iso dev

# Build
pnpm --filter=iso build

# Type check
pnpm --filter=iso type:check

# Lint
pnpm --filter=iso lint
```

## Quick Reference

### Create a new Query Hook:

```typescript
// src/hooks/queries/useOrders.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/axios";
import api from "@/libs/endpoints";

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await apiClient.get(api.orders.list);
      return response.data!;
    },
  });
};
```

### Create a new Mutation Hook:

```typescript
// src/hooks/mutations/useDeleteOrder.ts
"use client";

import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/libs/axios";
import api from "@/libs/endpoints";
import toast from "react-hot-toast";

type MutationContext = {
  previousOrders?: Order[];
};

export const useDeleteOrder = (options?: Omit<UseMutationOptions<void, Error, string, MutationContext>, "mutationFn">) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: async (id: string) => {
      await apiClient.delete(api.orders.delete(id));
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted successfully");
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error("Delete order error:", error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
```

### For pages that are using tables that use the standard form component, as i would be integrating with tanstack/query. the table state needs to be update on query change:

```typescript
useEffect(() => {
  if (users) {
    setData(users);
  }
}, [users, setData]);
```

###

### Create a new Zustand Store:

```typescript
// src/store/useModalStore.ts
import { create } from "zustand";

interface ModalStore {
  isOpen: boolean;
  data: any | null;
  open: (data: any) => void;
  close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  data: null,
  open: (data) => set({ isOpen: true, data }),
  close: () => set({ isOpen: false, data: null }),
}));
```

## When in Doubt

1. Check existing patterns in the codebase
2. Follow React Query and Zustand best practices
3. Keep components small and focused
4. Use TypeScript strictly
5. Test error scenarios
6. Ask before making architectural changes

**Remember**: This is a production admin dashboard. Prioritize reliability, type safety, and maintainability over convenience.
