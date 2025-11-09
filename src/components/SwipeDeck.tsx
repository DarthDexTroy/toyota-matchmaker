import { useState, useRef } from "react";
import { Vehicle } from "@/types/vehicle";
import { VehicleCard } from "./VehicleCard";
import { Button } from "./ui/button";
import { Heart, X, Undo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SwipeDeckProps {
  vehicles: Vehicle[];
  onSwipe: (vehicleId: string, direction: "left" | "right") => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const SwipeDeck = ({ vehicles, onSwipe, onUndo, canUndo }: SwipeDeckProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const deckRef = useRef<HTMLDivElement | null>(null);

  const handleSwipe = (direction: "left" | "right") => {
    if (currentIndex >= vehicles.length) return;
    const vehicle = vehicles[currentIndex];
    onSwipe(vehicle.id, direction);
    toast({
      title: direction === "right" ? "Added to Favorites!" : "Passed",
      description:
        direction === "right"
          ? `${vehicle.title} ${vehicle.subtitle} saved`
          : `${vehicle.title} ${vehicle.subtitle} skipped`,
      duration: 2000,
    });
    setCurrentIndex((prev) => prev + 1);
    setOffset({ x: 0, y: 0 });
  };

  // --- Mouse / touch handlers ------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentIndex >= vehicles.length) return;
    setDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };
  const finishDrag = () => {
    if (!dragging) return;
    setDragging(false);
    const threshold = 100;
    if (Math.abs(offset.x) > threshold) {
      handleSwipe(offset.x > 0 ? "right" : "left");
    } else {
      setOffset({ x: 0, y: 0 });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (currentIndex >= vehicles.length) return;
    setDragging(true);
    setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const deltaX = e.touches[0].clientX - startPos.x;
    const deltaY = e.touches[0].clientY - startPos.y;
    // Prevent scroll when swiping mostly horizontally (Safari requires this)
    if (Math.abs(deltaX) > Math.abs(deltaY)) e.preventDefault();
    setOffset({ x: deltaX, y: deltaY });
  };
  const handleTouchEnd = () => finishDrag();

  // Also finish drag if mouse goes outside the deck
  const handleMouseLeave = () => finishDrag();
  const handleMouseUp = () => finishDrag();

  // --- Styles ----------------------------------------------------------------
  const getCardStyle = (index: number) => {
    const isActive = index === currentIndex;
    const diff = index - currentIndex;
    if (diff < 0) return { display: "none" }; // already swiped

    const rotation = isActive ? offset.x * 0.1 : 0;
    const scale = 1 - diff * 0.05;
    const translateY = diff * 10;
    const translateX = isActive ? offset.x : 0;
    const opacity = diff > 2 ? 0 : 1 - diff * 0.2;

    return {
      transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg) scale(${scale})`,
      opacity,
      zIndex: 100 - diff,                   // stack within the deck
      transition: dragging ? "none" : "transform 0.25s ease, opacity 0.25s ease",
      pointerEvents: isActive ? "auto" : "none" // only top card is interactive
    } as React.CSSProperties;
  };

  if (currentIndex >= vehicles.length) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-3xl bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <div>
          <h3 className="mb-2 text-2xl font-bold text-card-foreground">No more vehicles!</h3>
          <p className="text-muted-foreground">You&apos;ve reviewed all available matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Deck area: absolute-stacked cards inside a relative container */}
      <div
        ref={deckRef}
        className="relative mx-auto h-[700px] w-full max-w-xl select-none z-10"
        style={{ touchAction: "pan-y" }}  // allow vertical page scroll when not swiping
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Absolutely position each card to stack them */}
        {vehicles.map((vehicle, index) => (
          <div
            key={vehicle.id}
            className="absolute inset-0 will-change-transform"
            style={getCardStyle(index)}
          >
            <VehicleCard vehicle={vehicle} />
          </div>
        ))}
      </div>

      {/* Controls row: ensure it sits ABOVE the deck for reliable taps */}
      <div className="mt-8 flex items-center justify-center gap-4 relative z-20" style={{ touchAction: "auto" }}>
        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-2 border-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => handleSwipe("left")}
          disabled={currentIndex >= vehicles.length}
        >
          <X className="h-8 w-8" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-16 w-16 rounded-full border-2 border-match-excellent hover:bg-match-excellent hover:text-white"
          onClick={() => handleSwipe("right")}
          disabled={currentIndex >= vehicles.length}
        >
          <Heart className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};
