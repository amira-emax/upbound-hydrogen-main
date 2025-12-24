import {X} from 'lucide-react';
import {Suspense, useEffect} from 'react';
import {Await} from 'react-router';
import {GlobalBannerCmsQuery} from 'types/storefrontapi.generated';
import {useCooldown} from '~/lib/hooks/useCooldown';

// Unique key for this component in localStorage
const STORAGE_KEY = 'promo_banner';
// Cooldown period in minutes (10 minutes)
const COOLDOWN_MINUTES = 10;

function Banner({
  bannerPromise,
  setIsBannerOpened,
}: {
  bannerPromise: Promise<GlobalBannerCmsQuery | null>;
  setIsBannerOpened: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  // Use the cooldown hook to manage visibility
  const [isVisible, setIsVisible] = useCooldown(STORAGE_KEY, COOLDOWN_MINUTES);

  // Sync the parent's state with our cooldown state
  useEffect(() => {
    setIsBannerOpened(isVisible);
  }, [isVisible, setIsBannerOpened]);

  // If not visible based on cooldown, don't render
  if (!isVisible) return null;

  return (
    <Suspense>
      <Await resolve={bannerPromise}>
        {(data) =>
          data?.globalBanner?.display?.value == 'true' && (
            <div className="sticky top-0 z-10">
              <div className="relative max-h-[50px] md:max-h-[28px] p-3 pr-6 flex items-center justify-center bg-mint">
                <p className="typo-caption">
                  {data?.globalBanner?.content?.value}
                </p>
                <X
                  className="absolute right-2 cursor-pointer"
                  size={14}
                  onClick={() => {
                    setIsVisible(false);
                    setIsBannerOpened(false);
                  }}
                  aria-label="Close promotional banner"
                />
              </div>
            </div>
          )
        }
      </Await>
    </Suspense>
  );
}

export default Banner;
