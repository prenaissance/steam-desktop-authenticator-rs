import { create } from "zustand";

type ConfirmationSelectionState = {
  selectedConfirmationIds: Set<string>;
};

type ConfirmationSelectionActions = {
  selectConfirmation: (id: string) => void;
  deselectConfirmation: (id: string) => void;
  clearConfirmation: () => void;
};

type ConfirmationSelectionStore = ConfirmationSelectionState &
  ConfirmationSelectionActions;

export const useConfirmationSelectionStore =
  create<ConfirmationSelectionStore>()((set) => ({
    selectedConfirmationIds: new Set<string>(),
    selectConfirmation: (id: string) =>
      set((state) => {
        const newSet = new Set(state.selectedConfirmationIds);
        newSet.add(id);
        return { selectedConfirmationIds: newSet };
      }),
    deselectConfirmation: (id: string) =>
      set((state) => {
        const newSet = new Set(state.selectedConfirmationIds);
        newSet.delete(id);
        return { selectedConfirmationIds: newSet };
      }),
    clearConfirmation: () =>
      set(() => ({
        selectedConfirmationIds: new Set<string>(),
      })),
  }));
