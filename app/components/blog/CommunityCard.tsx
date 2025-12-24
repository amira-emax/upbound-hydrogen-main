import {Image} from '@shopify/hydrogen';
import {Article, Metafield} from '@shopify/hydrogen/storefront-api-types';
import {Link} from 'react-router';
import {Button} from '../ui/button';

interface CommunityCardProps {
  article?: Article & {caption?: Metafield};
}

export default function CommunityCard({article}: CommunityCardProps) {
  if (!article?.image) return null;

  return (
    <div className="space-y-1">
      {/* Image Section */}
      <div className="relative aspect-[640/360] overflow-hidden rounded-xl">
        <Link to={`/community/${article.handle}`}>
          <Image
            data={article.image}
            className="w-full h-full object-cover object-top"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </Link>
      </div>

      {/* Content Section */}
      <div className="p-4 lg:p-6 rounded-xl bg-white space-y-6">
        {/* Name, Role and Badge */}
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-2">
            <h2>{article.title}</h2>
            <p className="text-mid-grey">{article?.caption?.value}</p>
          </div>
          {article.tags?.map((tag, index) => (
            <div
              key={index}
              className="typo-caption-responsive bg-black text-white rounded-full px-2 lg:px-3 py-1"
            >
              {tag}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-end lg:gap-[60px]">
          {/* Description */}
          <p className="typo-p-small mb-4 line-clamp-5">{article.excerpt}</p>

          {/* Read More Link */}
          <Link to={`/community/${article.handle}`}>
            <Button variant="link" className="!p-0">
              Read more +
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
