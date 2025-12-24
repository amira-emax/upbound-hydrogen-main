import {Image} from '@shopify/hydrogen';
import {X, CheckCircle, AlertCircle, Loader2} from 'lucide-react';
import {useCooldown} from '~/lib/hooks/useCooldown';
import {Button} from '../ui/button';
import {Await, useFetcher} from 'react-router';
import {GlobalNewsletterPopupCmsQuery} from 'types/storefrontapi.generated';
import {Suspense, useState, useEffect} from 'react';

// Unique key for this component in localStorage
const STORAGE_KEY = 'newsletter_popup';
// Cooldown period in minutes (10 minutes)
const COOLDOWN_MINUTES = 10;
// Initial delay before showing popup (2 seconds)
const INITIAL_DELAY = 2000;
// Additional delay before rendering (25 seconds)
const ADDITIONAL_DELAY_MS = 25000;

function NewsletterPopup({
  globalNewsletterPopupPromise,
}: {
  globalNewsletterPopupPromise: Promise<GlobalNewsletterPopupCmsQuery | null>;
}) {
  // Use the cooldown hook to manage visibility
  const [isVisible, setIsVisible] = useCooldown(
    STORAGE_KEY,
    COOLDOWN_MINUTES,
    INITIAL_DELAY,
  );

  // Additional state for the 25-second delay
  const [showAfterDelay, setShowAfterDelay] = useState(false);

  // Use fetcher for form submission
  const fetcher = useFetcher();

  // Helper functions to determine state
  const isLoading =
    fetcher.state === 'submitting' || fetcher.state === 'loading';
  const isSuccess = fetcher.state === 'idle' && fetcher.data?.success;
  const isError = fetcher.state === 'idle' && fetcher.data?.error;
  const errorMessage = isError ? fetcher.data.error : '';

  // Effect to handle the additional 25-second delay
  useEffect(() => {
    // Only start the timer if the component is visible from cooldown
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowAfterDelay(true);
      }, ADDITIONAL_DELAY_MS);

      // Clean up the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Don't render if not visible from cooldown or if the additional delay hasn't passed
  if (!isVisible || !showAfterDelay) return null;

  return (
    <Suspense>
      <Await resolve={globalNewsletterPopupPromise}>
        {(data) =>
          data?.globalNewsletterPopup?.display?.value === 'true' && (
            <div className="relative z-50">
              {/* overlay for mobile only */}
              <div
                className="block md:hidden fixed inset-0 bg-default-grey/40"
                onClick={() => setIsVisible(false)}
              />
              <div className="fixed inset-4 top-1/2 -translate-y-1/2 md:top-auto md:translate-y-0 md:inset-auto md:bottom-8 md:right-8 w-auto md:w-[310px] h-fit bg-background rounded-xl overflow-clip">
                <div className="relative">
                  <Image
                    data={
                      data?.globalNewsletterPopup?.image?.reference?.image ??
                      undefined
                    }
                    width={310}
                    height={210}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setIsVisible(false)}
                    aria-label="Close newsletter popup"
                  >
                    <X size={12} />
                  </Button>
                </div>
                <div className="py-6 px-4 space-y-5">
                  <div>
                    <p className="typo-body-l">
                      {data?.globalNewsletterPopup?.title?.value}
                    </p>
                    <p className="text-neutral-900">
                      {data?.globalNewsletterPopup?.description?.value}
                    </p>
                  </div>
                  <fetcher.Form
                    method="POST"
                    action="/newsletter/subscribe"
                    className="space-y-2"
                  >
                    {isSuccess ? (
                      <div className="flex items-center justify-center gap-2 p-2 bg-green-50 text-green-700 rounded">
                        <CheckCircle size={12} />
                        <span className="typo-caption-responsive">
                          Thank you for subscribing!
                        </span>
                      </div>
                    ) : (
                      <input
                        name="email"
                        placeholder="Your email"
                        required
                        className="w-full h-[34px] border text-center typo-caption-responsive-uppercase"
                      />
                    )}
                    {isError && (
                      <div className="flex items-center justify-center gap-2 text-orange">
                        <AlertCircle size={10} />
                        <span className="typo-caption-responsive-uppercase">
                          {errorMessage ||
                            'Subscription failed. Please try again.'}
                        </span>
                      </div>
                    )}
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-none w-full"
                      disabled={isSuccess || isLoading}
                    >
                      {isLoading && (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="typo-caption-responsive-uppercase">
                            SUBMITTING...
                          </span>
                        </>
                      )}
                      <span className="typo-caption-responsive-uppercase">
                        {isSuccess && 'SUBSCRIBED'}
                        {!isLoading &&
                          !isSuccess &&
                          !isError &&
                          'SUBSCRIBE NOW'}
                        {isError && !isLoading && 'TRY AGAIN'}
                      </span>
                    </Button>
                  </fetcher.Form>
                  <p className="typo-caption-responsive text-mid-grey">
                    {data?.globalNewsletterPopup?.caption?.value}
                  </p>
                </div>
              </div>
            </div>
          )
        }
      </Await>
    </Suspense>
  );
}

export default NewsletterPopup;
