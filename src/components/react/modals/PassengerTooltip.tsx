import { useRef } from "react";

interface PassengerTooltipProps {
  isVisible: boolean;
  position: { x: number; y: number };
}

export const PassengerTooltip = ({
  isVisible,
  position,
}: PassengerTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  if (!isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className="absolute bottom-full left-1/2 z-50 mb-3 w-[17rem] -translate-x-1/2 transform rounded-2xl bg-gray-900 p-4 shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translate(-50%, ${isVisible ? "0" : "10px"})`,
      }}
    >
      <div className="absolute -bottom-2 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 transform rounded-md bg-gray-900"></div>

      <div className="space-y-3 text-sm text-white">
        <div className="space-y-1">
          <h3 className="font-medium">Teens</h3>
          <p className="text-gray-100">12-15 years at the time of travel</p>
        </div>
        <div className="space-y-1">
          <h3 className="font-medium">Children</h3>
          <p className="text-gray-100">2-11 years at the time of travel</p>
        </div>
        <div className="space-y-1">
          <h3 className="font-medium">Infant</h3>
          <p className="text-gray-100">Under 2 years at the time of travel</p>
        </div>
      </div>
    </div>
  );
};
