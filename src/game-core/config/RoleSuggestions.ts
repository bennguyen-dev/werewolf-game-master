import { RoleName } from '@/game-core/types/enums';

export type RoleSetup = {
  [key in RoleName]?: number;
};

export interface SuggestedSetup {
  name: string;
  description: string;
  setup: RoleSetup;
}

export type GameType = 'balanced' | 'chaos';

export const gameTypeNames: Record<GameType, string> = {
  balanced: 'Cân Bằng',
  chaos: 'Hỗn Loạn',
};

const suggestions: Record<GameType, Record<number, SuggestedSetup[]>> = {
  balanced: {
    6: [
      {
        name: 'Nhập môn',
        description: 'Ít vai trò, tập trung vào suy luận cơ bản.',
        setup: {
          [RoleName.Werewolf]: 1,
          [RoleName.Seer]: 1,
          [RoleName.Villager]: 4,
        },
      },
    ],
    7: [
      {
        name: 'Bắt đầu',
        description: 'Thêm 1 Sói để tăng độ khó.',
        setup: {
          [RoleName.Werewolf]: 2,
          [RoleName.Seer]: 1,
          [RoleName.Villager]: 4,
        },
      },
    ],
    8: [
      {
        name: 'Tiêu chuẩn',
        description: 'Một trận đấu cân bằng cho người mới bắt đầu.',
        setup: {
          [RoleName.Werewolf]: 2,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Villager]: 4,
        },
      },
    ],
    9: [
      {
        name: 'Tiêu chuẩn 9 người',
        description: 'Thêm Phù thủy để phe dân mạnh hơn.',
        setup: {
          [RoleName.Werewolf]: 2,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Villager]: 4,
        },
      },
    ],
    10: [
      {
        name: 'Hội Sói săn',
        description: 'Thêm Thợ săn và Sói thứ 3.',
        setup: {
          [RoleName.Werewolf]: 3,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Hunter]: 1,
          [RoleName.Villager]: 3,
        },
      },
    ],
    11: [
      {
        name: 'Tiêu chuẩn 11 người',
        description: '3 Sói và các vai trò bảo vệ/thông tin quan trọng.',
        setup: {
          [RoleName.Werewolf]: 3,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Villager]: 5,
        },
      },
    ],
    12: [
      {
        name: 'Kinh điển',
        description: 'Một trong những cấu hình phổ biến nhất cho 12 người.',
        setup: {
          [RoleName.Werewolf]: 3,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Hunter]: 1,
          [RoleName.Cupid]: 1,
          [RoleName.Villager]: 4,
        },
      },
    ],
    13: [
      {
        name: 'Mở rộng',
        description: 'Thêm Dân làng để cân bằng.',
        setup: {
          [RoleName.Werewolf]: 3,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Hunter]: 1,
          [RoleName.Cupid]: 1,
          [RoleName.Villager]: 5,
        },
      },
    ],
    14: [
      {
        name: 'Thêm Sói',
        description: 'Tăng số Sói để tăng thử thách.',
        setup: {
          [RoleName.Werewolf]: 4,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Hunter]: 1,
          [RoleName.Villager]: 5,
        },
      },
    ],
    15: [
      {
        name: 'Đại chiến',
        description: '4 Sói và các vai trò quan trọng.',
        setup: {
          [RoleName.Werewolf]: 4,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Hunter]: 1,
          [RoleName.Cupid]: 1,
          [RoleName.Villager]: 6,
        },
      },
    ],
    16: [
      {
        name: 'Siêu kinh điển',
        description: 'Cấu hình đầy đủ cho một trận đấu lớn.',
        setup: {
          [RoleName.Werewolf]: 4,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Hunter]: 1,
          [RoleName.Cupid]: 1,
          [RoleName.Villager]: 7,
        },
      },
    ],
    17: [
      {
        name: 'Trận chiến lớn',
        description: 'Thêm dân làng để cân bằng cho 4 sói',
        setup: {
          [RoleName.Werewolf]: 4,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Hunter]: 1,
          [RoleName.Cupid]: 1,
          [RoleName.Villager]: 8,
        },
      },
    ],
    18: [
      {
        name: 'Bầy sói đông đảo',
        description: '5 sói cho những cuộc đi săn khốc liệt.',
        setup: {
          [RoleName.Werewolf]: 5,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Hunter]: 1,
          [RoleName.Cupid]: 1,
          [RoleName.Villager]: 8,
        },
      },
    ],
    19: [
      {
        name: 'Ngôi làng lớn',
        description: 'Thêm dân làng để cân bằng cho bầy sói 5 con.',
        setup: {
          [RoleName.Werewolf]: 5,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Hunter]: 1,
          [RoleName.Cupid]: 1,
          [RoleName.Villager]: 9,
        },
      },
    ],
    20: [
      {
        name: 'Đại hỗn chiến',
        description: 'Một trận đấu lớn với đầy đủ các vai trò.',
        setup: {
          [RoleName.Werewolf]: 5,
          [RoleName.Seer]: 1,
          [RoleName.Bodyguard]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Hunter]: 1,
          [RoleName.Cupid]: 1,
          [RoleName.Villager]: 10,
        },
      },
    ],
  },
  chaos: {
    8: [
      {
        name: 'Hỗn loạn',
        description: 'Thêm Phù thủy để tăng thêm phần kịch tính.',
        setup: {
          [RoleName.Werewolf]: 2,
          [RoleName.Seer]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Villager]: 4,
        },
      },
    ],
    10: [
      {
        name: 'Tình yêu & Thù hận',
        description: 'Thêm Cupid cho những mối quan hệ phức tạp.',
        setup: {
          [RoleName.Werewolf]: 2,
          [RoleName.Seer]: 1,
          [RoleName.Witch]: 1,
          [RoleName.Cupid]: 1,
          [RoleName.Villager]: 5,
        },
      },
    ],
    12: [
      {
        name: 'Yêu đương mù quáng',
        description: 'Cupid có thể tạo ra một phe thứ ba khó lường.',
        setup: {
          [RoleName.Werewolf]: 3,
          [RoleName.Seer]: 1,
          [RoleName.Cupid]: 1,
          [RoleName.Villager]: 7,
        },
      },
    ],
  },
};

