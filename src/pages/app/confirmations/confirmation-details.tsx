import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  useAcceptConfirmationMutation,
  useConfirmationDetails,
  useConfirmations,
  useDenyConfirmationMutation,
} from "~/api/confirmations";
import { Button } from "~/components/ui/button";

export const ConfirmationDetailsPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.confirmationId!;
  const confirmationsQuery = useConfirmations();
  const confirmation = confirmationsQuery.data?.find((c) => c.id === id);

  const confirmationDetailsQuery = useConfirmationDetails(
    { id, nonce: confirmation?.nonce ?? "" },
    {
      enabled: !!confirmation,
    }
  );

  const acceptConfirmationMutation = useAcceptConfirmationMutation({
    onSuccess: () => {
      toast.success("Confirmation accepted", { dismissible: true });
      navigate("/confirmations");
    },
    onError: (error) => {
      toast.error(`Error accepting confirmation: ${error}`, {
        dismissible: true,
      });
      console.error(error);
    },
  });
  const denyConfirmationMutation = useDenyConfirmationMutation({
    onSuccess: () => {
      toast.success("Confirmation rejected", { dismissible: true });
      navigate("/confirmations");
    },
    onError: (error) => {
      toast.error(`Error rejecting confirmation: ${error}`, {
        dismissible: true,
      });
      console.error(error);
    },
  });

  if (confirmationDetailsQuery.error || !confirmation) {
    return <Navigate to="/confirmations" replace />;
  }

  return (
    <div className="flex h-full flex-col">
      {!confirmationDetailsQuery.data ? (
        <div className="grow">Loading Details...</div>
      ) : (
        <section
          className="rounded-xs bg-slate-700 p-1"
          dangerouslySetInnerHTML={{
            __html: confirmationDetailsQuery.data.html,
          }}
        />
      )}
      <footer className="mt-2">
        <Button
          type="button"
          variant="default"
          className="w-full"
          disabled={
            acceptConfirmationMutation.isPending ||
            denyConfirmationMutation.isPending
          }
          loading={acceptConfirmationMutation.isPending}
          onClick={() => {
            acceptConfirmationMutation.mutate({
              id,
              nonce: confirmation.nonce,
            });
          }}
        >
          Accept
        </Button>
        <Button
          type="button"
          variant="outline"
          className="mt-2 w-full"
          disabled={
            acceptConfirmationMutation.isPending ||
            denyConfirmationMutation.isPending
          }
          loading={denyConfirmationMutation.isPending}
          onClick={() => {
            denyConfirmationMutation.mutate({
              id,
              nonce: confirmation.nonce,
            });
          }}
        >
          Reject
        </Button>
      </footer>
    </div>
  );
};
