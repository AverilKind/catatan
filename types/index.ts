export interface Person {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
}

export type TransactionType = 'hutang' | 'pembayaran';

export interface Transaction {
  id: string;
  personId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  notes: string;
  photo?: string;
  createdAt: string;
}

export interface StoreState {
  people: Person[];
  transactions: Transaction[];
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  updatePerson: (id: string, person: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  importData: (data: { people: Person[]; transactions: Transaction[] }) => void;
  resetData: () => void;
}
