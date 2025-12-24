import {Image} from '@shopify/hydrogen';
import {Article} from '@shopify/hydrogen/storefront-api-types';

interface ScienceCardProps {
  article?: Article;
}

export default function ScienceCard({article}: ScienceCardProps) {
  if (!article?.image) return null;

  return (
    <div className="space-y-1">
      <div className="relative aspect-square rounded-xl overflow-clip">
        <Image
          data={article.image}
          className="w-full h-full object-cover"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
      </div>
      <div className="bg-neutral-300 p-4 rounded-xl">
        <h2 className="text-center">{article?.title}</h2>
      </div>
    </div>
  );
}
