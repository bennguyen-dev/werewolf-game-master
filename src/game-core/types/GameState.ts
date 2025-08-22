import { IRuleSet } from '@/game-core/rules/IRuleSet';
import { Faction, GamePhase } from '@/game-core/types/enums';
import { Player } from '@/game-core/types/Player';

export class GameState {
  players: Player[];
  ruleSet: IRuleSet;
  phase: GamePhase = GamePhase.Setup;
  dayNumber: number = 0;

  // Lưu trữ các sự kiện xảy ra trong đêm để xử lý
  nightlyKills: Map<string, string> = new Map(); // <targetId, killerId>
  nightlyProtected: Set<string> = new Set(); // <targetId>
  nightlyHealed: string | null = null; // targetId
  nightlyPoisoned: string | null = null; // targetId
  playerOnTrial: Player | null = null; // Người chơi bị vote cao nhất và đang trong phiên phản biện
  lastSeerResult: {
    targetId: string;
    targetName: string;
    revealedFaction: Faction;
  } | null = null;

  winner: Faction | null = null;

  constructor(players: Player[], ruleSet: IRuleSet) {
    this.players = players;
    this.ruleSet = ruleSet;
  }

  getPlayerById(id: string): Player | undefined {
    return this.players.find((p) => p.id === id);
  }

  getLivingPlayers(): Player[] {
    return this.players.filter((p) => p.isAlive);
  }

  // Xóa hết trạng thái của đêm cũ để chuẩn bị cho đêm mới
  resetNightlyActions() {
    this.nightlyKills.clear();
    this.nightlyProtected.clear();
    this.nightlyHealed = null;
    this.nightlyPoisoned = null;
    this.playerOnTrial = null;
    this.lastSeerResult = null;

    // Reset trạng thái bảo vệ của người chơi
    this.players.forEach((p) => (p.isProtected = false));
  }

  /**
   * Tạo snapshot của state hiện tại để support undo
   */
  createSnapshot(): GameStateSnapshot {
    return {
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        isAlive: p.isAlive,
        isProtected: p.isProtected,
        isMarkedForDeath: p.isMarkedForDeath,
        isSilenced: p.isSilenced,
        role: p.role
          ? {
              name: p.role.name,
              faction: p.role.faction,
              description: p.role.description,
            }
          : null,
        lover: p.lover ? { id: p.lover.id, name: p.lover.name } : null,
      })),
      phase: this.phase,
      dayNumber: this.dayNumber,
      nightlyKills: Array.from(this.nightlyKills.entries()),
      nightlyProtected: Array.from(this.nightlyProtected),
      nightlyHealed: this.nightlyHealed,
      nightlyPoisoned: this.nightlyPoisoned,
      lastSeerResult: this.lastSeerResult,
      winner: this.winner,
    };
  }

  /**
   * Restore state từ snapshot
   */
  restoreFromSnapshot(snapshot: GameStateSnapshot): void {
    // Restore players
    this.players.forEach((player) => {
      const savedPlayer = snapshot.players.find((p) => p.id === player.id);
      if (savedPlayer) {
        player.isAlive = savedPlayer.isAlive;
        player.isProtected = savedPlayer.isProtected;
        player.isMarkedForDeath = savedPlayer.isMarkedForDeath;
        player.isSilenced = savedPlayer.isSilenced;
        // Role và lover sẽ được restore bởi GameEngine
      }
    });

    // Restore game state
    this.phase = snapshot.phase;
    this.dayNumber = snapshot.dayNumber;
    this.nightlyKills = new Map(snapshot.nightlyKills);
    this.nightlyProtected = new Set(snapshot.nightlyProtected);
    this.nightlyHealed = snapshot.nightlyHealed;
    this.nightlyPoisoned = snapshot.nightlyPoisoned;
    this.lastSeerResult = snapshot.lastSeerResult;
    this.winner = snapshot.winner;
  }
}

/**
 * Type cho snapshot của GameState
 */
export interface GameStateSnapshot {
  players: Array<{
    id: string;
    name: string;
    isAlive: boolean;
    isProtected: boolean;
    isMarkedForDeath: boolean;
    isSilenced: boolean;
    role: {
      name: string;
      faction: string;
      description: string;
    } | null;
    lover: {
      id: string;
      name: string;
    } | null;
  }>;
  phase: GamePhase;
  dayNumber: number;
  nightlyKills: [string, string][];
  nightlyProtected: string[];
  nightlyHealed: string | null;
  nightlyPoisoned: string | null;
  lastSeerResult: {
    targetId: string;
    targetName: string;
    revealedFaction: Faction;
  } | null;
  winner: Faction | null;
}
