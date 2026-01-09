
export interface Message {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: Date;
}

export interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  status: 'lead' | 'customer' | 'closed';
  unread?: number;
}

export interface CRMState {
  isConnected: boolean;
  activeContactId: string | null;
  searchQuery: string;
}
