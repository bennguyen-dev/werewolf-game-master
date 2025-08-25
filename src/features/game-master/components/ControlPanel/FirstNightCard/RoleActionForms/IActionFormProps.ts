import { IRole } from '@/game-core/roles/IRole';
import { IUseGameReturn } from '@/hooks/useGame';

export interface IActionFormProps {
  game: IUseGameReturn;
  onComplete: () => void;
  selectedPlayerIds: string[];
  setSelectedPlayerIds: (ids: string[]) => void;
  currentRole: IRole;
}
