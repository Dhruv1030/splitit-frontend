export interface SettlementSuggestion {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
}

export interface SettlementSuggestionsResponse {
    suggestions: SettlementSuggestion[];
    totalTransactions: number;
    groupId: number;
}

export interface PendingSettlement {
    userId: string;
    userName: string;
    amount: number; // Positive if owed, negative if owing
}
