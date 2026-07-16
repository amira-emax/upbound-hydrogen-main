import type { StoreTypeFragment } from 'types/storefrontapi.generated';
import StoreLocationCard from './StoreLocationCard';

interface StoreLocatorCategoryProps {
  reference: StoreTypeFragment;
}

function StoreLocatorCategory({ reference }: StoreLocatorCategoryProps) {
  const { type_name, store_list } = reference;
  const locations = store_list?.references?.nodes ?? [];

  if (locations.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-6 typo-header">{type_name?.value}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {locations.map((location, index) => (
          <StoreLocationCard key={location.id ?? index} reference={location} />
        ))}
      </div>
    </section>
  );
}

export default StoreLocatorCategory;
