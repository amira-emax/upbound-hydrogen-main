import { Suspense, useId, useState, useEffect } from 'react';
import { Await, Link, NavLink } from 'react-router';
import type {
  CartApiQueryFragment,
  FooterMenuCmsQuery,
  FooterQuery,
  GlobalBannerCmsQuery,
  GlobalNewsletterPopupCmsQuery,
  HeaderQuery,
} from 'types/storefrontapi.generated';
import { Aside, useAside } from '~/components/Aside';
import { CartMain } from '~/components/CartMain';
import { Footer } from '~/components/Footer';
import { Header } from '~/components/Header';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import { SearchResultsPredictive } from '~/components/SearchResultsPredictive';
import { useCooldown } from '~/lib/hooks/useCooldown';
import { cn } from '~/lib/utils';
import Banner from './cms/Banner';
import NewsletterPopup from './cms/NewsletterPopup';
import Logo from './icons/Logo';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterMenuCmsQuery | null>;
  header: HeaderQuery;
  globalBanner: Promise<GlobalBannerCmsQuery | null>;
  globalNewsletterPopup: Promise<GlobalNewsletterPopupCmsQuery | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

// Unique key for this component in localStorage
const STORAGE_KEY = 'promo_banner';
// Cooldown period in minutes (10 minutes)
const COOLDOWN_MINUTES = 10;

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  globalBanner,
  globalNewsletterPopup,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  const [isVisible, _] = useCooldown(STORAGE_KEY, COOLDOWN_MINUTES);
  const [isBannerOpened, setIsBannerOpened] = useState(isVisible);

  return (
    <Aside.Provider>
      <IOSSafariScrollFix />
      <CartAside cart={cart} />
      <SearchAside />
      {/* <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} /> */}

      <Banner
        bannerPromise={globalBanner}
        setIsBannerOpened={setIsBannerOpened}
      />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
          isBannerOpened={isBannerOpened}
        />
      )}
      <main className="relative">
        <NavLink
          prefetch="intent"
          to="/"
          end
          className={cn(
            'hidden lg:block fixed left-[50%] translate-x-[-50%] z-10 mix-blend-exclusion',
            isBannerOpened ? 'top-11' : 'top-4',
          )}
        >
          <Logo
            width={112}
            height={34}
            className="text-white w-[112px] h-[34px] "
          />
        </NavLink>
        {children}
        <NewsletterPopup globalNewsletterPopupPromise={globalNewsletterPopup} />
      </main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

// iOS Safari scroll prevention component using PQINA approach
function IOSSafariScrollFix() {
  const { type: asideType } = useAside();

  useEffect(() => {
    // Sync window height for iOS Safari
    function syncHeight() {
      document.documentElement.style.setProperty(
        '--window-inner-height',
        `${window.innerHeight}px`,
      );
    }

    // Initial sync
    syncHeight();

    // Listen for resize events (iOS Safari footer changes)
    window.addEventListener('resize', syncHeight);

    return () => {
      window.removeEventListener('resize', syncHeight);
    };
  }, []);

  useEffect(() => {
    function preventDefault(e: Event) {
      e.preventDefault();
    }

    if (asideType === 'cart') {
      // Add is-locked class to html element
      document.documentElement.classList.add('is-locked');

      // Prevent pointer/touch events on the overlay
      const overlay = document.querySelector('.overlay.expanded');
      if (overlay) {
        overlay.addEventListener('pointermove', preventDefault);
        overlay.addEventListener('touchmove', preventDefault);
      }

      return () => {
        // Remove is-locked class
        document.documentElement.classList.remove('is-locked');

        // Remove event listeners
        if (overlay) {
          overlay.removeEventListener('pointermove', preventDefault);
          overlay.removeEventListener('touchmove', preventDefault);
        }
      };
    }
  }, [asideType]);

  return null;
}

function CartAside({ cart }: { cart: PageLayoutProps['cart'] }) {
  const [quantity, setQuantity] = useState(0);

  return (
    <Aside
      type="cart"
      heading={
        <p>
          CART <span>({quantity})</span>
        </p>
      }
    >
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(resolvedCart) => {
            useEffect(() => {
              setQuantity(resolvedCart?.totalQuantity ?? 0);
            }, [resolvedCart?.totalQuantity]);

            return <CartMain cart={resolvedCart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({ fetchResults, goToSearch, inputRef }) => (
            <>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              <button onClick={goToSearch}>Search</button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({ items, total, term, state, closeSearch }) => {
            const { articles, collections, pages, products, queries } = items;

            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

// function MobileMenuAside({
//   header,
//   publicStoreDomain,
// }: {
//   header: PageLayoutProps['header'];
//   publicStoreDomain: PageLayoutProps['publicStoreDomain'];
// }) {
//   const [isSearchOpen, setIsSearchOpen] = useState(false);

//   return (
//     header.menu &&
//     header.shop.primaryDomain?.url && (
//       <Aside type="mobile" heading="MENU">
//         <div className="my-6 space-y-4">
//           {/* Only show HeaderMenu when search is not open with animation */}
//           <motion.div
//             initial={{opacity: 0, height: 'auto'}}
//             animate={{
//               opacity: isSearchOpen ? 0 : 1,
//               height: isSearchOpen ? 0 : 'auto',
//             }}
//             exit={{opacity: 0, height: 'auto'}}
//             transition={{duration: 0.3, ease: 'easeInOut'}}
//           >
//             <HeaderMenu
//               menu={header.menu}
//               viewport="mobile"
//               primaryDomainUrl={header.shop.primaryDomain.url}
//               publicStoreDomain={publicStoreDomain}
//             />
//           </motion.div>
//           <motion.div
//             animate={{
//               y: isSearchOpen ? -20 : 0,
//               transition: {
//                 type: 'spring',
//                 stiffness: 120,
//                 damping: 6,
//               },
//             }}
//           >
//             <HeaderSearch
//               viewport="mobile"
//               onSearchOpenChange={setIsSearchOpen}
//             />
//           </motion.div>
//         </div>
//       </Aside>
//     )
//   );
// }
