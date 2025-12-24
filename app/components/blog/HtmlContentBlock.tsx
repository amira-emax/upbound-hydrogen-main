import {useEffect, useState} from 'react';
import parse, {
  attributesToProps,
  DOMNode,
  domToReact,
  Element,
  HTMLReactParserOptions,
} from 'html-react-parser';

interface HtmlContentBlockProps {
  contentHtml?: string;
  variant?: 'blog' | 'policy' | 'founder';
}

export default function HtmlContentBlock({
  contentHtml,
  variant = 'blog',
}: HtmlContentBlockProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!contentHtml) return null;

  // skeleton when not yet mount
  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-default-grey rounded w-3/4"></div>
        <div className="h-4 bg-default-grey rounded w-full"></div>
        <div className="h-4 bg-default-grey rounded w-5/6"></div>
        <div className="h-4 bg-default-grey rounded w-2/3"></div>
        <div className="h-32 bg-default-grey rounded w-full my-4"></div>
        <div className="h-4 bg-default-grey rounded w-full"></div>
        <div className="h-4 bg-default-grey rounded w-4/5"></div>
      </div>
    );
  }

  // Define options for HTML parsing based on variant
  const getBlogOptions = (): HTMLReactParserOptions => ({
    replace: (domNode) => {
      if (domNode instanceof Element) {
        // Handle images
        if (domNode.name === 'img') {
          const props = attributesToProps(domNode.attribs);

          return (
            <img
              {...props}
              className="w-full h-auto rounded-lg mb-[24px] md:mb-[48px]"
            />
          );
        }

        // Handle heading 1
        if (domNode.name === 'h1') {
          return (
            <h1 className="mb-[24px] md:mb-[48px]">
              {domToReact(domNode.children as DOMNode[], getPolicyOptions())}
            </h1>
          );
        }

        // Handle heading 5
        if (domNode.name === 'h5') {
          return (
            <h5 className="typo-p-large mb-[12px] md:mb-[24px]">
              {domToReact(domNode.children as DOMNode[], getPolicyOptions())}
            </h5>
          );
        }

        // Handle table elements
        if (domNode.name === 'table') {
          return (
            <div className="overflow-x-auto mb-[24px] md:mb-[48px]">
              <table className="w-full border-separate md:border-spacing-4">
                {domToReact(domNode.children as DOMNode[], getBlogOptions())}
              </table>
            </div>
          );
        }

        // Handle table header
        if (domNode.name === 'thead') {
          return (
            <thead>
              {domToReact(domNode.children as DOMNode[], getBlogOptions())}
            </thead>
          );
        }

        // Handle table body
        if (domNode.name === 'tbody') {
          return (
            <tbody>
              {domToReact(domNode.children as DOMNode[], getBlogOptions())}
            </tbody>
          );
        }

        // Handle table row
        if (domNode.name === 'tr') {
          return (
            <tr>
              {domToReact(domNode.children as DOMNode[], getBlogOptions())}
            </tr>
          );
        }

        // Handle table header cell
        if (domNode.name === 'th') {
          const props = attributesToProps(domNode.attribs);
          return (
            <th {...props} className="text-left font-semibold text-gray-900">
              {domToReact(domNode.children as DOMNode[], getBlogOptions())}
            </th>
          );
        }

        // Handle table data cell
        if (domNode.name === 'td') {
          const props = attributesToProps(domNode.attribs);
          return (
            <td className="block md:table-cell mb-[24px] md:mb-0">
              {domToReact(domNode.children as DOMNode[], {
                ...getBlogOptions(),
                replace: (childNode) => {
                  if (
                    childNode instanceof Element &&
                    childNode.name === 'img'
                  ) {
                    const childProps = attributesToProps(childNode.attribs);
                    return (
                      <img
                        {...childProps}
                        className="w-full h-auto rounded-lg !m-0 !p-0"
                      />
                    );
                  }
                  return undefined;
                },
              })}
            </td>
          );
        }

        // Handle anchor tags
        if (domNode.name === 'a') {
          const props = attributesToProps(domNode.attribs);
          const href = props.href as string | undefined;
          const isExternalLink =
            href && typeof href === 'string' && href.startsWith('http');

          return (
            <a
              {...props}
              className="text-primary hover:text-primary-dark underline transition-colors inline-flex items-center"
              target={isExternalLink ? '_blank' : undefined}
              rel={isExternalLink ? 'noopener noreferrer' : undefined}
            >
              {domToReact(domNode.children as DOMNode[], {
                ...getBlogOptions(),
                replace: (childNode) => {
                  if (
                    childNode instanceof Element &&
                    childNode.name === 'svg'
                  ) {
                    const childProps = attributesToProps(childNode.attribs);
                    return (
                      <svg
                        {...childProps}
                        className={`${childProps.className || ''} inline-block align-middle`}
                      >
                        {domToReact(
                          childNode.children as DOMNode[],
                          getBlogOptions(),
                        )}
                      </svg>
                    );
                  }
                  return undefined;
                },
              })}
            </a>
          );
        }

        // Handle paragraphs
        if (domNode.name === 'p') {
          const props = attributesToProps(domNode.attribs);

          // Regular paragraph
          return (
            <p className="typo-p-small mb-[12px] md:mb-[24px]" {...props}>
              {domToReact(domNode.children as DOMNode[], getBlogOptions())}
            </p>
          );
        }
      }
    },
  });

  // Policy variant options
  const getPolicyOptions = (): HTMLReactParserOptions => ({
    replace: (domNode) => {
      if (domNode instanceof Element) {
        // Handle headings
        if (domNode.name === 'h1') {
          return (
            <h1 className="mb-12 text-center">
              {domToReact(domNode.children as DOMNode[], getPolicyOptions())}
            </h1>
          );
        }

        if (domNode.name === 'h2' || domNode.name === 'h3') {
          return (
            <h2 className="mb-4 mt-8">
              {domToReact(domNode.children as DOMNode[], getPolicyOptions())}
            </h2>
          );
        }

        // Handle anchor tags
        if (domNode.name === 'a') {
          const props = attributesToProps(domNode.attribs);
          const href = props.href as string | undefined;
          const isExternalLink =
            href && typeof href === 'string' && href.startsWith('http');

          return (
            <a
              {...props}
              className="text-primary hover:text-primary-dark underline transition-colors inline-flex items-center"
              target={isExternalLink ? '_blank' : undefined}
              rel={isExternalLink ? 'noopener noreferrer' : undefined}
            >
              {domToReact(domNode.children as DOMNode[], {
                ...getPolicyOptions(),
                replace: (childNode) => {
                  if (
                    childNode instanceof Element &&
                    childNode.name === 'svg'
                  ) {
                    const childProps = attributesToProps(childNode.attribs);
                    return (
                      <svg
                        {...childProps}
                        className={`${childProps.className || ''} inline-block align-middle`}
                      >
                        {domToReact(
                          childNode.children as DOMNode[],
                          getPolicyOptions(),
                        )}
                      </svg>
                    );
                  }
                  return undefined;
                },
              })}
            </a>
          );
        }

        // Handle paragraphs
        if (domNode.name === 'p') {
          const props = attributesToProps(domNode.attribs);

          return (
            <p className="typo-p-small mb-[12px] md:mb-[24px]" {...props}>
              {domToReact(domNode.children as DOMNode[], getPolicyOptions())}
            </p>
          );
        }

        // Handle unordered lists
        if (domNode.name === 'ul') {
          return (
            <ul className="list-disc pl-6 mb-6">
              {domToReact(domNode.children as DOMNode[], getPolicyOptions())}
            </ul>
          );
        }

        // Handle list items
        if (domNode.name === 'li') {
          return (
            <li className="text-base leading-relaxed">
              {domToReact(domNode.children as DOMNode[], getPolicyOptions())}
            </li>
          );
        }
      }
      return undefined;
    },
  });

  const getFounderOptions = (): HTMLReactParserOptions => ({
    replace: (domNode) => {
      if (domNode instanceof Element) {
        // Handle images
        if (domNode.name === 'img') {
          const props = attributesToProps(domNode.attribs);

          return (
            <img
              {...props}
              className="w-full h-auto rounded-lg mb-[24px] md:mb-[48px]"
            />
          );
        }

        // Handle heading 1
        if (domNode.name === 'h1') {
          return (
            <h1 className="mb-[24px] md:mb-[48px]">
              {domToReact(domNode.children as DOMNode[], getPolicyOptions())}
            </h1>
          );
        }

        // Handle heading 5
        if (domNode.name === 'h5') {
          return (
            <h5 className="typo-p-large mb-[12px] md:mb-[24px]">
              {domToReact(domNode.children as DOMNode[], getPolicyOptions())}
            </h5>
          );
        }

        // Handle table elements
        if (domNode.name === 'table') {
          return (
            <div className="overflow-x-auto mb-[24px] md:mb-[48px]">
              <table className="w-full border-separate border-spacing-4">
                {domToReact(domNode.children as DOMNode[], getBlogOptions())}
              </table>
            </div>
          );
        }

        // Handle table header
        if (domNode.name === 'thead') {
          return (
            <thead>
              {domToReact(domNode.children as DOMNode[], getBlogOptions())}
            </thead>
          );
        }

        // Handle table body
        if (domNode.name === 'tbody') {
          return (
            <tbody>
              {domToReact(domNode.children as DOMNode[], getBlogOptions())}
            </tbody>
          );
        }

        // Handle table row
        if (domNode.name === 'tr') {
          return (
            <tr>
              {domToReact(domNode.children as DOMNode[], getBlogOptions())}
            </tr>
          );
        }

        // Handle table header cell
        if (domNode.name === 'th') {
          const props = attributesToProps(domNode.attribs);
          return (
            <th {...props} className="text-left font-semibold text-gray-900">
              {domToReact(domNode.children as DOMNode[], getBlogOptions())}
            </th>
          );
        }

        // Handle table data cell
        if (domNode.name === 'td') {
          const props = attributesToProps(domNode.attribs);
          return (
            <td {...props}>
              {domToReact(domNode.children as DOMNode[], {
                ...getBlogOptions(),
                replace: (childNode) => {
                  if (
                    childNode instanceof Element &&
                    childNode.name === 'img'
                  ) {
                    const childProps = attributesToProps(childNode.attribs);
                    return (
                      <img
                        {...childProps}
                        className="w-full h-auto rounded-lg !m-0 !p-0"
                      />
                    );
                  }
                  return undefined;
                },
              })}
            </td>
          );
        }

        // Handle anchor tags
        if (domNode.name === 'a') {
          const props = attributesToProps(domNode.attribs);
          const href = props.href as string | undefined;
          const isExternalLink =
            href && typeof href === 'string' && href.startsWith('http');

          return (
            <a
              {...props}
              className="text-primary hover:text-primary-dark underline transition-colors inline-flex items-center"
              target={isExternalLink ? '_blank' : undefined}
              rel={isExternalLink ? 'noopener noreferrer' : undefined}
            >
              {domToReact(domNode.children as DOMNode[], {
                ...getFounderOptions(),
                replace: (childNode) => {
                  if (
                    childNode instanceof Element &&
                    childNode.name === 'svg'
                  ) {
                    const childProps = attributesToProps(childNode.attribs);
                    return (
                      <svg
                        {...childProps}
                        className={`${childProps.className || ''} inline-block align-middle`}
                      >
                        {domToReact(
                          childNode.children as DOMNode[],
                          getFounderOptions(),
                        )}
                      </svg>
                    );
                  }
                  return undefined;
                },
              })}
            </a>
          );
        }

        // Handle paragraphs
        if (domNode.name === 'p') {
          const props = attributesToProps(domNode.attribs);

          // Regular paragraph
          return (
            <p className="mb-[12px] md:mb-[24px]" {...props}>
              {domToReact(domNode.children as DOMNode[], getBlogOptions())}
            </p>
          );
        }
      }
    },
  });

  // Select the appropriate options based on variant
  let options: HTMLReactParserOptions;

  switch (variant) {
    case 'policy':
      options = getPolicyOptions();
      break;
    case 'founder':
      options = getFounderOptions();
      break;
    case 'blog':
    default:
      options = getBlogOptions();
      break;
  }

  return (
    <div className={variant === 'policy' ? 'policy-content' : 'blog-content'}>
      {parse(contentHtml, options)}
    </div>
  );
}
