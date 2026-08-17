import { useNavigate } from "react-router-dom";
import { GymDirectoryExplorer, gymDirectoryPageHeightClass } from "@/components/gym/GymDirectoryExplorer";
import { useGlobalWorkoutDrawer } from "@/hooks/useGlobalWorkoutDrawer";

export default function Gyms() {
  const navigate = useNavigate();
  const { openNew } = useGlobalWorkoutDrawer();

  return (
    <div className={gymDirectoryPageHeightClass}>
      <GymDirectoryExplorer
        onGymAction={(gym) => {
          openNew(undefined, gym);
          navigate("/");
        }}
      />
    </div>
  );
}
