import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Check, Globe2, MapPin, Monitor, X } from "lucide-react";
import { type ComponentType, type FC, type SVGProps, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { toast } from "sonner";
import {
  type AuthSessionResponse,
  ESessionPersistence,
  useApproveSession,
  useDenySession,
} from "~/api/authentication-approvals";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface SignInRequestCardProps {
  onClose: () => void;
  request: AuthSessionResponse;
}

export const SignInRequestCard: FC<SignInRequestCardProps> = ({
  request,
  onClose,
}) => {
  const approveMutation = useApproveSession();
  const denyMutation = useDenySession();
  const [rememberDevice, setRememberDevice] = useState(false);

  const [latitude, longitude] = request.geoloc?.split(",").map(Number) as [
    number,
    number,
  ];

  const handleDenySession = async () => {
    try {
      await denyMutation.mutateAsync({ clientId: request.clientId });
      toast.success("Sign-in request denied", { dismissible: true });
      onClose();
    } catch {
      toast.error("Failed to deny sign-in request", { dismissible: true });
    }
  };

  const handleApproveSession = async () => {
    const persistence = rememberDevice
      ? ESessionPersistence.Persistent
      : ESessionPersistence.Ephemeral;
    try {
      await approveMutation.mutateAsync({
        clientId: request.clientId,
        persistence: persistence,
      });
      toast.success("Sign-in request approved", { dismissible: true });
      onClose();
    } catch {
      toast.error("Failed to approve request", { dismissible: true });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto max-h-[600px] h-[600px] rounded-3xl border border-border shadow-xl bg-card overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-border px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/20">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">New Sign-in Request</h2>
            <p className="text-sm text-muted-foreground">
              Verify this login attempt
            </p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="overflow-y-auto px-6 py-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Location</span>
          </div>

          <div className="w-full h-64 rounded-2xl overflow-hidden border border-border/50">
            <MapContainer
              center={[latitude, longitude]}
              zoom={12}
              scrollWheelZoom={false}
              className="w-full h-full"
              attributionControl={false}
            >
              <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[latitude, longitude]} icon={defaultIcon}>
                <Popup>
                  {request.city}, {request.country}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard
            icon={Monitor}
            label="Device"
            value={request.deviceFriendlyName}
          />

          <InfoCard
            icon={Globe2}
            label="Location"
            value={`${request.city}, ${request.country}`}
          />

          <InfoCard icon={Globe2} label="IP Address" value={request.ip} mono />
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm">
          <span className="font-semibold text-primary">Security Tip:</span> Only
          approve requests you recognize.
        </div>

        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none ml-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border/50 bg-card checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30"
            checked={rememberDevice}
            onChange={() => setRememberDevice(!rememberDevice)}
          />
          <span className="text-sm text-muted-foreground">
            Remember this device for future sign-ins
          </span>
        </label>
      </div>

      <div className="flex justify-between gap-3 border-t border-border px-6 py-4">
        <Button
          variant="outline"
          onClick={handleDenySession}
          disabled={approveMutation.isPending || denyMutation.isPending}
          className="rounded-xl text-destructive border-destructive/40"
        >
          <X className="w-4 h-4" />
          Deny
        </Button>

        <Button
          onClick={handleApproveSession}
          disabled={approveMutation.isPending || denyMutation.isPending}
          className="rounded-xl bg-primary hover:bg-primary/90"
        >
          <Check className="w-4 h-4" />
          Approve
        </Button>
      </div>
    </div>
  );
};

const InfoCard = ({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) => (
  <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 flex items-start gap-3">
    <div className="p-2 rounded-lg bg-primary/20 mt-0.5">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <Tooltip>
        <TooltipTrigger asChild>
          <p
            className={`text-sm font-semibold mt-1 truncate cursor-help ${
              mono ? "font-mono" : ""
            }`}
          >
            {value}
          </p>
        </TooltipTrigger>
        <TooltipContent>{value}</TooltipContent>
      </Tooltip>
    </div>
  </div>
);
