"use client";

import { useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarSheetProps {
  isOpen: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  onClose: () => void;
}

export function CalendarSheet({
  isOpen,
  selectedDate,
  onDateSelect,
  onClose,
}: CalendarSheetProps) {
  const dragStartY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = dragStartY.current - currentY;
    if (diff > 0) {
      setDragOffset(-diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset < -100) {
      onClose();
    }
    setDragOffset(0);
    dragStartY.current = null;
  };

  const handleDateSelect = (d: Date | undefined) => {
    if (d) {
      onDateSelect(d);
      onClose();
    }
  };

  return (
    <div
      className={`
        absolute left-0 right-0 bg-background z-40 flex flex-col
        transition-all duration-300 ease-out overflow-hidden
        ${isOpen ? "top-[88px] bottom-0 opacity-100" : "top-[88px] bottom-[100%] opacity-0"}
      `}
      style={{
        transform: isOpen ? `translateY(${dragOffset}px)` : "translateY(0)",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Calendar Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="w-full max-w-sm bg-transparent calendar-fullscreen"
        />
      </div>

      {/* Close Button */}
      <div className="pb-8 flex justify-center">
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full border-2 border-foreground/30 flex items-center justify-center text-foreground/60"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
