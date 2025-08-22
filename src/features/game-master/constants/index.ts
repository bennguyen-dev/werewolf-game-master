import { IGameMasterState } from '@/features/game-master/types';
import { GamePhase } from '@/game-core/types/enums';

export const INITIAL_GM_STATE: IGameMasterState = {
  gameEngine: null,
  currentPhase: GamePhase.Setup,
  selectedPlayers: [],
  activeTimer: null,
  gameHistory: [],
  notes: {},
};

export const PHASE_NAMES: Record<GamePhase, string> = {
  [GamePhase.Setup]: 'Chuẩn bị',
  [GamePhase.Night]: 'Ban đêm',
  [GamePhase.Day_Discuss]: 'Thảo luận ban ngày',
  [GamePhase.Day_Vote]: 'Bỏ phiếu',
  [GamePhase.Day_Defense]: 'Biện hộ',
  [GamePhase.Day_LastWord]: 'Lời cuối',
  [GamePhase.Finished]: 'Kết thúc',
};

export const PHASE_DESCRIPTIONS: Record<GamePhase, string> = {
  [GamePhase.Setup]: 'Thiết lập game và gán vai trò cho người chơi',
  [GamePhase.Night]: 'Các vai trò đặc biệt thực hiện hành động',
  [GamePhase.Day_Discuss]: 'Tất cả người chơi thảo luận và tìm kiếm Ma Sói',
  [GamePhase.Day_Vote]: 'Bỏ phiếu loại bỏ người chơi khả nghi',
  [GamePhase.Day_Defense]: 'Người bị vote cao nhất được biện hộ',
  [GamePhase.Day_LastWord]: 'Lời cuối cùng trước khi bị loại',
  [GamePhase.Finished]: 'Game đã kết thúc',
};
