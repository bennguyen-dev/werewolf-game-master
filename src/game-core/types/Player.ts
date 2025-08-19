import { IRole } from '../roles/IRole';

export class Player {
  readonly id: string;
  name: string;
  role: IRole | null;

  // Trạng thái của người chơi
  isAlive: boolean = true;
  isProtected: boolean = false; // Được bảo vệ bởi Bodyguard
  isCursedByWerewolf: boolean = false; // Bị Sói nguyền (cho role Sói Nguyền)
  isSilenced: boolean = false; // Bị câm
  isUsedWitchHeal: boolean = false; // Phù thủy đã dùng thuốc cứu trên người này
  isMarkedForDeath: boolean = false; // Bị đánh dấu để chết vào cuối đêm

  lover: Player | null = null; // Người yêu được ghép bởi Cupid

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.role = null;
  }
}
