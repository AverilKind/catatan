import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Person, StoreState, Transaction } from '@/types';

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      people: [],
      transactions: [],

      addPerson: (person) =>
        set((state) => ({
          people: [
            ...state.people,
            { ...person, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      updatePerson: (id, updatedPerson) =>
        set((state) => ({
          people: state.people.map((person) =>
            person.id === id ? { ...person, ...updatedPerson } : person
          ),
        })),

      deletePerson: (id) =>
        set((state) => ({
          people: state.people.filter((person) => person.id !== id),
          // Optional: we might also want to delete all transactions associated with this person
          transactions: state.transactions.filter((tx) => tx.personId !== id),
        })),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      updateTransaction: (id, updatedTransaction) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updatedTransaction } : tx
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        })),

      importData: (data) =>
        set(() => ({
          people: data.people || [],
          transactions: data.transactions || [],
        })),

      resetData: () => set({ people: [], transactions: [] }),
    }),
    {
      name: 'catatan-hutang-storage',
    }
  )
);
