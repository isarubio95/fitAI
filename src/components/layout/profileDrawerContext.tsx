import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ProfileDrawerContextValue = {
  open: boolean;
  targetUserId: string | null;
  openMyProfile: () => void;
  openUserProfile: (userId: string) => void;
  onOpenChange: (open: boolean) => void;
};

const ProfileDrawerContext = createContext<ProfileDrawerContextValue | null>(null);

export function useProfileDrawer() {
  const ctx = useContext(ProfileDrawerContext);
  if (!ctx) {
    throw new Error("useProfileDrawer debe usarse dentro de ProfileDrawerProvider");
  }
  return ctx;
}

export function ProfileDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const openMyProfile = useCallback(() => {
    setTargetUserId(null);
    setOpen(true);
  }, []);

  const openUserProfile = useCallback((userId: string) => {
    setTargetUserId(userId);
    setOpen(true);
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setTargetUserId(null);
  }, []);

  const value = useMemo(
    () => ({
      open,
      targetUserId,
      openMyProfile,
      openUserProfile,
      onOpenChange,
    }),
    [open, targetUserId, openMyProfile, openUserProfile, onOpenChange],
  );

  return <ProfileDrawerContext.Provider value={value}>{children}</ProfileDrawerContext.Provider>;
}
