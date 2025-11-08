import { useEffect } from "react";
import { toast } from "sonner";
import { useSessions } from "~/api/auth";
import { useConfirmations } from "~/api/confirmations";
import { Breadcrumb } from "~/components/breadcrumb";
import { Button } from "~/components/ui/button";
import { notify } from "~/utilities/notify";

const handleClick = () => {
  notify({
    body: "Anyone here?",
  });
};

export const ConfirmationsPage = () => {
  const { data, error } = useConfirmations({});
  const sessionsQuery = useSessions();
  console.log(sessionsQuery.data);
  useEffect(() => {
    if (error) {
      toast(`Error loading confirmations: ${error.type}`);
      console.error(error);
    }
  }, [error]);
  console.log(data);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-5xl">
        <div className="w-full flex items-center justify-center">
          <Breadcrumb />
        </div>
        <div className="flex flex-col items-center justify-center p-10">
          <h1 className="text-2xl font-bold">Confirmations Page</h1>
          <Button
            type="button"
            onClick={handleClick}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Load Confirmations
          </Button>
        </div>
      </div>
    </div>
  );
};
