"use client";

import * as React from "react";

declare global {
  interface Window {
    TradingView: { widget: new (config: Record<string, unknown>) => void };
  }
}

export function StockChart({ symbol = "NYSE:LMT" }: { symbol?: string }) {
  const containerId = "tv_chart_main";

  React.useEffect(() => {
    let script: HTMLScriptElement | null = null;

    function init() {
      if (!window.TradingView) return;
      new window.TradingView.widget({
        container_id:        containerId,
        symbol,
        interval:            "D",
        theme:               "light",
        style:               "1",
        locale:              "en",
        width:               "100%",
        height:              "100%",
        toolbar_bg:          "#ffffff",
        hide_top_toolbar:    false,
        hide_side_toolbar:   true,
        allow_symbol_change: true,
        save_image:          false,
        enable_publishing:   false,
        withdateranges:      true,
        details:             false,
        hotlist:             false,
        calendar:            false,
        backgroundColor:     "rgba(255,255,255,0)",
        gridColor:           "rgba(240,240,240,1)",
      });
    }

    if (window.TradingView) {
      init();
    } else {
      script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => {
      if (script && document.head.contains(script)) document.head.removeChild(script);
    };
  }, [symbol]);

  return (
    <div className="flex h-full min-h-[480px] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div id={containerId} className="flex-1" />
    </div>
  );
}
