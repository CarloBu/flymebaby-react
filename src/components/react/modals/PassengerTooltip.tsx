import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PassengerTooltipProps {
  children: React.ReactNode;
}

export const PassengerTooltip = ({ children }: PassengerTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="w-[17rem] space-y-3 rounded-2xl bg-gray-900 p-4 text-sm text-white"
        >
          <div className="space-y-3">
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
              <p className="text-gray-100">
                Under 2 years at the time of travel
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
