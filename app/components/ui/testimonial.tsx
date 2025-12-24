import {cn} from '~/lib/utils';
import {cva} from 'class-variance-authority';

// Base container and orientation variants using CVA
const testimonialVariants = cva('rounded-2xl text-black', {
  variants: {
    orientation: {
      horizontal: 'flex items-start gap-6 w-full [&_img]:max-h-[300px]',
      vertical: 'w-[300px]',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

const imageVariants = cva('', {
  variants: {
    orientation: {
      horizontal: 'shrink-0 overflow-hidden rounded-xl aspect-3/2',
      vertical: 'overflow-hidden rounded-xl aspect-square',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

/**
 * Testimonial component
 * Props: image, quote, name, subtitle, orientation
 */
interface TestimonialProps {
  image: {
    src: string;
    alt: string;
  };
  quote: string;
  title: string;
  subtitle: string;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export function Testimonial({
  image = {
    src: 'https://cdn.shopify.com/s/files/1/0688/1755/1382/collections/cd_three_pairs_of_neatly_arranged_men_and_womens_running_shoes._f4121e54-2c8a-4ad2-b366-355c0cc4348d_1.png?v=1675461870&width=1000&height=1000&crop=center',
    alt: 'Performer',
  },
  quote = "Can't get enough of these! Perfect flavor. Crazy refreshing",
  title = 'Elites Name',
  subtitle = 'DJ / Producer',
  variant = 'horizontal',
  className = '',
  ...props
}: TestimonialProps) {
  const orientation = variant; // keep prop name compatible with preview

  return (
    <figure
      className={cn(testimonialVariants({orientation, className}))}
      {...props}
    >
      <div className={cn(imageVariants({orientation}))}>
        <img src={image.src} alt={image.alt} loading="lazy" />
      </div>
      <div className={orientation === 'horizontal' ? 'pt-2 flex-1' : ''}>
        <h2 className={cn(orientation === 'horizontal' && 'mt-5')}>
          “{quote}”
        </h2>
        <figcaption
          className={cn(
            orientation === 'horizontal' ? 'mt-6 space-y-3' : 'mt-4',
          )}
        >
          <h2
            className={cn(
              'font-medium leading-tight',
              orientation === 'horizontal' && 'text-[20px]',
            )}
          >
            {title}
          </h2>
          <div className="typo-caption-m text-muted-foreground">{subtitle}</div>
        </figcaption>
      </div>
    </figure>
  );
}

export function TestimonialSkeleton({variant = 'horizontal'}) {
  const base = 'rounded-2xl bg-zinc-800/60 ring-1 ring-black/10 animate-pulse';
  if (variant === 'vertical') {
    return (
      <div className={cn(base, 'p-5 w-[340px]')}>
        <div className="rounded-xl bg-zinc-700 h-[240px] w-full" />
        <div className="mt-4 h-6 bg-zinc-700 rounded" />
        <div className="mt-2 h-6 bg-zinc-700 rounded w-2/3" />
        <div className="mt-4 h-5 bg-zinc-700 rounded w-1/2" />
      </div>
    );
  }
  return (
    <div className={cn(base, 'p-5 flex gap-6 max-w-3xl')}>
      <div className="rounded-xl bg-zinc-700 h-[220px] w-[300px]" />
      <div className="flex-1">
        <div className="h-7 bg-zinc-700 rounded w-5/6" />
        <div className="mt-2 h-7 bg-zinc-700 rounded w-2/3" />
        <div className="mt-5 h-6 bg-zinc-700 rounded w-1/3" />
        <div className="mt-2 h-5 bg-zinc-700 rounded w-1/4" />
      </div>
    </div>
  );
}
