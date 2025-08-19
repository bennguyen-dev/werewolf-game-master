# Gemini Project Analysis: werewolf-game-master

This document provides an AI-generated overview of the `werewolf-game-master` project, designed to be used as instructional context for future interactions with Gemini. This version reflects the new Event-Driven architecture and flexible GM workflow.

## Project Overview

This is a web application designed to assist a Game Master (GM) in managing a **physical, in-person game** of Werewolf (Ma Sói). It is built using Next.js, React, and TypeScript.

**Key Technologies:**

- **Framework:** Next.js 15 (with App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui - A collection of re-usable components that can be copied and pasted into your apps.

### Core Architecture: Event-Driven

The project is built on a flexible and scalable **Event-Driven Architecture**. This decouples the core game logic from the roles, making the system easy to extend and maintain.

- **`GameEngine` (Event Broadcaster & Orchestrator):** The heart of the application. It manages the main game loop and state. Its primary responsibility is to **broadcast `GameEvent` objects** (e.g., `PHASE_CHANGED`, `PLAYER_DIED`) to all roles. It executes `Action` objects and enforces `RuleSet` policies. It acts as the central orchestrator of game flow.

- **`Role` (Event Listener & Action Factory):** Each role class (e.g., `Seer`, `Hunter`) implements the `IRole` interface. Its main method, `onGameEvent`, listens for events from the `GameEngine`. If an event is relevant, the role can react. The role also acts as a **factory** that creates `Action` objects based on player input via its `createAction` method. It also provides the necessary data for the UI to render its controls via the `getActionOptions` method.

- **`Action` (Command Object):** A self-contained command that holds all the information needed to perform a single game action (e.g., `KillAction`, `SeeAction`). It has an `execute()` method that directly mutates the game state. Actions are created by Roles and executed by the GameEngine.

- **`RuleSet` (Game Policy Provider):** An implementation of `IRoleSet` (e.g., `StandardRuleSet`). It defines the specific rules and policies of the game (e.g., win conditions, whether Witch can heal herself, night turn order). The `GameEngine` queries the `RuleSet` to enforce these policies.

- **`GameState` (Single Source of Truth):** A central object that holds the entire current state of the game, including players, their roles, current phase, day number, and temporary nightly actions/results. All `Action` objects modify this state.

- **`Player`:** Represents a single player in the game, holding their ID, name, and their assigned `IRole` instance, along with various status flags (e.g., `isAlive`, `isProtected`, `isMarkedForDeath`).

- **`GameEvent`:** Defines the structure for all game events, forming the backbone of the new architecture. Events are broadcast by the `GameEngine` and listened to by `Role` objects.

- **`useGame.ts` (The Bridge):** A React hook that connects the UI to the `GameEngine`. It provides methods for the UI to send player input (e.g., `assignRoleToPlayers`, `submitGroupAction`, `submitVote`), and exposes the game state for rendering.

## Design Patterns in werewolf-game-master

This project leverages several well-established design patterns to achieve its flexible and maintainable architecture:

### 1. Event-Driven Architecture / Observer Pattern

- **Description:** Components communicate by publishing and subscribing to events, rather than direct method calls. This reduces coupling between modules.
- **Specific Application:**
  - **Subject/Publisher:** `GameEngine` broadcasts `GameEvent` objects (e.g., `PHASE_CHANGED`, `PLAYER_DIED`).
  - **Observer/Subscriber:** `IRole` implementations (e.g., `Werewolf`, `Seer`, `Witch`) via their `onGameEvent` method.
  - **Event:** `GameEvent` objects carry information about what happened in the game.
- **Benefits:** Decouples event producers from consumers, allowing for flexible reactions to game state changes and easier addition of new event types or roles.

### 2. Command Pattern

- **Description:** Encapsulates a request (an action) as an object, allowing for parameterization of clients with different requests, queuing or logging requests, and supporting undoable operations.
- **Specific Application:**
  - **Command:** `IAction` interface and its concrete implementations (e.g., `KillAction`, `HealAction`, `SeeAction`).
  - **Receiver:** `GameState` (the object that `execute()` methods operate on).
  - **Invoker:** `GameEngine` (queues and executes `Action` objects).
  - **Client:** `Role` objects (create `Action` objects).
- **Benefits:** Decouples the requestor from the executor and the object being acted upon. Enables flexible management, queuing, and processing of actions.

### 3. Factory Pattern

- **Description:** Provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.
- **Specific Application:**
  - **Simple Factory (for Role creation):** `roleMap` in `src/game-core/roles/index.ts` acts as a simple factory to create `IRole` instances.
  - **Factory Method (for Action creation within Roles):** The `IRole` interface defines the `createAction()` method, and concrete `Role` classes implement it to produce their specific `Action` objects.
- **Benefits:** Centralizes object creation logic and delegates `Action` creation to the `Role`s themselves.

### 4. Decorator Pattern

- **Description:** Dynamically attaches new responsibilities to an object.
- **Specific Application:** The `LoverRoleDecorator` wraps an existing `IRole` instance to modify its `faction` and `description` without altering the original role class.
- **Benefits:** Allows for dynamic modification of `Role` properties without changing the base `Role` class, crucial for mechanics like the "Lovers" faction.

### 5. Singleton Pattern (Conceptual)

- **Description:** Ensures a class has only one instance and provides a global point of access to it.
- **Specific Application:** `GameEngine` and `GameState` are conceptually managed as single instances throughout the application to ensure a single source of truth and central control for the game.
- **Note:** This is a conceptual application rather than a strict code enforcement (e.g., private constructors).

## Building and Running

- **Run the development server:**

  ```bash
  npm run dev
  ```

- **Build for production:**

  ```bash
  npm run build
  ```

- **Start the production server:**

  ```bash
  npm run start
  ```

- **Lint the code:**
  ```bash
  npm run lint
  ```

## Development Conventions

### Game Logic Flow (The Modern Workflow)

The new workflow is designed to be flexible and maps directly to how a Game Master runs a real game, especially during the first night. The process is now a consistent two-step for all roles: **1. Assign Role(s)**, **2. Submit Action**.

1.  The GM decides to call a role (e.g., Seer). The UI calls `engine.assignRoleToPlayers(['player-id'], RoleName.Seer)`.
2.  The `GameEngine` assigns the `Seer` role to the player.
3.  The UI, now knowing the player is a Seer, calls the role's `getActionOptions()` method to get the list of valid targets.
4.  The UI uses this data to display a list of players for the GM to choose from.
5.  The GM selects a target.
6.  The UI calls `engine.submitGroupAction(RoleName.Seer, 'target-id')`.
7.  The `GameEngine` finds the Seer player and calls their `role.createAction(player, 'target-id')` method.
8.  The `Seer` role creates and returns a `SeeAction` object.
9.  The `GameEngine` receives the `Action` object and places it in the `nightActionQueue`.
10. This process repeats for all other roles (e.g., `assignRoleToPlayers` for the Werewolves, then `submitGroupAction` for their kill).
11. Once all actions are queued, the GM ends the night. The UI calls `engine.resolveNight()`.
12. The `GameEngine` executes all actions in the queue, determines who died, and checks for win conditions.
13. The `GameEngine` then broadcasts events like `PLAYER_DIED` or `PHASE_CHANGED`.
14. Living roles receive these events via their `onGameEvent` method, allowing them to react (e.g., the Hunter's last shot). The cycle continues.

### Key `GameEngine` Methods & Their Responsibilities

- **`assignRoleToPlayers(playerIds: string[], roleName: RoleName)`:** Assigns a single role to one or more players. This is the primary method for setting up roles like Villagers, Werewolves, or even single roles like the Seer at the start of their turn. It does not queue any action.
- **`submitGroupAction(actingRoleName: RoleName, payload: unknown)`:** Submits an action on behalf of a role or group. The engine finds a living player with that role, uses them to call the role's `createAction` factory method, and queues the resulting `Action`. This is used for all night actions (e.g., the Seer's "see", the Werewolves' "kill").
- **`resolveNight()`:** Executes all queued night actions, determines deaths (considering protection/healing), broadcasts `PLAYER_DIED` events, processes any immediate follow-up actions (like the Hunter's shot), checks win conditions, and transitions to the day phase.
- **`resolveVoting()`:** Processes the outcome of the day's voting. It eliminates the voted-out player, broadcasts the `PLAYER_DIED` event, checks for win conditions, and transitions to the next night phase.
- **`_broadcastEvent(event: GameEvent)`:** (Private) Pushes an event to the game history and dispatches it to all living roles via their `onGameEvent` method.
- **`_processImmediateActions()`:** (Private) Executes actions that need to happen immediately outside the normal night queue (e.g., Hunter's shot after death).

### Adding a New Role (The Modern Workflow)

1.  **Define Action(s):** If the role has unique abilities, create new `IAction` classes in `src/game-core/actions/`.
2.  **Create Role Class:** Create a new class in `src/game-core/roles/` that implements the `IRole` interface.
3.  **Implement `onGameEvent`:** Code the logic to react to game-wide events. This is for passive or reactive abilities (e.g., Hunter's death shot).
4.  **Implement `getActionOptions`:** Provide the data needed for the UI to render the controls for your role (e.g., a list of valid targets, status of potions).
5.  **Implement `createAction`:** Write the factory logic that takes a payload from the UI (via `submitGroupAction`) and returns a new instance of your `Action` class.
6.  **Register Role:** Add the new role to the `roleMap` in `src/game-core/roles/index.ts`.

### Adding a shadcn/ui Component

- Run the following command, replacing `<component-name>` with the desired component:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- The new component will be added to `src/components/ui/`.

### Code Style & Naming

- Adhere to the rules in `eslint.config.mjs`.
- Use PascalCase for components, classes, types, and enums (e.g., `PlayerCard`, `GameEngine`, `GameState`).
- Use the `use` prefix for hooks (e.g., `useGame`).

## Important Reminders

- **GM-Centric System:** This system is primarily designed for a Game Master (GM) to control and manage a **physical, in-person** Werewolf game. Many actions and transitions are expected to be initiated or confirmed by the GM via the UI.
- **Adherence to Design Patterns:** All new features, modifications, or additions to the `game-core` must strictly adhere to the established Event-Driven architecture and design patterns (e.g., Command, Factory, Decorator, Observer). This ensures maintainability, scalability, and consistency of the codebase.
