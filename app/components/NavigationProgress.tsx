import {useNavigation} from 'react-router';
import {cn} from '~/lib/utils';

/**
 * A slim indeterminate progress bar pinned to the very top of the viewport,
 * shown whenever a client-side navigation (tab switch, card click, any
 * Link/NavLink) is in flight. React Router doesn't unmount the current page
 * until the next route's loader resolves, so without this, a slow loader
 * (account/rewards pages hit several external APIs) just leaves the screen
 * looking frozen with no feedback that the click registered.
 */
export function NavigationProgress() {
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';

  return (
    <div
      aria-hidden="true"
      className={cn(
        'fixed inset-x-0 top-0 z-[60] h-[3px] overflow-hidden bg-transparent transition-opacity duration-200',
        isLoading ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div className="nav-progress-bar h-full w-1/3 bg-mint" />
    </div>
  );
}
