import {GameState} from "@/game-core/types/GameState";
import {IRuleSet} from "@/game-core/rules/IRuleSet";
import {IAction} from "@/game-core/actions/IAction";
import {GamePhase, RoleName} from "@/game-core/types/enums";
import {StandardRuleSet} from "@/game-core/rules/StandardRuleSet";
import {Player} from "@/game-core/types/Player";
import {roleMap} from "@/game-core/roles";
import {ActionResult} from "@/game-core/types/common";
import {GameEvent} from "./types/GameEvent";

export class GameEngine {
    public gameState: GameState;
    private ruleSet: IRuleSet;
    private nightActionQueue: IAction[] = [];
    private immediateActionQueue: IAction[] = [];
    private gameHistory: GameEvent[] = [];
    private votingResults: Map<string, string[]> = new Map();

    constructor(players: {
        id: string;
        name: string;
    }[], roleNames: RoleName[], ruleSet: IRuleSet = new StandardRuleSet()) {
        this.ruleSet = ruleSet;
        const playerObjects = this.assignRoles(players, roleNames);
        this.gameState = new GameState(playerObjects);
        this._broadcastEvent({type: 'GAME_STARTED', payload: {playerCount: playerObjects.length}});
    }

    private assignRoles(players: { id: string; name: string }[], roleNames: RoleName[]): Player[] {
        const shuffledRoles = [...roleNames].sort(() => Math.random() - 0.5);
        return players.map((player, index) => {
            const roleName = shuffledRoles[index % shuffledRoles.length];
            const roleFactory = roleMap.get(roleName);
            if (!roleFactory) throw new Error(`Unknown role: ${roleName}`);
            const roleInstance = roleFactory();
            return new Player(player.id, player.name, roleInstance);
        });
    }

    private _broadcastEvent(event: GameEvent): void {
        this.gameHistory.push(event);
        const livingPlayers = this.gameState.getLivingPlayers();
        for (const player of livingPlayers) {
            const actions = player.role.handleGameEvent(event, this.gameState, player);
            if (actions) {
                // Actions is always an array now
                if (event.type === 'PLAYER_DIED') {
                    this.immediateActionQueue.push(...actions);
                } else {
                    this.nightActionQueue.push(...actions);
                }
            }
        }
    }

    private _processImmediateActions(): void {
        while (this.immediateActionQueue.length > 0) {
            const action = this.immediateActionQueue.shift()!;
            action.execute(this.gameState);
            // Note: An immediate action could theoretically trigger another one,
            // creating a chain. This loop handles that.
        }
    }

    public startGame(): ActionResult {
        if (this.gameState.phase !== GamePhase.Setup) {
            return {success: false, message: "Game already started"};
        }
        this.gameState.phase = GamePhase.Night;
        this.gameState.dayNumber = 1;
        this.gameState.resetNightlyActions();
        this._broadcastEvent({type: 'PHASE_CHANGED', payload: {newPhase: GamePhase.Night, day: 1}});
        return {success: true, message: "Game started - Night 1 begins"};
    }

    public submitPlayerAction(playerId: string, payload: unknown): ActionResult {
        const player = this.gameState.getPlayerById(playerId);
        if (!player || !player.isAlive) {
            return {success: false, message: "Player cannot perform action."};
        }
        // The `createAction` method was added to roles in the previous step
        // It's a temporary bridge until the UI is also refactored.
        const actions = (player.role as any).createAction(player, payload);

        if (actions) {
            this.nightActionQueue.push(...actions);
            return {success: true, message: "Action submitted."};
        }
        return {success: false, message: "Invalid action or payload."};
    }

    public processNight(): ActionResult {
        if (this.gameState.phase !== GamePhase.Night) {
            return {success: false, message: "Not in night phase"};
        }

        // 1. Execute all queued night actions
        this.nightActionQueue.forEach(action => action.execute(this.gameState));
        this.nightActionQueue = []; // Clear queue

        // 2. Determine deaths from actions
        const deadPlayersToday: Player[] = [];
        this.gameState.getLivingPlayers().forEach(player => {
            if (player.isMarkedForDeath) {
                // A simplified death condition. Real logic would check protection, etc.
                // This part needs to be robustly re-implemented based on action results.
                player.isAlive = false;
                deadPlayersToday.push(player);
            }
        });

        // 3. For each dead player, broadcast the PLAYER_DIED event
        deadPlayersToday.forEach(deadPlayer => {
            this._broadcastEvent({type: 'PLAYER_DIED', payload: {player: deadPlayer, cause: 'KILLED'}});
        });

        // 4. Process any immediate actions that resulted from deaths (e.g., Hunter's shot)
        this._processImmediateActions();

        // 5. Check for win conditions
        const winner = this.ruleSet.checkWinConditions(this.gameState);
        if (winner) {
            this.gameState.winner = winner;
            this.gameState.phase = GamePhase.Finished;
        } else {
            // 6. Transition to day
            this.gameState.phase = GamePhase.Day_Discuss;
            this._broadcastEvent({
                type: 'PHASE_CHANGED',
                payload: {newPhase: GamePhase.Day_Discuss, day: this.gameState.dayNumber}
            });
        }

        this.gameState.resetNightlyActions();
        return {success: true, message: "Night processed."};
    }

    public processVoting(): ActionResult {
        // This method also needs a full rewrite similar to processNight.
        // For brevity, we'll sketch the event-driven parts.
        const votedOutPlayer = this._getVotedOutPlayer(); // Assume this helper calculates the result

        if (votedOutPlayer) {
            votedOutPlayer.isAlive = false;
            this._broadcastEvent({type: 'PLAYER_DIED', payload: {player: votedOutPlayer, cause: 'VOTED_OUT'}});
            this._processImmediateActions();
        }

        const winner = this.ruleSet.checkWinConditions(this.gameState);
        if (winner) {
            this.gameState.winner = winner;
            this.gameState.phase = GamePhase.Finished;
        } else {
            this.gameState.phase = GamePhase.Night;
            this.gameState.dayNumber++;
            this._broadcastEvent({
                type: 'PHASE_CHANGED',
                payload: {newPhase: GamePhase.Night, day: this.gameState.dayNumber}
            });
        }
        this.votingResults.clear();
        return {success: true, message: "Voting processed."};
    }

    private _getVotedOutPlayer(): Player | null {
        // Placeholder for voting calculation logic
        return null;
    }
}
