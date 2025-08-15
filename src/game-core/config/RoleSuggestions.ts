import { RoleName } from '@/game-core/types/enums';

export type RoleSetup = {
  [key in RoleName]?: number;
};

export interface SuggestedSetup {
  name: string;
  description: string;
  setup: RoleSetup;
}

const suggestions: Record<number, SuggestedSetup[]> = {
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
      name: 'Tiêu chuẩn 13 người',
      description: 'Cân bằng giữa các phe.',
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
      name: 'Sói đông hơn',
      description: 'Thêm Sói thứ 4 để tăng áp lực.',
      setup: {
        [RoleName.Werewolf]: 4,
        [RoleName.Seer]: 1,
        [RoleName.Bodyguard]: 1,
        [RoleName.Witch]: 1,
        [RoleName.Hunter]: 1,
        [RoleName.Villager]: 6,
      },
    },
  ],
  15: [
    {
      name: 'Tiêu chuẩn 15 người',
      description: 'Thêm Dân làng để cân bằng lại.',
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
      name: 'Đại chiến',
      description: 'Đầy đủ các vai trò cho một trận đấu lớn.',
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
};

/**
 * Lấy danh sách các cấu hình vai trò được đề xuất dựa trên số lượng người chơi.
 * @param playerCount - Tổng số người chơi.
 * @returns Một mảng các cấu hình được đề xuất, hoặc một mảng rỗng nếu không có gợi ý.
 */
export function getSuggestedRoleSetups(playerCount: number): SuggestedSetup[] {
  return suggestions[playerCount] || [];
}
