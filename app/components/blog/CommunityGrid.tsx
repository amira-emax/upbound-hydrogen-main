import {Article} from '@shopify/hydrogen/storefront-api-types';
import CommunityCard from './CommunityCard';

interface CommunityGridProps {
  title?: string | null;
  description?: string | null;
  articles?: Article[] | null;
}

export default function CommunityGrid({
  title,
  description,
  articles,
}: CommunityGridProps) {
  // Filter articles that have images
  const displayArticles = articles?.filter((article) => article.image) || [];

  return (
    <div className="max-w-content py-16 md:py-24">
      {/* Grid Header */}
      <div className="flex flex-col lg:flex-row text-center mb-6 lg:mb-[60px] border-b border-black justify-between items-start lg:items-end pt-2 pb-4 lg:pb-2">
        {title && <p className="typo-display-l mb-4 lg:mb-0">{title}</p>}
        {description && (
          <p className="typo-body-l whitespace-pre-line w-fit text-left">
            {description}
          </p>
        )}
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayArticles.length > 0 ? (
          displayArticles.map((article) => (
            <CommunityCard key={article.id} article={article} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-neutral-500 typo-body-l">
              No community articles available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
