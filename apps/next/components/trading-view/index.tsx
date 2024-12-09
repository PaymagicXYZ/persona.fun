import { useState } from "react";
import { Card } from "../ui/card";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

export default function TradingView() {
  const [iframeVisible, setIframeVisible] = useState(true); // does not work on local host

  return (
    <Card className="w-full h-[600px] bg-gray-900">
      {/* <AdvancedRealTimeChart
        theme="dark"
        symbol="LUNAUSDT"
        interval="30"
        timezone="Etc/UTC"
        style="1"
        autosize={true}
        locale="en"
        toolbar_bg="#f1f3f6"
        hide_top_toolbar={true}
        // hide_side_toolbar={true}
        withdateranges={true}
        allow_symbol_change={false}
        container_id="tradingview_chart"
        disabled_features={["use_localstorage_for_settings"]}
        enabled_features={["study_templates"]}
      /> */}
      {iframeVisible && (
        <iframe
          id="dextools-widget"
          title="DEXTools Trading Chart"
          width="100%"
          height="100%"
          src="https://www.dextools.io/widget-chart/en/solana/pe-light/D2fivcN4XQ8UQ2bYEdpevrFedAERi6Zw9LmkixDsavuQ?theme=light&chartType=2&chartResolution=30&drawingToolbars=false"
          frameBorder="0"
          allowFullScreen
          onError={() => {
            console.log("Error loading DEXTools widget");
            setIframeVisible(false);
          }}
        ></iframe>
      )}
    </Card>
  );
}
