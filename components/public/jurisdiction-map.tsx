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

const markerClasses = {
  hospital: "jurisdiction-marker--hospital",
  office: "jurisdiction-marker--office",
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

  popup.append(category, title, place);

  location.contacts.forEach((contact) => {
    const detail = document.createElement("p");
    const role = document.createElement("strong");

    detail.className = "jurisdiction-popup__contact";
    role.textContent = `${contact.role}: `;
    detail.append(role, document.createTextNode(contact.name));
    popup.append(detail);
  });

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

  popup.append(directions);

  return popup;
}

function fitLocations(
  map: L.Map,
  locations: readonly JurisdictionLocation[],
  animate = false,
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
    animate,
    duration: animate ? 0.65 : undefined,
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
  const markersRef = useRef(new Map<string, L.Marker>());
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    try {
      const shouldAnimate = !window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const map = L.map(containerRef.current, {
        center: [7.0, 124.35],
        zoom: 9,
        zoomControl: true,
        zoomAnimation: shouldAnimate,
        fadeAnimation: shouldAnimate,
        markerZoomAnimation: shouldAnimate,
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
      const marker = L.marker(
        [location.latitude, location.longitude],
        {
          icon: L.divIcon({
            className: [
              "jurisdiction-marker",
              markerClasses[location.category],
            ].join(" "),
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -14],
          }),
          keyboard: true,
          title: location.name,
          alt: `${location.name} map marker`,
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
      marker.getElement()?.classList.toggle("is-active", isSelected);
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

      map.flyTo(
        [selectedLocation.latitude, selectedLocation.longitude],
        12,
        {
          animate: shouldAnimate,
          duration: shouldAnimate ? 0.65 : 0,
        },
      );
      selectedMarker.openPopup();
    }
  }, [locations, selectedId]);

  useEffect(() => {
    const map = mapRef.current;

    if (map) {
      const shouldAnimate =
        resetVersion > 0 &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      fitLocations(map, locations, shouldAnimate);
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
