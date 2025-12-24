import {TextWithCtaFragment} from 'types/storefrontapi.generated';
import CtaButton from '../CtaButton';

interface TextWithCtaProps {
  reference: TextWithCtaFragment;
}

function TextWithCta({reference}: TextWithCtaProps) {
  const {title, description, cta} = reference ?? {};

  return (
    <div className="max-w-content page-px py-[120px] text-center">
      <p className="typo-caption">{title?.value}</p>
      <h1 className="my-[40px] md:my-[56px] md:whitespace-pre-line text-start md:text-center">
        {description?.value}
      </h1>
      <CtaButton
        reference={cta?.reference ?? null}
        variant="glass-default"
        size="sm"
      />
    </div>
  );
}

export default TextWithCta;
