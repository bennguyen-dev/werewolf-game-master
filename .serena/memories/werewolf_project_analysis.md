# Phân tích Project Werewolf Game Master

## 📋 Tổng quan Project

**werewolf-game-master** là một ứng dụng web được thiết kế để hỗ trợ Game Master (GM) quản lý trò chơi Werewolf (Ma Sói) vật lý, trực tiếp. Project được xây dựng với kiến trúc Event-Driven hiện đại và có thể mở rộng.

### 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Icons**: Lucide React

## 🏗️ Cấu trúc Thư mục

```
src/
├── app/                    # Next.js App Router
├── components/             # Shared UI components
│   ├── PlayerSeat/        # Player seat component
│   └── ui/                # shadcn/ui components
├── features/              # Feature-based modules
│   └── setup/             # Game setup feature
├── game-core/             # Core game logic
│   ├── actions/           # Command pattern actions
│   ├── config/            # Game configurations
│   ├── roles/             # Role implementations
│   ├── rules/             # Game rules
│   └── types/             # Type definitions
└── lib/                   # Utilities and hooks
```

## 🎯 Kiến trúc Event-Driven

### Core Components

#### 1. **GameEngine** (Event Broadcaster & Orchestrator)

- **File**: `src/game-core/GameEngine.ts`
- **Chức năng**: Quản lý vòng lặp game chính và trạng thái
- **Phương thức quan trọng**:
  - `assignRoleToPlayers()`: Gán vai trò cho người chơi
  - `submitGroupAction()`: Xử lý hành động nhóm
  - `resolveNight()`: Xử lý các hành động ban đêm
  - `resolveVoting()`: Xử lý kết quả bỏ phiếu
  - `_broadcastEvent()`: Phát sóng sự kiện

#### 2. **IRole Interface** (Event Listener & Action Factory)

- **File**: `src/game-core/roles/IRole.ts`
- **Phương thức chính**:
  - `onGameEvent()`: Lắng nghe và phản ứng với events
  - `createAction()`: Tạo Action objects từ input
  - `getActionOptions()`: Cung cấp dữ liệu cho UI

#### 3. **IAction Interface** (Command Pattern)

- **File**: `src/game-core/actions/IAction.ts`
- **Phương thức**: `execute(gameState)`: Thực thi và thay đổi trạng thái

#### 4. **GameState** (Single Source of Truth)

- **File**: `src/game-core/types/GameState.ts`
- **Chứa**: Players, phase, day number, nightly actions

#### 5. **GameEvent** (Event Structure)

- **File**: `src/game-core/types/GameEvent.ts`
- **Types**: `GAME_STARTED`, `PHASE_CHANGED`, `PLAYER_DIED`

## 📊 Classes và Functions Quan trọng

### Game Core Classes

#### Roles (Vai trò)

- **Villagers**: `Seer`, `Bodyguard`, `Witch`, `Hunter`, `Cupid`, `Villager`
- **Werewolves**: `Werewolf`
- **Decorators**: `LoverRoleDecorator`

#### Actions (Hành động)

- `KillAction`: Đánh dấu mục tiêu để chết
- `SeeAction`: Xem phe của mục tiêu
- `HealAction`: Chữa lành mục tiêu
- `PoisonAction`: Đầu độc mục tiêu
- `ProtectAction`: Bảo vệ mục tiêu
- `CoupleAction`: Ghép đôi hai người chơi

#### Rules

- `StandardRuleSet`: Implement các luật chơi chuẩn
- `IRuleSet`: Interface định nghĩa luật chơi

### UI Components

#### Setup Feature

- `SetupPage`: Trang chính setup game
- `GameConfigurationForm`: Form cấu hình game
- `PlayerArrangementGrid`: Lưới sắp xếp người chơi
- `SortablePlayerSeat`: Component ghế có thể kéo thả

#### Shared Components

- `PlayerSeat`: Component hiển thị thông tin người chơi
- `PlayerNameEditDialog`: Dialog chỉnh sửa tên

### Hooks & Utilities

- `useLocalStorage`: Hook lưu trữ local storage
- `getSuggestedRoleSetups`: Gợi ý setup vai trò

## 🎨 Design Patterns Được Sử dụng

1. **Event-Driven Architecture / Observer Pattern**
   - GameEngine broadcast events
   - Roles listen và react

2. **Command Pattern**
   - IAction interface
   - Actions encapsulate requests

3. **Factory Pattern**
   - Role creation via roleMap
   - Action creation trong roles

4. **Decorator Pattern**
   - LoverRoleDecorator modifies roles

5. **Singleton Pattern (Conceptual)**
   - GameEngine và GameState

## 🔧 Gợi ý Tối ưu và Refactor

### 1. **Testing Infrastructure**

```typescript
// Thiếu hoàn toàn test suite
// Gợi ý: Thêm Jest/Vitest + React Testing Library
```

### 2. **Error Handling**

```typescript
// GameEngine.ts - Cần improve error handling
public assignRoleToPlayers(playerIds: string[], roleName: RoleName): ActionResult {
  try {
    // Current implementation
  } catch (error) {
    // Add proper error handling
    return { success: false, message: `Error: ${error.message}` };
  }
}
```

