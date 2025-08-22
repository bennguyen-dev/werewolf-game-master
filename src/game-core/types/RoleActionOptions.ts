/**
 * Định nghĩa các type chung cho getActionOptions của các role
 */

export interface IPlayerTarget {
  id: string;
  name: string;
  isValid?: boolean;
  reason?: string;
}

export interface IBaseActionOptions {
  canAct?: boolean;
  availableTargets?: IPlayerTarget[];
  message?: string;
}

// Specific action options for different roles
export interface ICupidActionOptions extends IBaseActionOptions {
  canAct: boolean;
  availableTargets: IPlayerTarget[];
  requiresTargetCount?: 2; // Cupid needs exactly 2 targets
}

export interface ISeerActionOptions extends IBaseActionOptions {
  availableTargets: IPlayerTarget[];
}

export interface IBodyguardActionOptions extends IBaseActionOptions {
  availableTargets: IPlayerTarget[];
  lastProtectedId?: string; // Cannot protect same person consecutively
}

export interface IWerewolfActionOptions extends IBaseActionOptions {
  canAct?: boolean; // Can act based on game rules (e.g., not on first night)
  availableTargets: IPlayerTarget[];
}

export interface IWitchActionOptions extends IBaseActionOptions {
  availableTargets: IPlayerTarget[];
  hasHealPotion: boolean;
  hasPoisonPotion: boolean;
  canHealSelf: boolean;
  canUseBothPotionsSameNight: boolean;
  deadPlayerId?: string; // ID of player who died tonight (for healing)
}

export interface IHunterActionOptions extends IBaseActionOptions {
  canAct: boolean; // Can act only when dead
  canShoot: boolean;
  availableTargets: IPlayerTarget[];
}

export interface IVillagerActionOptions extends IBaseActionOptions {
  canAct: false; // Villagers never have actions
}

// Union type for all possible action options
export type RoleActionOptions =
  | ICupidActionOptions
  | ISeerActionOptions
  | IBodyguardActionOptions
  | IWerewolfActionOptions
  | IWitchActionOptions
  | IHunterActionOptions
  | IVillagerActionOptions;
