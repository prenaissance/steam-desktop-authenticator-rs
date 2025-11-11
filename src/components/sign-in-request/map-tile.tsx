import { MapPin } from "lucide-react";
import { cn } from "~/lib/utils";

export type MapTileProps = {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
};

const lon2x = (lon: number, zoom: number) => {
  return ((lon + 180) / 360) * 2 ** zoom;
};

const lat2y = (lat: number, zoom: number) => {
  return (
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
      ) /
        Math.PI) /
      2) *
    2 ** zoom
  );
};

export const MapTile = ({
  latitude,
  longitude,
  zoom = 12,
  className,
}: MapTileProps) => {
  // float x, y tile coordinates
  const x = lon2x(longitude, zoom);
  const y = lat2y(latitude, zoom);

  const tileX = Math.floor(x);
  const tileY = Math.floor(y);

  const offsetX = x - tileX;
  const offsetY = y - tileY;

  let tileUrl1: string; // Left tile
  let tileUrl2: string; // Right tile
  let markerLeftPercent: number;

  if (offsetX < 0.5) {
    // --- Case 1: Coordinate is in the LEFT half of its tile ---
    // We will show [tileX - 1] [tileX]

    tileUrl1 = `https://tile.openstreetmap.org/${zoom}/${tileX - 1}/${tileY}.png`;
    tileUrl2 = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
    markerLeftPercent = 50 + offsetX * 50;
  } else {
    // --- Case 2: Coordinate is in the RIGHT half of its tile (offsetX >= 0.5) ---
    // We will show [tileX] [tileX + 1]

    tileUrl1 = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
    tileUrl2 = `https://tile.openstreetmap.org/${zoom}/${tileX + 1}/${tileY}.png`;
    markerLeftPercent = offsetX * 50;
  }

  const markerTopPercent = offsetY * 100;

  return (
    <div
      className={cn(
        "w-64 h-32 overflow-hidden border border-border shadow-sm relative flex flex-row",
        className,
      )}
    >
      <img
        src={tileUrl1}
        alt={`Map tile 1`}
        className="w-1/2 h-full object-cover"
      />
      <img
        src={tileUrl2}
        alt={`Map tile 2`}
        className="w-1/2 h-full object-cover"
      />

      <MapPin
        className={cn(
          "absolute w-5 h-5 text-accent drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]",
          "translate-x-[-50%] -translate-y-full",
        )}
        style={{
          top: `${markerTopPercent}%`,
          left: `${markerLeftPercent}%`,
        }}
      />
    </div>
  );
};
