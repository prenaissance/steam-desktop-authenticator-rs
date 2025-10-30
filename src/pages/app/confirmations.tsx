import { Breadcrumb } from "~/components/breadcrumb";
import { useNotify } from "~/hooks/use-notify";

export const ConfirmationsPage = () => {
  const { notify } = useNotify();

  const handleClick = () => {
    notify({
      body: "Anyone here?",
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-5xl">
        <div className="w-full flex items-center justify-center">
          <Breadcrumb />
        </div>
        <div className="flex flex-col items-center justify-center p-10">
          <h1 className="text-2xl font-bold">Confirmations Page</h1>
          <button
            onClick={handleClick}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Load Confirmations
          </button>
        </div>
      </div>
    </div>
  );
};
