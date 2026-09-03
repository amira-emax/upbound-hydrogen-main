import type {RewardsSummary} from '~/lib/rewards';

export function RewardsSummaryCard({
  points,
  tier,
  nextTier,
  nextTierAt,
  tierMaxPoints,
  expiredMembershipDate,
}: RewardsSummary) {
  const remaining = nextTierAt ? Math.max(nextTierAt - points, 0) : null;
  // Progress toward the current tier's ceiling (points / tier.max_points).
  // Top tier has no max_points, so there's nothing to show a ratio against.
  const progressPercent = tierMaxPoints
    ? Math.min((points / tierMaxPoints) * 100, 100)
    : null;
  const expiryLabel = expiredMembershipDate
    ? new Date(expiredMembershipDate).toLocaleDateString()
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="typo-caption-responsive text-mid-grey">Your Points</p>
          <p className="typo-h2">{points.toLocaleString()}</p>
        </div>
        <div className="text-right space-y-1.5">
          <p className="typo-caption-responsive text-mid-grey">Current Tier</p>
          <span className="inline-block rounded-full bg-mint px-4 py-1 typo-caption-responsive uppercase tracking-wide text-black">
            {tier}
          </span>
          {expiryLabel && (
            <p className="typo-caption-responsive text-mid-grey">
              Valid until {expiryLabel}
            </p>
          )}
        </div>
      </div>
      {progressPercent !== null && (
        <div
          className="h-1 w-full bg-neutral-200"
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress toward ${nextTier ?? 'next tier'}`}
        >
          <div
            className="h-full bg-black"
            style={{width: `${progressPercent}%`}}
          />
        </div>
      )}
      {nextTier && remaining !== null && (
        <p className="typo-caption-responsive text-mid-grey">
          {remaining.toLocaleString()} more points to reach {nextTier}
        </p>
      )}
    </div>
  );
}
