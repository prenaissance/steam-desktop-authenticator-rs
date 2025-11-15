import { useEffect } from "react";
import { toast } from "sonner";
import { useConfirmations } from "~/api/confirmations";
import { ConfirmationListItem } from "~/components/confirmations/confirmation-list-item";
import { Button } from "~/components/ui/button";

export const ConfirmationsPage = () => {
  const { data, error, refetch } = useConfirmations({});
  useEffect(() => {
    if (error) {
      toast(`Error loading confirmations: ${error.type}`);
      console.error(error);
    }
  }, [error]);

  return (
    <>
      <h1 className="mb-2 text-center font-bold text-2xl">Confirmations</h1>
      <ul className="flex w-full flex-col items-center gap-1">
        {data?.map((confirmation) => (
          <ConfirmationListItem
            key={confirmation.id}
            confirmation={confirmation}
          />
        ))}
      </ul>
      <Button
        type="button"
        variant="default"
        onClick={() => refetch()}
        className="-translate-x-1/2 absolute bottom-12 left-1/2 mt-4 rounded px-4 py-2"
      >
        Refresh Confirmations
      </Button>
    </>
  );
};
