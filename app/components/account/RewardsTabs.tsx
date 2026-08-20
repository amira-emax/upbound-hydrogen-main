import {NavLink} from 'react-router';

function isActiveStyle({isActive}: {isActive: boolean; isPending: boolean}) {
  return {
    color: isActive ? 'black' : undefined,
  };
}

/**
 * Small local sub-nav shared by the two Rewards pages ("My Rewards" and
 * "Available Vouchers"), mirroring the NavLink/isActiveStyle idiom used by
 * the main account menu in ($locale).account.tsx.
 */
export function RewardsTabs() {
  return (
    <nav role="navigation" className="flex gap-6 border-b border-neutral-400 pb-3 mb-6">
      <NavLink to="/account/rewards" end style={isActiveStyle} className="typo-body-l text-mid-grey">
        My Rewards
      </NavLink>
      <NavLink to="/account/rewards/available" style={isActiveStyle} className="typo-body-l text-mid-grey">
        Available Vouchers
      </NavLink>
    </nav>
  );
}
