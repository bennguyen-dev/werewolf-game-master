import { IRole } from '../roles/IRole';

export class Player {
  readonly id: string;
  name: string;
  role: IRole | null;

  // Core states
  isAlive: boolean = true;
  isMarkedForDeath: boolean = false; // Bị đánh dấu để chết vào cuối đêm
  isProtected: boolean = false; // Được bảo vệ bởi Bodyguard
  isSilenced: boolean = false; // Bị câm (future use)

  lover: Player | null = null; // Người yêu được ghép bởi Cupid

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.role = null;
  }
}
