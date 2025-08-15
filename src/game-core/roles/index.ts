import { IRole } from '@/game-core/roles/IRole';
import { Bodyguard } from '@/game-core/roles/villagers/Bodyguard';
import { Cupid } from '@/game-core/roles/villagers/Cupid';
import { Hunter } from '@/game-core/roles/villagers/Hunter';
import { Seer } from '@/game-core/roles/villagers/Seer';
import { Villager } from '@/game-core/roles/villagers/Villager';
import { Witch } from '@/game-core/roles/villagers/Witch';
import { Werewolf } from '@/game-core/roles/werewolves/Werewolf';
import { RoleName } from '@/game-core/types/enums';

export const roleMap = new Map<RoleName, () => IRole>([
  [RoleName.Bodyguard, (): IRole => new Bodyguard()],
  [RoleName.Cupid, (): IRole => new Cupid()],
  [RoleName.Hunter, (): IRole => new Hunter()],
  [RoleName.Seer, (): IRole => new Seer()],
  [RoleName.Villager, (): IRole => new Villager()],
  [RoleName.Witch, (): IRole => new Witch()],
  [RoleName.Werewolf, (): IRole => new Werewolf()],
]);
