import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Compass, Navigation, MapPin, ExternalLink, ArrowRight } from "lucide-react";
import L from "leaflet";

const NearbyLabsMap = ({
  labs = [],
  userLocation,
  onRecenter,
  height = "400px",
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultLat = userLocation?.lat || labs[0]?.latitude || 25.5941;
    const defaultLng = userLocation?.lng || labs[0]?.longitude || 85.1376;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      scrollWheelZoom: false,
    }).setView([defaultLat, defaultLng], 12);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add User GPS marker
    if (userLocation) {
      const userMarkerHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(37,99,235,0.25); border-radius: 50%; animation: pulse 2s infinite;"></div>
          <div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        className: "custom-user-pin",
        html: userMarkerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<div style='font-family: sans-serif; font-size: 12px; font-weight: bold;'>📍 You are here</div>");
    }

    // Add Lab Markers
    labs.forEach((lab) => {
      const lat = lab.latitude || defaultLat + (Math.random() - 0.5) * 0.05;
      const lng = lab.longitude || defaultLng + (Math.random() - 0.5) * 0.05;
      const dist = lab.distance_km || lab.distance;

      const labMarkerHtml = `
        <div style="
          background: #0f172a;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          border: 2px solid #3b82f6;
          font-family: sans-serif;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="color: #38bdf8;">🏥</span> ${lab.name.length > 14 ? lab.name.substring(0, 12) + "…" : lab.name}
        </div>
      `;

      const labIcon = L.divIcon({
        className: "custom-lab-pin",
        html: labMarkerHtml,
        iconSize: [100, 26],
        iconAnchor: [50, 13],
      });

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 200px; padding: 2px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a;">${lab.name}</h4>
          <p style="margin: 4px 0 6px; font-size: 11px; color: #64748b;">${lab.address || "Certified Diagnostic Center"}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">⭐ ${lab.rating || 4.5}</span>
            ${dist ? `<span style="font-size: 11px; font-weight: 700; color: #2563eb;">📍 ${dist.toFixed(1)} km away</span>` : ""}
          </div>
          <div style="display: flex; gap: 6px;">
            <a href="/labs/${lab.id}" style="flex: 1; text-align: center; background: #2563eb; color: white; text-decoration: none; padding: 5px 8px; border-radius: 8px; font-size: 11px; font-weight: 700;">View Lab</a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="background: #f1f5f9; color: #334155; text-decoration: none; padding: 5px 8px; border-radius: 8px; font-size: 11px; font-weight: 700;">Directions</a>
          </div>
        </div>
      `;

      L.marker([lat, lng], { icon: labIcon }).addTo(map).bindPopup(popupHtml);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [labs, userLocation]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-10" />

      {onRecenter && (
        <button
          type="button"
          onClick={onRecenter}
          className="absolute bottom-4 right-4 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>My Location</span>
        </button>
      )}
    </div>
  );
};

export default NearbyLabsMap;
