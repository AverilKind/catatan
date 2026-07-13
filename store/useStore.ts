import { create } from 'zustand';
import { Person, StoreState, Transaction } from '@/types';
import { getPeople, addPerson, updatePerson, deletePerson } from '@/app/actions/person';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '@/app/actions/transaction';

interface AsyncStoreState {
  people: Person[];
  transactions: Transaction[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  
  addPerson: (person: { name: string; phone?: string; address?: string; notes?: string }) => Promise<void>;
  updatePerson: (id: string, person: { name: string; phone?: string; address?: string; notes?: string }) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  
  addTransaction: (transaction: { personId: string; type: string; amount: number; category: string; date: string; notes?: string }) => Promise<void>;
  updateTransaction: (id: string, transaction: { personId: string; type: string; amount: number; category: string; date: string; notes?: string }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useStore = create<AsyncStoreState>((set, get) => ({
  people: [],
  transactions: [],
  isLoading: true,

  fetchData: async () => {
    set({ isLoading: true });
    const [peopleRes, transRes] = await Promise.all([getPeople(), getTransactions()]);
    
    if (peopleRes.success && transRes.success) {
      set({ 
        people: peopleRes.data as any, 
        transactions: transRes.data as any,
        isLoading: false 
      });
    } else {
      set({ isLoading: false });
    }
  },

  addPerson: async (person) => {
    const res = await addPerson(person);
    if (res.success) {
      const current = get().people;
      set({ people: [res.data as any, ...current] });
    }
  },

  updatePerson: async (id, updatedPerson) => {
    const res = await updatePerson(id, updatedPerson);
    if (res.success) {
      set((state) => ({
        people: state.people.map((p) => (p.id === id ? (res.data as any) : p)),
      }));
    }
  },

  deletePerson: async (id) => {
    const res = await deletePerson(id);
    if (res.success) {
      set((state) => ({
        people: state.people.filter((p) => p.id !== id),
        transactions: state.transactions.filter((t) => t.personId !== id),
      }));
    }
  },

  addTransaction: async (transaction) => {
    const res = await addTransaction(transaction);
    if (res.success) {
      const current = get().transactions;
      set({ transactions: [res.data as any, ...current] });
    }
  },

  updateTransaction: async (id, updatedTransaction) => {
    const res = await updateTransaction(id, updatedTransaction);
    if (res.success) {
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? (res.data as any) : t)),
      }));
    }
  },

  deleteTransaction: async (id) => {
    const res = await deleteTransaction(id);
    if (res.success) {
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    }
  },
}));
