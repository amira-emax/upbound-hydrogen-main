import { Image } from '@shopify/hydrogen';
import { BannerStepsFragment } from 'types/storefrontapi.generated';

interface BannerStepsProps {
  reference: BannerStepsFragment;
}

const ALIGNMENT_CLASSES: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function StepsBanner({ reference }: BannerStepsProps) {
  const {
    title,
    footer,
    steps,
    position = { value: 'center' },
    text_color = { value: 'text-black' },
    tag = { value: 'div' },
    title_position,
    footer_position,
    background_image,
  } = reference ?? {};

  const Tag = (tag?.value ?? 'div') as keyof JSX.IntrinsicElements;

  const getAlignment = (position?: string) =>
    ALIGNMENT_CLASSES[position ?? 'center'] ?? 'text-center';

  return (
    <div
      className={`w-full h-full min-h-[65vw] relative p-10 ${text_color?.value ?? 'text-black'}`}
    >
      {/* Background Image */}
      {background_image?.reference?.image?.url && (
        <Image
          data={background_image.reference.image}
          className="absolute inset-0 w-full h-full object-cover object-right md:object-bottom"
          draggable={false}
          sizes="150vw"
        />
      )}

      {/* Overlay content */}
      <div className="relative z-10 max-w-5xl py-10 flex flex-col gap-10">
        {/* Title */}
        {title?.value && (
          <Tag
            key="title"
            className={`${getAlignment(title_position?.value)} text-lg md:text-2xl`}
            dangerouslySetInnerHTML={{ __html: title.value }}
          />
        )}

        {/* Steps */}
        {steps?.references?.nodes?.length > 0 && (
          <div className="flex flex-col gap-8">
            {steps.references.nodes.map((stepItem, i) => {
              if (!stepItem) return null;
              return (
                <div
                  key={stepItem.step?.value ?? i}
                  className="flex flex-col gap-1"
                >
                  {stepItem.step?.value && (
                    <div
                      className={`text-base md:text-2xl self-start font-medium px-3 py-2 rounded-full inline-block
                  ${stepItem.step_text_color?.value ?? 'text-black'}`}
                      style={{ backgroundColor: '#b9db9b' }}
                    >
                      {stepItem.step.value}
                    </div>
                  )}

                  {stepItem.description?.value && (
                    <div
                      className={`text-sm md:text-2xl opacity-90 ${stepItem.description_text_color?.value ?? 'text-gray-700'
                        }`}
                      dangerouslySetInnerHTML={{
                        __html: stepItem.description.value,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {footer?.value && (
          <div
            key="footer"
            className={`text-lg md:text-2xl ${getAlignment(footer_position?.value)}`}
            dangerouslySetInnerHTML={{ __html: footer.value }}
          />
        )}
      </div>
    </div>

  );
}


export default StepsBanner;