### 3. **Type Safety Improvements**

```typescript
// IRole.ts - getActionOptions return type quá generic
getActionOptions(gameState: GameState, self: Player): any;

// Nên định nghĩa specific types:
interface ActionOptions {
  availableTargets?: { id: string; name: string; isValid?: boolean }[];
  potionsRemaining?: { heal: boolean; poison: boolean };
  // ...
}
```

### 4. **Performance Optimizations**

```typescript
// GameEngine.ts - Có thể optimize event broadcasting
private _broadcastEvent(event: GameEvent): void {
  // Current: Loop through all living players
  // Optimize: Use event subscription pattern
}
```

### 5. **State Management**

```typescript
// Gợi ý: Thêm Zustand hoặc Redux Toolkit cho complex state
// Hiện tại chỉ dùng useState và localStorage
```

### 6. **Validation Layer**

```typescript
// Thiếu validation cho game actions
// Gợi ý: Thêm Zod schemas
import { z } from 'zod';

const PlayerActionSchema = z.object({
  playerId: z.string().uuid(),
  targetId: z.string().uuid(),
  actionType: z.enum(['KILL', 'SEE', 'HEAL', 'POISON']),
});
```

### 7. **Logging và Monitoring**

```typescript
// Hiện tại chỉ có console.log
// Gợi ý: Thêm structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});
```

## 🧪 Gợi ý Test Tự động

### 1. **Unit Tests cho Game Core**

```typescript
// tests/game-core/GameEngine.test.ts
describe('GameEngine', () => {
  test('should assign roles correctly', () => {
    const engine = new GameEngine([
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' },
    ]);

    const result = engine.assignRoleToPlayers(['1'], RoleName.Seer);
    expect(result.success).toBe(true);
    expect(engine.gameState.getPlayerById('1')?.role?.name).toBe(RoleName.Seer);
  });
});
```

### 2. **Integration Tests cho Actions**

```typescript
// tests/game-core/actions/KillAction.test.ts
describe('KillAction', () => {
  test('should mark target for death', () => {
    const gameState = new GameState([
      new Player('1', 'Victim'),
      new Player('2', 'Killer'),
    ]);

    const action = new KillAction('1', '2');
    action.execute(gameState);

    expect(gameState.getPlayerById('1')?.isMarkedForDeath).toBe(true);
  });
});
```

### 3. **Component Tests**

```typescript
// tests/components/PlayerSeat.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerSeat } from '@/components/PlayerSeat';

describe('PlayerSeat', () => {
  test('should open edit dialog on click', () => {
    const mockPlayer = new Player('1', 'Test Player');
    render(<PlayerSeat number={1} player={mockPlayer} />);

    fireEvent.click(screen.getByText('Test Player'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

### 4. **E2E Tests với Playwright**

```typescript
// tests/e2e/game-setup.spec.ts
import { test, expect } from '@playwright/test';

test('complete game setup flow', async ({ page }) => {
  await page.goto('/');

  // Fill game configuration
  await page.fill('[data-testid="game-name"]', 'Test Game');
  await page.selectOption('[data-testid="player-count"]', '6');

  // Arrange players
  await page.click('[data-testid="player-1"]');
  await page.fill('[data-testid="player-name-input"]', 'Alice');

  // Verify setup completion
  await expect(page.locator('[data-testid="continue-button"]')).toBeEnabled();
});
```

### 5. **Performance Tests**

```typescript
// tests/performance/game-engine.perf.test.ts
describe('GameEngine Performance', () => {
  test('should handle large player count efficiently', () => {
    const players = Array.from({ length: 100 }, (_, i) => ({
      id: `player-${i}`,
      name: `Player ${i}`,
    }));

    const start = performance.now();
    const engine = new GameEngine(players);
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // Should complete in <100ms
  });
});
```

## 📈 Metrics và Monitoring

### 1. **Code Coverage Target**

- Unit Tests: >90%
- Integration Tests: >80%
- E2E Tests: Critical paths covered

### 2. **Performance Metrics**

- Game initialization: <200ms
- Action execution: <50ms
- UI responsiveness: <16ms per frame

### 3. **Bundle Size Monitoring**

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "bundle-analyzer": "@next/bundle-analyzer"
  }
}
```

## 🚀 Roadmap Suggestions

### Phase 1: Foundation

- [ ] Add comprehensive test suite
- [ ] Improve error handling
- [ ] Add proper TypeScript types
- [ ] Setup CI/CD pipeline

### Phase 2: Enhancement

- [ ] Add state management (Zustand)
- [ ] Implement proper logging
- [ ] Add validation layer (Zod)
- [ ] Performance optimizations

### Phase 3: Advanced Features

- [ ] Real-time multiplayer support
- [ ] Advanced game analytics
- [ ] Custom rule sets
- [ ] Mobile responsiveness

## 💡 Best Practices Đang Áp dụng

✅ **Good Practices:**

- Event-Driven Architecture
- Feature-based folder structure
- TypeScript usage
- Modern React patterns
- Design patterns implementation

⚠️ **Areas for Improvement:**

- Test coverage
- Error handling
- Type safety
- Performance monitoring
- Documentation
