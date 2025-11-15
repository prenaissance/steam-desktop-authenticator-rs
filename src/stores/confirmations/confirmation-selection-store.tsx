import { createContext, type ReactNode, use, useState } from "react";

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

const ConfirmationSelectionContext = createContext<ConfirmationSelectionStore>(
  null!
);

export const ConfirmationSelectionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedConfirmationIds, setSelectedConfirmationIds] = useState<
    Set<string>
  >(new Set());
  const selectConfirmation = (id: string) => {
    setSelectedConfirmationIds((prev) => new Set(prev).add(id));
  };
  const deselectConfirmation = (id: string) => {
    setSelectedConfirmationIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };
  const clearConfirmation = () => {
    setSelectedConfirmationIds(new Set());
  };

  return (
    <ConfirmationSelectionContext
      value={{
        selectedConfirmationIds,
        selectConfirmation,
        deselectConfirmation,
        clearConfirmation,
      }}
    >
      {children}
    </ConfirmationSelectionContext>
  );
};

export const useConfirmationSelectionStore = () => {
  const context = use(ConfirmationSelectionContext);
  if (!context) {
    throw new Error(
      "useConfirmationSelectionStore must be used within a ConfirmationSelectionProvider"
    );
  }
  return context;
};
