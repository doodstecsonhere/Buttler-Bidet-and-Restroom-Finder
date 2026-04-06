import { useMemo } from "react";
import { useGetBidets } from "@workspace/api-client-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { calculateDistance } from "@/lib/distance";
import { Map } from "@/components/Map";
import { BidetCard } from "@/components/BidetCard";
import { MapPinOff, Loader2, Sparkles, LogIn, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@workspace/replit-auth-web";

// Default to Dumaguete City center if geolocation fails
const DUMAGUETE_CENTER: [number, number] = [9.317, 123.305];

export default function Home() {
  const { data: bidets, isLoading: bidetsLoading, error: bidetsError } = useGetBidets();
  const { location, loading: geoLoading, error: geoError } = useGeolocation();
  const { user, isAuthenticated, login, logout } = useAuth();

  const sortedBidets = useMemo(() => {
    if (!bidets) return [];
    
    // If no location, return unsorted bidets
    if (!location) return bidets;

    // Calculate distance and sort
    return [...bidets]
      .map(bidet => ({
        ...bidet,
        distance: calculateDistance(location.lat, location.lng, bidet.latitude, bidet.longitude)
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [bidets, location]);

  const isGlobalLoading = bidetsLoading || geoLoading;

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] w-full bg-background overflow-hidden">
      {/* Mobile Header overlay on map */}
      <div className="md:hidden absolute top-0 left-0 w-full z-10 pointer-events-none p-4">
        <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-4 flex items-center gap-3 pointer-events-auto">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Buttler Logo" className="w-10 h-10 rounded-xl" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-foreground leading-none">Buttler</h1>
            <p className="text-primary font-medium text-xs tracking-wide uppercase">Bidet Finder</p>
          </div>
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-xl hover:bg-white/80"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline max-w-[80px] truncate">{user?.firstName ?? "Account"}</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-2.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              Log in
            </button>
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="h-[45vh] md:h-screen w-full md:flex-1 relative order-1 md:order-2 bg-muted/50 border-b md:border-b-0 md:border-l border-border z-0">
        <Map 
          bidets={sortedBidets} 
          userLocation={location} 
          defaultCenter={DUMAGUETE_CENTER} 
        />
      </div>

      {/* Sidebar / List Section */}
      <div className="flex-1 md:flex-none md:w-[420px] lg:w-[480px] h-[55vh] md:h-screen flex flex-col order-2 md:order-1 bg-background z-10 shadow-2xl md:shadow-none">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4 p-6 border-b border-border/60 bg-card">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Buttler Logo" className="w-12 h-12 rounded-xl shadow-sm" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-foreground">Buttler</h1>
            <p className="text-primary font-medium text-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Bidet Finder
            </p>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="text-sm">
                <p className="font-medium text-foreground leading-none">{user?.firstName ?? "User"}</p>
              </div>
              <button
                onClick={logout}
                className="ml-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-xl hover:bg-muted"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors px-4 py-2 rounded-xl shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Log in
            </button>
          )}
        </div>

        {/* List Header */}
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-background/95 backdrop-blur z-10 sticky top-0">
          <h2 className="font-display font-semibold text-lg text-foreground">
            {location ? "Nearest to you" : "All Locations"}
          </h2>
          <span className="text-xs font-bold px-2.5 py-1 bg-secondary/10 text-secondary rounded-full">
            {sortedBidets.length} found
          </span>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          {geoError && !location && (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl flex gap-3 text-sm text-foreground/80">
              <MapPinOff className="w-5 h-5 text-accent shrink-0" />
              <p>We couldn't get your location. Showing all bidets in Dumaguete instead.</p>
            </div>
          )}

          {isGlobalLoading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="font-medium animate-pulse">Finding relief...</p>
            </div>
          ) : bidetsError ? (
            <div className="p-6 text-center bg-destructive/10 rounded-2xl border border-destructive/20">
              <p className="text-destructive font-semibold">Failed to load bidet locations.</p>
              <p className="text-sm mt-1 text-destructive/80">Please check your connection and try again.</p>
            </div>
          ) : sortedBidets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MapPinOff className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">No bidets found</h3>
              <p className="text-muted-foreground text-sm mt-1">Looks like you're on your own out here!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-8">
              {sortedBidets.map((bidet, idx) => (
                <BidetCard 
                  key={bidet.id}
                  id={bidet.id}
                  name={bidet.name}
                  latitude={bidet.latitude}
                  longitude={bidet.longitude}
                  distance={bidet.distance}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
