import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '~/lib/utils';

// Upbound Figma-aligned button styles
// - Pill radius
// - Glass/backdrop blur default with mint hover
// - Size mapping tuned to S/M/L equivalents while preserving keys
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[80px] font-medium transition-all !leading-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        // Default: gray bg, hover black, black/white text swap
        default: 'bg-default-grey text-black hover:bg-black hover:text-white',
        // mint-black: mint bg, hover black, black/mint text swap
        'mint-black': 'bg-mint text-black hover:bg-black hover:text-mint',
        // black-mint: black bg, hover mint, white/black text
        'black-mint': 'bg-black text-white hover:bg-mint hover:text-black',
        // Gray-mint: gray bg, hover mint, black text
        'gray-mint': 'bg-default-grey text-black hover:bg-mint',
        // Glass default: translucent gray with blur, hover mint, black/white text swap
        'glass-default':
          'backdrop-blur-2xl backdrop-filter bg-mid-grey/40 text-black hover:bg-black hover:text-white',
        // CTA variant: gray bg, hover mint, black/white text swap
        cta: 'backdrop-blur-2xl backdrop-filter bg-neutral-200 text-black hover:bg-black hover:text-white',
        // Keep destructive semantics but align ring/contrast
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/30 dark:focus-visible:ring-destructive/40',
        // Subtle surface button (expanded search-like)
        secondary:
          'bg-white text-[color:oklch(0.556_0_0)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:text-foreground',
        // Outline adapts to theme, lightweight
        outline:
          'border border-border/80 bg-transparent text-foreground hover:bg-accent/50 hover:text-accent-foreground',
        // Ghost keeps surface clean but adds hover tint
        ghost:
          'bg-transparent text-foreground hover:bg-[rgba(137,137,137,0.2)]',
        // Link remains unchanged
        link: 'underline-offset-4 hover:underline',
        // gradient variant
        gradient:
          'bg-gradient-to-r from-sky-blue via-lavender to-sky-blue text-white bg-[length:200%_100%] bg-[position:0%_0%] hover:bg-[position:100%_0%] transition-all duration-500 ease-in-out',
        // gradient variant
        'gradient-reverse':
          'bg-gradient-to-r from-lavender via-sky-blue to-lavender text-white bg-[length:200%_100%] bg-[position:0%_0%] hover:bg-[position:100%_0%] transition-all duration-500 ease-in-out',
      },
      size: {
        // Figma-aligned fixed heights: S=34px, M=41px, L=47px
        sm: 'h-[34px] typo-caption-responsive px-5 gap-1.5 has-[>svg]:px-[18px]',
        default: 'h-[41px] typo-caption px-6 has-[>svg]:px-5',
        lg: 'h-[47px] typo-caption px-8 has-[>svg]:px-7',
        // Icon remains square but uses pill radius via base
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({variant, size, className}))}
      {...props}
    />
  );
}

export {Button, buttonVariants};
