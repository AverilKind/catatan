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
  updatePerson: (id: string, person: { name: string; phone?: string; address?: string; notes?: string }, password?: string) => Promise<{ success: boolean; error?: string }>;
  deletePerson: (id: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  
  addTransaction: (transaction: { personId: string; type: string; amount: number; category: string; date: string; notes?: string }) => Promise<{ success: boolean; error?: string }>;
  updateTransaction: (id: string, transaction: { personId: string; type: string; amount: number; category: string; date: string; notes?: string }, password?: string) => Promise<{ success: boolean; error?: string }>;
  deleteTransaction: (id: string, password?: string) => Promise<{ success: boolean; error?: string }>;
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
    return res;
  },

  updatePerson: async (id, updatedPerson, password) => {
    const res = await updatePerson(id, updatedPerson, password);
    if (res.success) {
      set((state) => ({
        people: state.people.map((p) => (p.id === id ? (res.data as any) : p)),
      }));
    }
    return res;
  },

  deletePerson: async (id, password) => {
    const res = await deletePerson(id, password);
    if (res.success) {
      set((state) => ({
        people: state.people.filter((p) => p.id !== id),
        transactions: state.transactions.filter((t) => t.personId !== id),
      }));
    }
    return res;
  },

  addTransaction: async (transaction) => {
    const res = await addTransaction(transaction);
    if (res.success) {
      const current = get().transactions;
      set({ transactions: [res.data as any, ...current] });
    }
    return res;
  },

  updateTransaction: async (id, updatedTransaction, password) => {
    const res = await updateTransaction(id, updatedTransaction, password);
    if (res.success) {
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? (res.data as any) : t)),
      }));
    }
    return res;
  },

  deleteTransaction: async (id, password) => {
    const res = await deleteTransaction(id, password);
    if (res.success) {
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    }
    return res;
  },
}));
