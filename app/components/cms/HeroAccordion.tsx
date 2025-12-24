import {AccordionFragment} from 'types/storefrontapi.generated';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import {cn} from '~/lib/utils';

interface HeroAccordionProps {
  reference: AccordionFragment;
  titleCentered?: boolean;
  className?: string;
}

function HeroAccordion({reference, className}: HeroAccordionProps) {
  const {
    title,
    type,
    collapsible,
    iconVariant,
    variant,
    numberedContent,
    content,
  } = reference ?? {};
  const accordionItems = content?.references?.nodes ?? [];
  const isCollapsible = collapsible?.value === 'true';
  const isNumbered = numberedContent?.value === 'true';

  return (
    <div
      className={cn(
        'max-w-content my-[100px] px-4 md:px-8 py-8  bg-white rounded-xl space-y-3',
        className,
      )}
    >
      {title?.value && (
        <p
          className={cn(
            'typo-caption text-neutral uppercase',
            variant?.value === 'faq' && 'text-center',
          )}
        >
          {title.value}
        </p>
      )}

      <Accordion
        type={isCollapsible ? 'single' : 'multiple'}
        collapsible={isCollapsible}
      >
        {accordionItems.map((item, index) => {
          const itemNumber = String(index + 1).padStart(2, '0');

          return (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-neutral-900 border-t border-b-0"
            >
              <AccordionTrigger
                iconVariant={iconVariant?.value === 'plus' ? 'plus' : 'arrow'}
                className={cn(
                  'flex items-center pt-[20px] gap-2 md:gap-0',
                  'data-[state=closed]:pb-[20px] data-[state=open]:pb-[16px] data-[state=open]:md:pb-[20px]',
                )}
              >
                {isNumbered && <h2 className="w-[10%]">{itemNumber}</h2>}
                <h2 className="flex-1 break-words">{item.title?.value}</h2>
              </AccordionTrigger>
              <AccordionContent className="pb-[24px] flex">
                {isNumbered && <span className="w-[10%]" />}
                <p className="flex-1 typo-p-small whitespace-pre-line">
                  {item.description?.value}
                </p>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export default HeroAccordion;
