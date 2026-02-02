import { CartForm, type OptimisticCartLineInput, useAnalytics } from '@shopify/hydrogen';
import { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { type FetcherWithComponents } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { cn } from '~/lib/utils';
import { Button, buttonVariants } from './ui/button';
import { useAside } from './Aside';


export function AddToCartButton({
  analytics,
  children,
  loadingChildren,
  disabled,
  lines,
  buttonClassName,
  containerClassName, // cartForm has a container so use div to control
  variant,
  size,
  openCartOnSubmit = true,
  productData,
  quantity,
  page
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
} & VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
}) {
  const { open } = useAside();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const previousFetcherState = useRef('idle');
  const { shop } = useAnalytics();
  const currencyCode = shop?.currency || 'MYR';

  console.log('sini lines', lines);

  const isValidLines = Boolean(lines?.[0]?.merchandiseId);

  return (
    <div className={cn('', containerClassName)}>
      <CartForm
        route="/cart"
        inputs={isValidLines ? {lines} : {lines: []}}
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher: FetcherWithComponents<any>) => {
          // Check if we've completed a full cycle (non-idle to idle)
          if (
            previousFetcherState.current !== 'idle' &&
            fetcher.state === 'idle'
          ) {
            // This means we've completed a full cycle and returned to idle
            setIsLocalLoading(false);

            // GA Add to Cart event (Shopify Google & YouTube app)
            // if (typeof window !== 'undefined' && window.dataLayer) {

            //   const info = {
            //     id: productData?.id ?? 0,
            //     name: productData?.name ?? productData?.product?.title ?? productData?.title ?? '',
            //     variant: productData?.variant ?? productData?.productType ?? productData?.title ?? productData?.sku ?? '',
            //     price: productData?.selectedOrFirstAvailableVariant?.price?.amount ?? productData?.price?.amount ?? productData?.priceRange?.minVariantPrice?.amount ?? '0',
            //     quantity: quantity ?? productData?.quantity ?? 1,
            //     currency: productData?.price?.currencyCode ?? currencyCode ?? 'MYR',
            //   };

            //   window.dataLayer.push({
            //     event: 'add_to_cart',
            //     eventPage: page ?? 'unknown',
            //     details: info,
            //     product_id: info.id,
            //     currency: info.currency,
            //     quantity: info.quantity
            //   });

            //   console.log('sini datalayer', {
            //     event: 'add_to_cart',
            //     eventPage: page ?? 'unknown',
            //     details: info,
            //     product_id: info.id,
            //     currency: info.currency,
            //     quantity: info.quantity
            //   });
            // }

            if (openCartOnSubmit) open('cart');
          }

          // Update the previous state for next render
          previousFetcherState.current = fetcher.state;

          const isLoading =
            isLocalLoading ||
            fetcher.state === 'loading' ||
            fetcher.state === 'submitting';

          console.log('sini check line', lines);
          console.log('sini check line merchandiseId', lines[0]?.merchandiseId);

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
                disabled={disabled || isLoading || !isValidLines}
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


        }}
      </CartForm>
    </div>
  );
}
