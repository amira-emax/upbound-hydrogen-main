import type {RewardsSummary} from '~/lib/rewards';

export function RewardsSummaryCard({points, tier, nextTier, nextTierAt}: RewardsSummary) {
  const remaining = nextTierAt ? Math.max(nextTierAt - points, 0) : null;

  return (
    <div className="border border-neutral-400 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="typo-caption-responsive text-mid-grey">Your points</p>
          <p className="typo-h2">{points.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="typo-caption-responsive text-mid-grey">Current tier</p>
          <p className="typo-body-l">{tier}</p>
        </div>
      </div>
      {nextTier && remaining !== null && (
        <p className="typo-caption-responsive text-mid-grey">
          {remaining.toLocaleString()} more points to reach {nextTier}
        </p>
      )}
    </div>
  );
}
