import {Image} from '@shopify/hydrogen';
import type {AccountHeroFragment} from 'types/storefrontapi.generated';

interface AccountHeroProps {
  data?: AccountHeroFragment | null;
}

/**
 * Banner shown above the Account section (sidebar + Outlet in
 * routes/($locale).account.tsx). Image/title are merchandiser-managed via
 * the "account_page" metaobject — see AccountPageQuery.ts. Always rendered
 * (with a solid-color fallback when the metaobject isn't configured yet)
 * because the `.account` layout below relies on this banner's height to
 * clear the fixed, transparent site header — see the `.account` rule in
 * app.css. Image styling otherwise matches ScienceHero on /science.
 */
export default function AccountHero({data}: AccountHeroProps) {
  const {title, hero_image: heroImage} = data ?? {};

  return (
    <div className="relative w-full h-70 md:h-90 overflow-hidden bg-neutral-900">
      {heroImage?.reference?.image && (
        <Image
          data={heroImage.reference.image}
          className="absolute inset-0 w-full h-full object-cover"
          sizes="100vw"
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-white tracking-[0.2em] uppercase">
          {title?.value ?? 'Account'}
        </h2>
      </div>
    </div>
  );
}
