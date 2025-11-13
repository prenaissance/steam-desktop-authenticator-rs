import { Check, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useProfile } from "~/api/account";
import {
  ESessionPersistence,
  useApproveSession,
  useDenySession,
  useSessions,
} from "~/api/authentication-approvals";
import { MapTile } from "~/components/sign-in-request/map-tile";
import { SignInRequestSection } from "~/components/sign-in-request/sing-in-request-section";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

export const ActionSignInRequestPage = () => {
  const profileQuery = useProfile();
  const params = useParams();
  const clientId = params.clientId!;
  const navigate = useNavigate();
  const sessionsQuery = useSessions();
  const session = sessionsQuery.data?.find(
    (session) => session.clientId === clientId
  );
  const approveMutation = useApproveSession();
  const denyMutation = useDenySession();
  const [rememberDevice, setRememberDevice] = useState(false);

  useEffect(() => {
    setRememberDevice(
      session?.requestedPersistence === ESessionPersistence.Persistent
    );
  }, [session]);

  const handleClose = useCallback(() => {
    navigate("/sign-in-requests");
  }, [navigate]);

  const handleDenySession = useCallback(async () => {
    try {
      await denyMutation.mutateAsync({ clientId });
      toast.success("Sign-in request denied", { dismissible: true });
      handleClose();
    } catch (error) {
      toast.error(`Failed to deny sign-in request: ${error}`, {
        dismissible: true,
      });
    }
  }, [clientId, denyMutation, handleClose]);

  const handleApproveSession = useCallback(async () => {
    const persistence = rememberDevice
      ? ESessionPersistence.Persistent
      : ESessionPersistence.Ephemeral;
    try {
      await approveMutation.mutateAsync({
        clientId,
        persistence,
      });
      toast.success("Sign-in request approved", { dismissible: true });
      handleClose();
    } catch {
      toast.error("Failed to approve request", { dismissible: true });
    }
  }, [approveMutation, handleClose, rememberDevice, clientId]);
  if (sessionsQuery.isPending || profileQuery.isPending) {
    // TODO
    return <div>Loading...</div>;
  }

  // Most probably when session expires and is re-fetched
  if (!session) {
    return <Navigate to="/sign-in-requests" replace />;
  }

  const [latitude, longitude] = session.geoloc?.split(",").map(Number) as [
    number,
    number,
  ];

  return (
    <div className="flex w-full max-w-2xl flex-col gap-1 text-center">
      <MapTile latitude={latitude} longitude={longitude} className="w-full" />
      <SignInRequestSection className="relative px-6 py-5 text-sm">
        <Button
          className="absolute top-1 right-1"
          variant="ghost-destructive"
          size="icon"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-foreground text-lg">New Sign-In Request for</h2>
        <p className="font-bold text-foreground text-xl">
          {profileQuery.data?.personaName}
        </p>
        <br />
        <p className="font-semibold">{session.deviceFriendlyName}</p>
        <p>{session.ip}</p>
        <p>
          {session.city}, {session.country}
        </p>
      </SignInRequestSection>

      <SignInRequestSection className="flex items-center gap-2 p-2 text-left">
        <Checkbox
          className="size-6 rounded-xs"
          id="remember-device-checkbox"
          checked={rememberDevice}
          onCheckedChange={() => setRememberDevice(!rememberDevice)}
        />
        <label
          htmlFor="remember-device-checkbox"
          className="text-muted-foreground text-sm"
        >
          Remember my password on this device
        </label>
      </SignInRequestSection>

      <section className="mt-1 flex justify-stretch gap-2">
        <Button
          onClick={handleApproveSession}
          disabled={approveMutation.isPending || denyMutation.isPending}
          variant="default"
          className="grow"
        >
          <Check className="h-4 w-4" />
          Approve
        </Button>

        <Button
          variant="ghost-destructive"
          onClick={handleDenySession}
          disabled={approveMutation.isPending || denyMutation.isPending}
          className="grow"
        >
          <X className="h-4 w-4" />
          Deny
        </Button>
      </section>
    </div>
  );
};
