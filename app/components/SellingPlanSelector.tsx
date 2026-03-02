import type {
  ProductFragment,
  SellingPlanGroupFragment,
  SellingPlanFragment,
} from 'types/storefrontapi.generated';
import { useMemo } from 'react';
import { useLocation } from 'react-router';

/* Enriched sellingPlan type including isSelected and url */
export type SellingPlan = SellingPlanFragment & {
  isSelected: boolean;
  url: string;
};

/* Enriched sellingPlanGroup type including enriched SellingPlan nodes */
export type SellingPlanGroup = Omit<
  SellingPlanGroupFragment,
  'sellingPlans'
> & {
  sellingPlans: {
    nodes: SellingPlan[];
  };
};

export function SellingPlanSelector({
  sellingPlanGroups,
  selectedSellingPlan,
  children,
  paramKey = 'selling_plan',
  selectedVariant,
}: {
  sellingPlanGroups: ProductFragment['sellingPlanGroups'];
  selectedSellingPlan: SellingPlanFragment | null;
  paramKey?: string;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  children: (params: {
    sellingPlanGroup: SellingPlanGroup;
    selectedSellingPlan: SellingPlanFragment | null;
  }) => React.ReactNode;
}) {
  const { search, pathname } = useLocation();
  const params = new URLSearchParams(search);

  const planAllocationIds: string[] =
    selectedVariant?.sellingPlanAllocations?.nodes?.map(
      (node) => node.sellingPlan.id,
    ) ?? [];

  // 🔥 We removed the `useEffect` auto-select loop here! 
  // We no longer need it because the CartForm uses the local fallback data.

  return useMemo(
    () =>
      (sellingPlanGroups.nodes as SellingPlanGroup[])
        // Filter out groups that don't have plans usable for the selected variant
        .filter((group) => {
          return group.sellingPlans.nodes.some((sellingPlan) =>
            planAllocationIds.includes(sellingPlan.id),
          );
        })
        .map((sellingPlanGroup) => {
          // Augment each sellingPlan node with isSelected and url
          const sellingPlans = sellingPlanGroup.sellingPlans.nodes
            .map((sellingPlan: SellingPlan) => {
              if (!sellingPlan?.id) {
                console.warn(
                  'SellingPlanSelector: sellingPlan.id is missing in the product query',
                );
                return null;
              }

              params.set(paramKey, sellingPlan.id);
              sellingPlan.isSelected =
                selectedSellingPlan?.id === sellingPlan.id;
              sellingPlan.url = `${pathname}?${params.toString()}`;
              return sellingPlan;
            })
            .filter(Boolean) as SellingPlan[];
            
          sellingPlanGroup.sellingPlans.nodes = sellingPlans;
          return children({ sellingPlanGroup, selectedSellingPlan });
        }),
    [
      sellingPlanGroups,
      children,
      selectedSellingPlan,
      paramKey,
      pathname,
      selectedVariant,
      planAllocationIds // Added this to dependencies to keep useMemo happy
    ],
  );
}