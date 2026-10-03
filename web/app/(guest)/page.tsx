"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getMyBookings, type BookingRecord } from "@/services/bookingService";
import { HeroSection } from "@/components/guest/landing/HeroSection";
import { FeaturedDestinations } from "@/components/guest/landing/FeaturedDestinations";
import { FeaturedProperties } from "@/components/guest/landing/FeaturedProperties";
import { ExperienceValues } from "@/components/guest/landing/ExperienceValues";
import { BookingSteps } from "@/components/guest/landing/BookingSteps";
import { GuestStories } from "@/components/guest/landing/GuestStories";
import { FinalCTA } from "@/components/guest/landing/FinalCTA";

export default function LandingHomePage() {
  const { user, isAuthenticated } = useAuth();
  const [recentBooking, setRecentBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated) {
      getMyBookings()
        .then((bookings) => {
          if (isMounted && bookings && bookings.length > 0) {
            setRecentBooking(bookings[0]);
          }
        })
        .catch(() => {
          // Silent fallback if network/auth state is transient
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const scrollToSearch = () => {
    const el = document.getElementById("hero-search-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div style={{ background: "#fcfbf9", color: "#1e293b" }}>
      {/* 1. Hero Section: Typography + Integrated Atmospheric 3D + Search */}
      <HeroSection
        user={user}
        isAuthenticated={isAuthenticated}
        recentBooking={recentBooking}
      />

      {/* 2. Popular Destinations */}
      <FeaturedDestinations />

      {/* 3. Featured Properties */}
      <FeaturedProperties />

      {/* 4. Platform Experience & Values */}
      <ExperienceValues />

      {/* 5. Simple 4-Step Booking Process */}
      <BookingSteps />

      {/* 6. Guest Stories & Reviews */}
      <GuestStories />

      {/* 7. Final Call-to-Action */}
      <FinalCTA
        onExploreClick={scrollToSearch}
        isHost={user?.role === "Host"}
      />
    </div>
  );
}
