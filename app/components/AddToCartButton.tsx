import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {VariantProps} from 'class-variance-authority';
import {Loader2} from 'lucide-react';
import {type FetcherWithComponents} from 'react-router';
import {useEffect, useRef, useState} from 'react';
import {cn} from '~/lib/utils';
import {Button, buttonVariants} from './ui/button';
import {useAside} from './Aside';

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
}: {
  analytics?: unknown;
  children: React.ReactNode;
  loadingChildren?: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  buttonClassName?: string;
  containerClassName?: string;
  openCartOnSubmit?: boolean;
} & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const {open} = useAside();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const previousFetcherState = useRef('idle');

  return (
    <div className={cn('', containerClassName)}>
      <CartForm
        route="/cart"
        inputs={{lines}}
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
            if (openCartOnSubmit) open('cart');
          }

          // Update the previous state for next render
          previousFetcherState.current = fetcher.state;

          const isLoading =
            isLocalLoading ||
            fetcher.state === 'loading' ||
            fetcher.state === 'submitting';

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
        }}
      </CartForm>
    </div>
  );
}
