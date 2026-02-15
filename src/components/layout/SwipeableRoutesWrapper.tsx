import { useSwipeable } from "react-swipeable";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const SWIPE_ROUTES = ["/", "/routines", "/exercises", "/history", "/measurements"];

export function SwipeableRoutesWrapper() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = SWIPE_ROUTES.indexOf(location.pathname);
  const isSwipeEnabled = currentIndex !== -1;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (isSwipeEnabled && currentIndex < SWIPE_ROUTES.length - 1) {
        navigate(SWIPE_ROUTES[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (isSwipeEnabled && currentIndex > 0) {
        navigate(SWIPE_ROUTES[currentIndex - 1]);
      }
    },
    trackMouse: true,
    delta: 50,
    preventScrollOnSwipe: false,
  });

  return (
    <div {...handlers} className="flex-1 min-h-0">
      <Outlet />
    </div>
  );
}