/**
 * Lấy danh sách các cấu hình vai trò được đề xuất.
 * @param playerCount - Tổng số người chơi.
 * @param gameType - Thể loại ván chơi.
 * @returns Một mảng các cấu hình được đề xuất, hoặc một mảng rỗng nếu không có gợi ý.
 */
export function getSuggestedRoleSetups(
  playerCount: number,
  gameType: GameType,
): SuggestedSetup[] {
  const setupsForGameType = suggestions[gameType];
  if (!setupsForGameType || Object.keys(setupsForGameType).length === 0) {
    return [];
  }

  // Find the closest player count with a setup if the exact count is not available
  let closestPlayerCount = -1;
  let minDiff = Infinity;

  Object.keys(setupsForGameType).forEach((key) => {
    const count = parseInt(key, 10);
    if (count > playerCount) return; // Only use setups for smaller or equal player counts
    const diff = playerCount - count;
    if (diff < minDiff) {
      minDiff = diff;
      closestPlayerCount = count;
    }
  });

  if (closestPlayerCount !== -1) {
    const suggested = setupsForGameType[closestPlayerCount];
    if (suggested && suggested.length > 0) {
      // Adjust villager count to match the actual player count
      const originalSetup = suggested[0];
      const originalRoleCount = Object.values(originalSetup.setup).reduce(
        (a, b) => a + (b || 0),
        0,
      );
      const villagerCount = originalSetup.setup[RoleName.Villager] || 0;
      const newVillagerCount =
        villagerCount + (playerCount - originalRoleCount);

      const newSetup = {
        ...originalSetup,
        setup: {
          ...originalSetup.setup,
          [RoleName.Villager]: Math.max(0, newVillagerCount),
        },
      };
      // Ensure no roles are undefined
      for (const role in newSetup.setup) {
        if (newSetup.setup[role as RoleName] === undefined) {
          delete newSetup.setup[role as RoleName];
        }
      }
      return [newSetup];
    }
  }

  return [];
}
