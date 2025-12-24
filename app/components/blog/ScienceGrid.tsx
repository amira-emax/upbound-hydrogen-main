import {Article} from '@shopify/hydrogen/storefront-api-types';
import {useState} from 'react';
import {Dialog, DialogContent, DialogTitle} from '../ui/dialog';
import HtmlContentBlock from './HtmlContentBlock';
import ScienceCard from './ScienceCard';

interface ScienceGridProps {
  articles?: Article[] | null;
}

export default function ScienceGrid({articles}: ScienceGridProps) {
  const displayArticles = articles?.filter((article) => article.image) || [];
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Find the selected article
  const selectedArticle = displayArticles.find(
    (article) => article.id === selectedArticleId,
  );

  const handleCardClick = (articleId: string) => {
    setSelectedArticleId(articleId);
    setIsDialogOpen(true);
  };

  return (
    <div className="py-12 md:py-24 bg-neutral-50">
      <div className="max-w-content px-4 sm:px-6 lg:px-8">
        {/* Grid Header */}
        <div className="text-center mb-6">
          <h2>Formulated With</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
          {displayArticles.length > 0 ? (
            displayArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => handleCardClick(article.id)}
                className="cursor-pointer"
              >
                <ScienceCard article={article} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-500 typo-body-l">
                No articles available at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Single Dialog with Dynamic Content */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="text-white w-[378px]">
            <DialogTitle className="hidden">
              {selectedArticle?.title}
            </DialogTitle>
            {selectedArticle && (
              <div className="space-y-4">
                {selectedArticle.contentHtml && (
                  <HtmlContentBlock contentHtml={selectedArticle.contentHtml} />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
