export enum TicketStatus {
  AVAILABLE = 'AVAILABLE',
  SELECTED = 'SELECTED', // Temporarily selected by admin before assigning
  RESERVED = 'RESERVED', // Assigned but not fully paid
  PAID = 'PAID' // Assigned and fully paid
}

export interface Ticket {
  id: string; // "00" to "99"
  status: TicketStatus;
  ownerName?: string;
}

export interface UserSummary {
  name: string;
  tickets: Ticket[];
  totalDebt: number;
  totalPaid: number;
  ticketCount: number;
}
