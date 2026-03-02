export interface OverallBalance {
    totalOwed: number;
    totalOwing: number;
}

export interface GroupMemberBalance {
    [userId: string]: number;
}
