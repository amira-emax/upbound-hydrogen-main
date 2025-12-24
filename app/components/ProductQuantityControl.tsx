import {cn} from '~/lib/utils';

interface ProductQuantityControlProps {
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  className?: string;
}

export function ProductQuantityControl({
  quantity = 1,
  onQuantityChange,
  className = '',
}: ProductQuantityControlProps) {
  const handleDecrease = () => {
    if (quantity > 1 && onQuantityChange) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (onQuantityChange) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-stretch border border-neutral-400 rounded-full overflow-clip',
        className,
      )}
    >
      <button
        type="button"
        className="px-4 py-2 hover:bg-neutral-100 transition-colors"
        onClick={handleDecrease}
      >
        -
      </button>
      <input
        id="quantity"
        type="number"
        min="1"
        value={quantity}
        className="text-center border-none outline-none py-2 typo-body-l flex-1 w-[50px]"
        readOnly
      />
      <button
        type="button"
        className="px-4 py-2 hover:bg-neutral-100 transition-colors"
        onClick={handleIncrease}
      >
        +
      </button>
    </div>
  );
}
