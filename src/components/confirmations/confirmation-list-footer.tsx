import { toast } from "sonner";
import {
  useAcceptBulkConfirmationsMutation,
  useConfirmations,
  useDenyBulkConfirmationsMutation,
} from "~/api/confirmations";
import { useConfirmationSelectionStore } from "~/stores/confirmations/confirmation-selection-store";
import { Button } from "../ui/button";

export const ConfirmationListFooter = () => {
  const confirmationsQuery = useConfirmations();
  const { selectedConfirmationIds, clearConfirmation } =
    useConfirmationSelectionStore();

  const acceptBulkConfirmationsMutation = useAcceptBulkConfirmationsMutation({
    onSuccess: () => {
      toast.success("Confirmations accepted", { dismissible: true });
      clearConfirmation();
    },
    onError: (error) => {
      toast.error(`Error accepting confirmations: ${error}`, {
        dismissible: true,
      });
      console.error(error);
    },
  });
  const denyBulkConfirmationsMutation = useDenyBulkConfirmationsMutation({
    onSuccess: () => {
      toast.success("Confirmations rejected", { dismissible: true });
      clearConfirmation();
    },
    onError: (error) => {
      toast.error(`Error rejecting confirmations: ${error}`, {
        dismissible: true,
      });
      console.error(error);
    },
  });

  if (!selectedConfirmationIds.size) {
    return (
      <Button
        type="button"
        variant="default"
        onClick={() => confirmationsQuery.refetch()}
        loading={confirmationsQuery.isFetching}
        className="mx-auto mt-2 mb-12 w-48 rounded-sm"
      >
        Refresh Confirmations
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="default"
        disabled={
          acceptBulkConfirmationsMutation.isPending ||
          denyBulkConfirmationsMutation.isPending
        }
        loading={acceptBulkConfirmationsMutation.isPending}
        className="w-full rounded-sm py-2"
        onClick={() => {
          acceptBulkConfirmationsMutation.mutate(
            [...selectedConfirmationIds].map((id) => ({
              id,
              nonce:
                confirmationsQuery?.data?.find((c) => c.id === id)?.nonce ?? "",
            }))
          );
        }}
      >
        Accept Selected
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={
          acceptBulkConfirmationsMutation.isPending ||
          denyBulkConfirmationsMutation.isPending
        }
        loading={denyBulkConfirmationsMutation.isPending}
        className="mt-2 w-full rounded-sm py-2"
        onClick={() => {
          denyBulkConfirmationsMutation.mutate(
            [...selectedConfirmationIds].map((id) => ({
              id,
              nonce:
                confirmationsQuery?.data?.find((c) => c.id === id)?.nonce ?? "",
            }))
          );
        }}
      >
        Reject Selected
      </Button>
    </>
  );
};
