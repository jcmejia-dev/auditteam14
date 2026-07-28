"use client";

import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";

import {
  getDirectionsUrl,
  type JurisdictionLocation,
} from "@/data/jurisdictions";

type JurisdictionMapProps = {
  locations: readonly JurisdictionLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  resetVersion: number;
};

const markerStyles = {
  hospital: {
    color: "#102a43",
    fillColor: "#3f7775",
  },
  office: {
    color: "#102a43",
    fillColor: "#c39a4a",
  },
} as const;

function createPopupContent(location: JurisdictionLocation) {
  const popup = document.createElement("div");
  popup.className = "jurisdiction-popup";

  const category = document.createElement("p");
  category.className = "jurisdiction-popup__category";
  category.textContent =
    location.category === "hospital" ? "Hospital" : "Office";

  const title = document.createElement("p");
  title.className = "jurisdiction-popup__title";
  title.textContent = location.name;

  const place = document.createElement("p");
  place.className = "jurisdiction-popup__location";
  place.textContent = location.location;

  const directions = document.createElement("a");
  directions.className = "jurisdiction-popup__link";
  directions.href = getDirectionsUrl(location);
  directions.target = "_blank";
  directions.rel = "noopener noreferrer";
  directions.textContent = "View directions";
  directions.setAttribute(
    "aria-label",
    `View directions to ${location.name} in Google Maps (opens in a new tab)`,
  );

  popup.append(category, title, place, directions);

  return popup;
}

function fitLocations(
  map: L.Map,
  locations: readonly JurisdictionLocation[],
) {
  if (locations.length === 0) {
    return;
  }

  const bounds = L.latLngBounds(
    locations.map((location) => [location.latitude, location.longitude]),
  );

  map.fitBounds(bounds, {
    padding: [44, 44],
    maxZoom: 11,
    animate: false,
  });
}

export default function JurisdictionMap({
  locations,
  selectedId,
  onSelect,
  resetVersion,
}: JurisdictionMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef(new Map<string, L.CircleMarker>());
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    try {
      const map = L.map(containerRef.current, {
        center: [7.0, 124.35],
        zoom: 9,
        zoomControl: true,
      });
      const tileLayer = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        },
      );

      tileLayer.on("tileerror", () => {
        setMapError(
          "The map background could not be loaded. Location details remain available in the list.",
        );
      });
      tileLayer.addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    } catch {
      window.setTimeout(() => {
        setMapError(
          "The interactive map could not be initialized. Location details remain available in the list.",
        );
      }, 0);
    }

    const markers = markersRef.current;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      markers.clear();
    };
  }, []);

  useEffect(() => {
    const markerLayer = markerLayerRef.current;

    if (!markerLayer) {
      return;
    }

    markerLayer.clearLayers();
    markersRef.current.clear();

    locations.forEach((location) => {
      const style = markerStyles[location.category];
      const marker = L.circleMarker(
        [location.latitude, location.longitude],
        {
          radius: 10,
          color: style.color,
          weight: 3,
          fillColor: style.fillColor,
          fillOpacity: 0.95,
        },
      );

      marker.bindPopup(createPopupContent(location), {
        closeButton: true,
        maxWidth: 280,
      });
      marker.on("click", () => onSelect(location.id));
      marker.addTo(markerLayer);
      markersRef.current.set(location.id, marker);
    });
  }, [locations, onSelect]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach((marker, id) => {
      const isSelected = id === selectedId;
      const location = locations.find((item) => item.id === id);
      const defaultStyle = location
        ? markerStyles[location.category]
        : markerStyles.hospital;

      marker.setRadius(isSelected ? 14 : 10);
      marker.setStyle({
        color: isSelected ? "#b42318" : defaultStyle.color,
        weight: isSelected ? 4 : 3,
        fillColor: isSelected ? "#d9b45a" : defaultStyle.fillColor,
        fillOpacity: 0.95,
      });
    });

    if (!selectedId) {
      map.closePopup();
      return;
    }

    const selectedLocation = locations.find(
      (location) => location.id === selectedId,
    );
    const selectedMarker = markersRef.current.get(selectedId);

    if (selectedLocation && selectedMarker) {
      const shouldAnimate = !window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      map.setView(
        [selectedLocation.latitude, selectedLocation.longitude],
        12,
        { animate: shouldAnimate },
      );
      selectedMarker.openPopup();
    }
  }, [locations, selectedId]);

  useEffect(() => {
    const map = mapRef.current;

    if (map) {
      fitLocations(map, locations);
    }
  }, [locations, resetVersion]);

  return (
    <div className="jurisdiction-map-shell">
      <div
        ref={containerRef}
        className="jurisdiction-map"
        aria-label="Interactive map of Audit Team 14 jurisdiction locations"
      />
      {mapError ? (
        <div className="jurisdiction-map-error" role="status">
          <p className="font-display text-xl font-bold text-navy-900">
            Map temporarily unavailable
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink">
            {mapError}
          </p>
        </div>
      ) : null}
    </div>
  );
}
