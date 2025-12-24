import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import type {RegularSearchReturn} from '~/lib/search';
import {cn} from '~/lib/utils';
import {SearchResults} from './SearchResults';
import {Button} from './ui/button';

interface HeaderSearchProps {
  className?: string;
  viewport: 'desktop' | 'mobile';
  onSearchOpenChange?: (isOpen: boolean) => void;
}

export default function HeaderSearch({
  className,
  viewport,
  onSearchOpenChange,
}: HeaderSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [lastSearchedTerm, setLastSearchedTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher<RegularSearchReturn>();

  // Memoized handlers
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onSearchOpenChange?.(false);
      }
    },
    [onSearchOpenChange],
  );

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
        onSearchOpenChange?.(false);
      }
    },
    [onSearchOpenChange],
  );

  // Combined effect for debouncing and search execution
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);

      // Perform search if conditions are met
      if (searchTerm.trim() && isOpen && searchTerm !== lastSearchedTerm) {
        fetcher.load(`/search?q=${encodeURIComponent(searchTerm)}`);
        setLastSearchedTerm(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, lastSearchedTerm, fetcher]);

  // Combined effect for event listeners and focus management
  useEffect(() => {
    if (isOpen) {
      // Focus input
      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Add event listeners
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, handleClickOutside, handleEscape]);

  const toggleSearch = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onSearchOpenChange?.(newIsOpen);

    if (newIsOpen) {
      setSearchTerm('');
      setLastSearchedTerm('');
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  //   const handleSubmit = useCallback((e: React.FormEvent) => {
  //     e.preventDefault();
  //     if (searchTerm.trim()) {
  //       // Navigate to full search page
  //       window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
  //     }
  //   }, [searchTerm]);

  // Memoized computed values
  const searchState = useMemo(() => {
    const searchData = fetcher.data;
    const isLoading = fetcher.state === 'loading';
    const hasResults = searchData?.result?.total && searchData.result.total > 0;
    const showResults =
      isOpen && debouncedTerm.trim() && (hasResults || !isLoading);

    return {
      searchData,
      isLoading,
      hasResults,
      showResults,
    };
  }, [fetcher.data, fetcher.state, isOpen, debouncedTerm]);

  const {searchData, isLoading, hasResults, showResults} = searchState;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Search Container with Animation */}
      <div
        className={cn(
          'relative flex items-center',
          viewport === 'mobile' && 'justify-center',
        )}
      >
        {/* Search Toggle Button */}
        {viewport === 'mobile' ? (
          <Button
            size="lg"
            variant="link"
            onClick={toggleSearch}
            className={cn(
              'transition-all duration-300 ease-in-out',
              isOpen
                ? 'transform -translate-x-full opacity-0 pointer-events-none'
                : 'transform translate-x-0 opacity-100',
            )}
          >
            <h1>Search</h1>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="glass-default"
            onClick={toggleSearch}
            className={cn(
              'transition-all duration-300 ease-in-out',
              isOpen
                ? 'transform -translate-x-full opacity-0 pointer-events-none'
                : 'transform translate-x-0 opacity-100',
            )}
          >
            Search
          </Button>
        )}
        {/* Animated Search Input */}
        <div
          className={cn(
            'absolute transition-all duration-300 ease-in-out',
            viewport === 'desktop' ? 'right-0' : 'right-1/2 translate-x-1/2',
            isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden',
          )}
        >
          <div className="relative">
            <input
              ref={inputRef}
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-transparent bg-white"
            />
            {/* Close button */}
            <button
              type="button"
              onClick={toggleSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-100 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-full md:w-96 bg-white rounded-lg shadow-xl border border-neutral-200 z-50 p-6 typo-p text-mid-grey">
          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {showResults && searchData && hasResults ? (
              <SearchResults result={searchData.result} term={debouncedTerm}>
                {({articles, pages, products, term}) => (
                  <div className="space-y-4">
                    {/* Products */}
                    {products?.nodes?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-600 mb-2">
                          Products
                        </h3>
                        <div className="space-y-2">
                          {products.nodes.slice(0, 3).map((product) => (
                            <a
                              key={product.id}
                              href={`/products/${product.handle}`}
                              className="flex items-center gap-3 p-2 rounded hover:bg-neutral-50 transition-colors"
                              onClick={() => {
                                setIsOpen(false);
                                onSearchOpenChange?.(false);
                              }}
                            >
                              {product.selectedOrFirstAvailableVariant
                                ?.image && (
                                <img
                                  src={
                                    product.selectedOrFirstAvailableVariant
                                      .image.url
                                  }
                                  alt={
                                    product.selectedOrFirstAvailableVariant
                                      .image.altText || product.title
                                  }
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">
                                  {product.title}
                                </p>
                                {product.selectedOrFirstAvailableVariant
                                  ?.price && (
                                  <p className="text-sm text-neutral-600">
                                    $
                                    {
                                      product.selectedOrFirstAvailableVariant
                                        .price.amount
                                    }
                                  </p>
                                )}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Articles */}
                    {articles?.nodes?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-600 mb-2">
                          Articles
                        </h3>
                        <div className="space-y-2">
                          {articles.nodes.slice(0, 2).map((article) => (
                            <a
                              key={article.id}
                              href={`/blogs/journal/${article.handle}`}
                              className="block p-2 rounded hover:bg-neutral-50 transition-colors"
                              onClick={() => {
                                setIsOpen(false);
                                onSearchOpenChange?.(false);
                              }}
                            >
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {article.title}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pages */}
                    {pages?.nodes?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-600 mb-2">
                          Pages
                        </h3>
                        <div className="space-y-2">
                          {pages.nodes.slice(0, 2).map((page) => (
                            <a
                              key={page.id}
                              href={`/pages/${page.handle}`}
                              className="block p-2 rounded hover:bg-neutral-50 transition-colors"
                              onClick={() => {
                                setIsOpen(false);
                                onSearchOpenChange?.(false);
                              }}
                            >
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {page.title}
                              </p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* See All Results Link */}
                    <div className="pt-2 border-t border-neutral-200">
                      <a
                        href={`/search?q=${encodeURIComponent(term)}`}
                        className="block text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                        onClick={() => {
                          setIsOpen(false);
                          onSearchOpenChange?.(false);
                        }}
                      >
                        See all results for "{term}"
                      </a>
                    </div>
                  </div>
                )}
              </SearchResults>
            ) : debouncedTerm.trim() && !isLoading && !hasResults ? (
              <div className="text-center">
                <p>No results found for "{debouncedTerm}"</p>
              </div>
            ) : debouncedTerm.trim() === '' && !isLoading ? (
              <div className="text-center">
                <p>Start typing to search...</p>
              </div>
            ) : isLoading ? (
              <div className="text-center flex items-center gap-2 justify-center">
                <div className="animate-spin h-3 w-3 border-2 border-neutral border-t-primary rounded-full" />
                <p>Searching...</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
