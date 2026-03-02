import type {
  ProductFragment,
  SellingPlanGroupFragment,
  SellingPlanFragment,
} from 'types/storefrontapi.generated';
import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

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

/**
 * A component that simplifies selecting sellingPlans subscription options
 * @example Example use
 * ```ts
 *   <SellingPlanSelector
 *     sellingPlanGroups={sellingPlanGroups}
 *     selectedSellingPlanId={selectedSellingPlanId}
 *   >
 *     {({sellingPlanGroup}) => ( ...your sellingPlanGroup component )}
 *  </SellingPlanSelector>
 *  ```
 **/
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
  const navigate = useNavigate();

  const planAllocationIds: string[] =
    selectedVariant?.sellingPlanAllocations.nodes.map(
      (node) => node.sellingPlan.id,
    ) ?? [];

  useEffect(() => {
    if (!sellingPlanGroups?.nodes?.length || !selectedVariant) return;

    const planAllocationIds: string[] =
      selectedVariant?.sellingPlanAllocations.nodes.map(
        (node) => node.sellingPlan.id,
      ) ?? [];

    const validGroups = sellingPlanGroups.nodes.filter((group) =>
      group.sellingPlans.nodes.some((sellingPlan) =>
        planAllocationIds.includes(sellingPlan.id),
      ),
    );

    const validPlans = validGroups.flatMap((group) =>
      group.sellingPlans.nodes.filter((plan) =>
        planAllocationIds.includes(plan.id),
      ),
    );

    // 🔥 AUTO SELECT if only 1 plan and nothing selected
    if (validPlans.length === 1 && !selectedSellingPlan) {
      const singlePlan = validPlans[0];

      const newParams = new URLSearchParams(search);
      newParams.set(paramKey, singlePlan.id);

      navigate(`${pathname}?${newParams.toString()}`, {
        replace: true,
        preventScrollReset: true,
      });
    }
  }, [
    sellingPlanGroups,
    selectedVariant,
    selectedSellingPlan,
    navigate,
    pathname,
    search,
    paramKey,
  ]);

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

              if (!sellingPlan.id) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      sellingPlanGroups,
      children,
      selectedSellingPlan,
      paramKey,
      pathname,
      selectedVariant,
    ],
  );
}