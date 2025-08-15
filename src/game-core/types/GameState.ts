import {Faction, GamePhase} from "@/game-core/types/enums";
import {Player} from "@/game-core/types/Player";

export class GameState {
    players: Player[];
    phase: GamePhase = GamePhase.Setup;
    dayNumber: number = 0;

    // Lưu trữ các sự kiện xảy ra trong đêm để xử lý
    nightlyKills: Map<string, string> = new Map(); // <targetId, killerId>
    nightlyProtected: Set<string> = new Set(); // <targetId>
    nightlyHealed: string | null = null; // targetId
    nightlyPoisoned: string | null = null; // targetId
    playerOnTrial: Player | null = null; // Người chơi bị vote cao nhất và đang trong phiên phản biện
    lastSeerResult: { targetId: string, targetName: string, revealedFaction: Faction } | null = null;

    winner: Faction | 'LOVERS' | null = null;

    constructor(players: Player[]) {
        this.players = players;
    }

    getPlayerById(id: string): Player | undefined {
        return this.players.find(p => p.id === id);
    }

    getLivingPlayers(): Player[] {
        return this.players.filter(p => p.isAlive);
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
        this.players.forEach(p => p.isProtected = false);
    }
}