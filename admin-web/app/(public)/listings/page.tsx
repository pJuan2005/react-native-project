"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import {
  getProperties,
  type PropertyQueryFilters,
  type PropertySummary,
} from "@/services/propertyService";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { PaginationControls } from "@/components/shared/PaginationControls";

const PROPERTY_TYPES = [
  "All",
  "Villa",
  "Apartment",
  "Cabin",
  "Cottage",
  "Studio",
  "House",
  "Penthouse",
  "Condo",
  "Bungalow",
];

const ITEMS_PER_PAGE = 6;

function ListingContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceMax, setPriceMax] = useState(500);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const locationQuery = searchParams.get("location")?.trim() || "";
  const typeQuery = searchParams.get("type")?.trim() || "";
  const checkInQuery = searchParams.get("checkIn")?.trim() || "";
  const checkOutQuery = searchParams.get("checkOut")?.trim() || "";
  const hasGuestQuery = searchParams.has("guests");
  const guestsQuery = Number(searchParams.get("guests") || 1);
  const requiredGuests = Number.isFinite(guestsQuery) && guestsQuery > 0 ? guestsQuery : 1;
  const initialPropertyType = PROPERTY_TYPES.includes(typeQuery) ? typeQuery : "All";

  const serverFilters = useMemo<PropertyQueryFilters>(
    () => ({
      location: locationQuery,
      type: initialPropertyType !== "All" ? initialPropertyType : undefined,
      guests: requiredGuests > 1 ? requiredGuests : undefined,
      checkIn: checkInQuery || undefined,
      checkOut: checkOutQuery || undefined,
    }),
    [checkInQuery, checkOutQuery, initialPropertyType, locationQuery, requiredGuests],
  );

  useEffect(() => {
    setLoading(true);

    getProperties(serverFilters)
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [serverFilters]);

  useEffect(() => {
    setSearchQuery(locationQuery);
    setSelectedType(initialPropertyType);
    setSelectedCities([]);
    setCurrentPage(1);
  }, [initialPropertyType, locationQuery, requiredGuests, checkInQuery, checkOutQuery]);

  const cityOptions = useMemo(
    () => [...new Set(properties.map((property) => property.city).filter(Boolean))].sort(),
    [properties],
  );

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !normalizedQuery ||
        property.title.toLowerCase().includes(normalizedQuery) ||
        property.location.toLowerCase().includes(normalizedQuery) ||
        property.city.toLowerCase().includes(normalizedQuery);

      const matchesPrice = property.price <= priceMax;
      const matchesType =
        selectedType === "All" || property.type === selectedType;
      const matchesRating = property.rating >= selectedRating;
      const matchesCity =
        selectedCities.length === 0 || selectedCities.includes(property.city);
      const matchesGuests = property.maxGuests >= requiredGuests;

      return (
        matchesSearch &&
        matchesPrice &&
        matchesType &&
        matchesRating &&
        matchesCity &&
        matchesGuests
      );
    });
  }, [
    priceMax,
    properties,
    requiredGuests,
    searchQuery,
    selectedCities,
    selectedRating,
    selectedType,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priceMax, selectedType, selectedRating, selectedCities]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProperties = filteredProperties.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  function toggleCity(city: string) {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((item) => item !== city) : [...prev, city],
    );
  }

  function clearFilters() {
    setSearchQuery("");
    setPriceMax(500);
    setSelectedType("All");
    setSelectedRating(0);
    setSelectedCities([]);
  }

  const tripSummary = useMemo(() => {
    const parts: string[] = [];

    if (locationQuery) {
      parts.push(`in ${locationQuery}`);
    }

    if (hasGuestQuery) {
      parts.push(
        requiredGuests > 1
          ? `for ${requiredGuests} guests`
          : "for 1 guest",
      );
    }

    if (checkInQuery && checkOutQuery) {
      parts.push(`from ${checkInQuery} to ${checkOutQuery}`);
    }

    return parts.length > 0 ? `Showing stays ${parts.join(" ")}` : "";
  }, [checkInQuery, checkOutQuery, hasGuestQuery, locationQuery, requiredGuests]);

  function FilterSidebar() {
    return (
      <div
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <h5 style={{ fontWeight: 700, fontSize: "1rem", margin: 0 }}>
            <SlidersHorizontal size={16} /> Filters
          </h5>
          <button
            onClick={clearFilters}
            style={{
              border: "none",
              background: "none",
              color: "#2563EB",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.8rem",
            }}
          >
            <X size={13} /> Clear
          </button>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <label>Price</label>
            <span style={{ color: "#2563EB", fontWeight: 600 }}>${priceMax}</span>
          </div>
          <input
            type="range"
            min={30}
            max={500}
            step={10}
            value={priceMax}
            onChange={(event) => setPriceMax(Number(event.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label>Type</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  border:
                    selectedType === type
                      ? "1px solid #2563EB"
                      : "1px solid #ddd",
                  background: selectedType === type ? "#eff6ff" : "#fff",
                  color: selectedType === type ? "#2563EB" : "#333",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <label>City</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {cityOptions.map((city) => (
              <label key={city} style={{ fontSize: "0.85rem" }}>
                <input
                  type="checkbox"
                  checked={selectedCities.includes(city)}
                  onChange={() => toggleCity(city)}
                />{" "}
                {city}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label>Rating</label>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 4, 4.5, 4.8].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: 6,
                  border:
                    selectedRating === rating
                      ? "1px solid #2563EB"
                      : "1px solid #ddd",
                  background: selectedRating === rating ? "#eff6ff" : "#fff",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                }}
              >
                {rating === 0 ? "Any" : `${rating}+`}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading listings...</div>;
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "28px 0",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ fontWeight: 800 }}>Explore Homestays</h1>
              <p style={{ color: "#64748b" }}>
                {tripSummary || `${filteredProperties.length} properties available`}
              </p>
            </div>

            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{ position: "absolute", left: 10, top: 10 }}
              />
              <input
                placeholder="Search by title or city..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                style={{
                  padding: "8px 10px 8px 30px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  minWidth: 240,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: 28 }}>
        <div className="row g-4">
          <div className="col-lg-3 d-none d-lg-block">
            <FilterSidebar />
          </div>

          <div className="col-lg-9">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
                color: "#64748b",
                fontSize: "0.9rem",
              }}
            >
              <Filter size={15} />
              Refine the list by price, stay type, city, rating, and guest capacity.
            </div>

            {paginatedProperties.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                No properties found
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {paginatedProperties.map((property) => (
                    <div
                      key={property.id}
                      className="col-xl-4 col-lg-6 col-md-6 col-sm-12"
                    >
                      <PropertyCard property={property} />
                    </div>
                  ))}
                </div>

                <PaginationControls
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  totalItems={filteredProperties.length}
                  pageSize={ITEMS_PER_PAGE}
                  itemLabel="properties"
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading listings...</div>}>
      <ListingContent />
    </Suspense>
  );
}
