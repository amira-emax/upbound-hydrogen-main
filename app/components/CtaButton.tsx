import {NavLink} from 'react-router';
import {
  Plus,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {Button, buttonVariants} from './ui/button';
import {type VariantProps} from 'class-variance-authority';

// Define the type for the CTA button props
type CtaButtonProps = {
  reference?: {
    type?: string | null;
    label?: {
      value?: string | null;
    } | null;
    internalUrl?: {
      value?: string | null;
    } | null;
    externalUrl?: {
      value?: string | null;
    } | null;
    iconVariant?: {
      value?: string | null;
    } | null;
  } | null;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
};

// Map of icon variants to their components
const iconMap = {
  Plus: Plus,
  ArrowRight: ArrowRight,
  ArrowUpRight: ArrowUpRight,
  ChevronRight: ChevronRight,
  ExternalLink: ExternalLink,
  None: null,
};

function CtaButton({
  reference,
  className,
  variant = 'default',
  size = 'default',
}: CtaButtonProps) {
  // Early return if no reference data
  if (!reference) return null;

  // Handle potentially null fields
  const label = reference.label?.value ?? 'Learn More';
  const internalUrl = reference.internalUrl?.value ?? undefined;
  const externalUrl = reference.externalUrl?.value ?? undefined;
  const iconVariant =
    (reference.iconVariant?.value as keyof typeof iconMap) ?? undefined;

  // Determine the URL to use (prefer internal over external)
  const url = internalUrl || externalUrl || '#';

  // Determine if it's an external link
  const isExternal = !internalUrl && !!externalUrl;

  // Get the icon component if specified
  const IconComponent = iconVariant && iconMap[iconVariant];

  // Render button with or without icon
  const buttonContent = (
    <Button variant={variant} size={size} className={className}>
      <div className="flex items-center">
        {label}
        {IconComponent && <IconComponent className="ml-2" size={10} />}
      </div>
    </Button>
  );

  // Wrap in NavLink for internal URLs, or use anchor for external
  if (isExternal) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {buttonContent}
      </a>
    );
  }

  return <NavLink to={url}>{buttonContent}</NavLink>;
}

export default CtaButton;
