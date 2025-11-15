import { useEffect } from "react";
import { toast } from "sonner";
import { useConfirmations } from "~/api/confirmations";
import { ConfirmationListFooter } from "~/components/confirmations/confirmation-list-footer";
import { ConfirmationListItem } from "~/components/confirmations/confirmation-list-item";
import { ConfirmationSelectionProvider } from "~/stores/confirmations/confirmation-selection-store";

export const ConfirmationsPage = () => {
  const { data, error } = useConfirmations();

  useEffect(() => {
    if (error) {
      toast(`Error loading confirmations: ${error.type}`);
      console.error(error);
    }
  }, [error]);

  return (
    <ConfirmationSelectionProvider>
      <div className="flex h-full flex-col">
        <h1 className="mb-2 text-center font-bold text-2xl">Confirmations</h1>
        <ul className="flex w-full grow flex-col items-center gap-1 overflow-y-auto p-1">
          {data?.map((confirmation) => (
            <ConfirmationListItem
              key={confirmation.id}
              confirmation={confirmation}
            />
          ))}
        </ul>
        <ConfirmationListFooter />
      </div>
    </ConfirmationSelectionProvider>
  );
};
