export enum Faction {
    Villager = 'VILLAGER',
    Werewolf = 'WEREWOLF',
    Solo = 'SOLO', // Cho các role thắng một mình như Sát nhân hàng loạt
    Lovers = 'LOVERS', // Phe thứ 3 cho cặp đôi khác phe
}

export enum GamePhase {
    Setup = 'SETUP',
    Night = 'NIGHT',
    Day_Discuss = 'DAY_DISCUSS',
    Day_Vote = 'DAY_VOTE',
    Day_Defense = 'DAY_DEFENSE', // Giai đoạn cho người bị vote cao nhất phản biện
    Day_LastWord = 'DAY_LAST_WORD',
    Finished = 'FINISHED',
}

// Dùng để định danh các role một cách nhất quán
export enum RoleName {
    Villager = 'Villager',
    Werewolf = 'Werewolf',
    Seer = 'Seer',
    Bodyguard = 'Bodyguard',
    Witch = 'Witch',
    Hunter = 'Hunter',
    Cupid = 'Cupid',
}