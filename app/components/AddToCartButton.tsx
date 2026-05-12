import { CartForm, type OptimisticCartLineInput, useAnalytics } from '@shopify/hydrogen';
import { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { type FetcherWithComponents } from 'react-router';
import { useEffect, useRef } from 'react';
import { cn } from '~/lib/utils';
import { Button, buttonVariants } from './ui/button';
import { useAside } from './Aside';
import type { AsideType } from './Aside';


export function AddToCartButton({
  analytics,
  children,
  loadingChildren,
  disabled,
  lines,
  buttonClassName,
  containerClassName,
  variant,
  size,
  openCartOnSubmit = true,
  productData,
  quantity,
  page,
  onSuccess,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  loadingChildren?: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  buttonClassName?: string;
  containerClassName?: string;
  openCartOnSubmit?: boolean;
  productData?: Record<string, any>;
  quantity?: number;
  page?: string;
  onSuccess?: () => void;
} & VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
}) {
  const { open } = useAside();
  const { shop } = useAnalytics();
  const currencyCode = shop?.currency || 'MYR';

  return (
    <div className={cn('', containerClassName)}>
      <CartForm
        route="/cart"
        inputs={{ lines }}
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher: FetcherWithComponents<any>) => (
          <CartFormInner
            fetcher={fetcher}
            analytics={analytics}
            disabled={disabled}
            buttonClassName={buttonClassName}
            variant={variant}
            size={size}
            openCartOnSubmit={openCartOnSubmit}
            productData={productData}
            quantity={quantity}
            page={page}
            currencyCode={currencyCode}
            onSuccess={onSuccess}
            open={open}
            loadingChildren={loadingChildren}
          >
            {children}
          </CartFormInner>
        )}
      </CartForm>
    </div>
  );
}

function CartFormInner({
  fetcher,
  analytics,
  disabled,
  buttonClassName,
  variant,
  size,
  openCartOnSubmit,
  productData,
  quantity,
  page,
  currencyCode,
  onSuccess,
  open,
  loadingChildren,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  analytics?: unknown;
  disabled?: boolean;
  buttonClassName?: string;
  variant?: any;
  size?: any;
  openCartOnSubmit?: boolean;
  productData?: Record<string, any>;
  quantity?: number;
  page?: string;
  currencyCode: string;
  onSuccess?: () => void;
  open: (mode: AsideType) => void;
  loadingChildren?: React.ReactNode;
  children: React.ReactNode;
}) {
  const previousFetcherState = useRef('idle');

  useEffect(() => {
    if (previousFetcherState.current !== 'idle' && fetcher.state === 'idle') {
      if (typeof window !== 'undefined' && window.dataLayer) {
        const info = {
          id: productData?.id ?? 0,
          name: productData?.name ?? productData?.product?.title ?? productData?.title ?? '',
          variant: productData?.variant ?? productData?.productType ?? productData?.title ?? productData?.sku ?? '',
          price: productData?.selectedOrFirstAvailableVariant?.price?.amount ?? productData?.price?.amount ?? productData?.priceRange?.minVariantPrice?.amount ?? '0',
          quantity: quantity ?? productData?.quantity ?? 1,
          currency: productData?.price?.currencyCode ?? currencyCode ?? 'MYR',
        };

        window.dataLayer.push({
          event: 'add_to_cart',
          eventPage: page ?? 'unknown',
          details: info,
          product_id: info.id,
          currency: info.currency,
          quantity: info.quantity,
        });
      }

      if (openCartOnSubmit) open('cart');
      onSuccess?.();
    }
    previousFetcherState.current = fetcher.state;
  }, [fetcher.state]);

  const isLoading = fetcher.state === 'loading' || fetcher.state === 'submitting';

  return (
    <div>
      <input
        name="analytics"
        type="hidden"
        value={JSON.stringify(analytics)}
      />
      <Button
        type="submit"
        variant={variant ?? 'gray-mint'}
        size={size}
        disabled={disabled || isLoading}
        className={cn('', buttonClassName)}
      >
        {isLoading
          ? (loadingChildren ?? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding Item...
            </div>
          ))
          : children}
      </Button>
    </div>
  );
}
