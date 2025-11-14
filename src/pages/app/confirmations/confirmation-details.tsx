import { Navigate, useParams } from "react-router";
import { useConfirmationDetails, useConfirmations } from "~/api/confirmations";
import { Button } from "~/components/ui/button";

export const ConfirmationDetailsPage = () => {
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

  if (confirmationDetailsQuery.error) {
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
        <Button type="button" variant="default" className="w-full">
          Accept
        </Button>
        <Button type="button" variant="outline" className="mt-2 w-full">
          Reject
        </Button>
      </footer>
    </div>
  );
};
