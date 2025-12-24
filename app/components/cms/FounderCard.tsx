import {Image} from '@shopify/hydrogen';
import {Image as ShopifyImageType} from '@shopify/hydrogen/storefront-api-types';
import {Plus} from 'lucide-react';
import {cn} from '~/lib/utils';
import {Button} from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import HtmlContentBlock from '../blog/HtmlContentBlock';

interface FounderCardProps {
  founder?: {
    title?: {value?: string};
    description?: {value?: string};
    image?: {
      reference?: {
        image?: ShopifyImageType;
      };
    };
  };
  blogPost?: {
    title?: string;
    contentHtml?: string;
  } | null;
}

export default function FounderCard({founder, blogPost}: FounderCardProps) {
  if (!founder) return null;

  return (
    <div className="max-w-content relative my-8 flex flex-col items-center">
      <div
        className={cn(
          'overflow-hidden w-full md:max-w-[800px] aspect-[350/447] md:aspect-square rounded-3xl',
        )}
      >
        {founder.image?.reference?.image && (
          <Image
            data={founder.image.reference.image}
            className={cn('w-full h-full object-cover')}
          />
        )}
      </div>
      <div className="w-[80vw] max-w-[400px] absolute bottom-2 md:bottom-6 left-[50%] right-auto translate-x-[-50%] bg-neutral/20 space-y-[12px] md:space-y-[24px] rounded-xl text-white text-center p-4 md:p-6 backdrop-blur-xl">
        <p className="typo-caption">{founder.title?.value || ''}</p>
        <p className="md:whitespace-pre-line">
          {founder.description?.value || ''}
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              Read More
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent className="text-white w-[378px]">
            <DialogHeader>
              <DialogTitle>{blogPost?.title || 'Meet the founder'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {blogPost?.contentHtml && (
                <HtmlContentBlock
                  contentHtml={blogPost.contentHtml}
                  variant="founder"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
