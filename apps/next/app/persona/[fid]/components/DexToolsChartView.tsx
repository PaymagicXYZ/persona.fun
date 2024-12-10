import { useEffect, useState } from "react";
import { Card } from "../../../../components/ui/card";
import usePersona from "@/hooks/use-persona";

interface DexToolsChartViewProps {
  fid: number;
  chainId?: string;
  theme?: "dark" | "light";
  chartType?: 0 | 1 | 2 | 3 | 8 | 9 | 10; // Bar, Candle, Line, Area, Heikin Ashi, Hollow Candle, Baseline
  chartResolution?:
    | "1"
    | "3"
    | "5"
    | "15"
    | "30"
    | "60"
    | "120"
    | "240"
    | "720"
    | "1D"
    | "3D"
    | "1W"
    | "1M";
  drawingToolbars?: boolean;
  headerColor?: string;
  tvPlatformColor?: string;
  tvPaneColor?: string;
  chartInUsd?: boolean;
}

const DexToolsChartView = ({
  fid,
  chainId = "base",
  theme = "dark",
  chartType = 1, // Default to candlestick
  chartResolution = "30",
  drawingToolbars = true,
  headerColor = "161A1E",
  tvPlatformColor = "161A1E",
  tvPaneColor = "161A1E",
  chartInUsd = true,
}: DexToolsChartViewProps) => {
  const persona = usePersona(fid);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!persona) return;

    const baseUrl = "https://www.dextools.io/widget-chart";
    const params = new URLSearchParams({
      theme,
      chartType: chartType.toString(),
      chartResolution,
      drawingToolbars: drawingToolbars.toString(),
      headerColor,
      tvPlatformColor,
      tvPaneColor,
      chartInUsd: chartInUsd.toString(),
    });

    setWidgetUrl(
      `${baseUrl}/en/${chainId}/pe-light/${
        persona.token?.pair_address
      }?${params.toString()}`
    );
  }, [persona]);

  return (
    <div className="flex flex-col w-full">
      {/* Chart container */}
      <Card className="w-full h-[600px] bg-gray-900 overflow-hidden">
        {widgetUrl ? (
          <iframe
            id="dextools-widget"
            title="DEXTools Trading Chart"
            width="100%"
            height="100%"
            src={widgetUrl}
            allowFullScreen
            onError={() => {
              console.log("Error loading DEXTools widget");
            }}
            className="border-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Error loading chart. Please try again later.
          </div>
        )}
      </Card>
    </div>
  );
};

export default DexToolsChartView;
