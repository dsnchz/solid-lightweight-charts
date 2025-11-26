import { useNavigate } from "@solidjs/router";
import { format } from "date-fns";
import type { CandlestickData, LineData, Time } from "lightweight-charts";
import { Show } from "solid-js";

import { PriceChart, TimeChart, type TooltipProps, YieldCurveChart } from "../../src";

// Generate simple candlestick data
function generateCandleData(): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  let price = 150;
  const startDate = new Date(2024, 0, 1);

  for (let i = 0; i < 100; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0] as Time;

    const open = price;
    const closeChange = (Math.random() - 0.5) * 5;
    const close = open + closeChange;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);

    data.push({
      time: dateStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    price = close + (Math.random() - 0.5) * 2;
  }

  return data;
}

// Generate numeric data for PriceChart
function generateNumericData(): LineData<number>[] {
  const data: LineData<number>[] = [];
  let price = 100;

  for (let i = 0; i < 50; i++) {
    price += (Math.random() - 0.5) * 3;
    data.push({
      time: i,
      value: Number(price.toFixed(2)),
    });
  }

  return data;
}

// Generate yield curve data
function generateYieldCurveData(): LineData<number>[] {
  const maturities = [1, 3, 6, 12, 24, 36, 60, 84, 120, 240, 360];
  return maturities.map((months) => ({
    time: months,
    value: Number((2 + Math.log(months / 12) * 0.5 + Math.random() * 0.2).toFixed(2)),
  }));
}

// Component-based tooltip for TimeChart
const TimeTooltipComponent = (props: TooltipProps<Time>) => {
  return (
    <div class="bg-indigo-900 text-white rounded-lg shadow-xl p-3 border border-indigo-600">
      <div class="text-xs font-semibold text-indigo-200 mb-2">
        {format(new Date(props.time as string), "MMM dd, yyyy")}
      </div>
      <Show when={Array.from(props.seriesData.values())[0] as CandlestickData<Time> | undefined}>
        {(data) => (
          <div class="space-y-1 text-xs">
            <div class="flex justify-between gap-3">
              <span class="text-indigo-300">O:</span>
              <span class="font-mono">${data().open.toFixed(2)}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-indigo-300">H:</span>
              <span class="font-mono text-green-400">${data().high.toFixed(2)}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-indigo-300">L:</span>
              <span class="font-mono text-red-400">${data().low.toFixed(2)}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-indigo-300">C:</span>
              <span class="font-mono font-semibold">${data().close.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
};

// Component-based tooltip for PriceChart
const PriceTooltipComponent = (props: TooltipProps<number>) => {
  return (
    <div class="bg-green-900 text-white rounded-lg shadow-xl p-3 border border-green-600 min-w-[120px]">
      <div class="text-xs text-green-300 mb-1">Index</div>
      <div class="text-sm font-mono font-semibold mb-2">{props.time}</div>
      <Show when={Array.from(props.seriesData.values())[0] as LineData<number> | undefined}>
        {(data) => (
          <div class="border-t border-green-700 pt-2">
            <div class="text-xs text-green-300">Value</div>
            <div class="text-lg font-bold text-green-400">${data().value.toFixed(2)}</div>
          </div>
        )}
      </Show>
    </div>
  );
};

// Component-based tooltip for YieldCurveChart
const YieldTooltipComponent = (props: TooltipProps<number>) => {
  const months = () => props.time;
  const years = () => months() / 12;
  const maturityLabel = () =>
    years() >= 1 ? `${years().toFixed(1)} year${years() > 1 ? "s" : ""}` : `${months()} months`;

  return (
    <div class="bg-purple-900 text-white rounded-lg shadow-xl p-3 border border-purple-600 min-w-[140px]">
      <div class="text-xs text-purple-300 mb-1">Maturity</div>
      <div class="text-sm font-semibold mb-2">{maturityLabel()}</div>
      <Show when={Array.from(props.seriesData.values())[0] as LineData<number> | undefined}>
        {(data) => (
          <div class="border-t border-purple-700 pt-2">
            <div class="text-xs text-purple-300">Yield</div>
            <div class="text-lg font-bold text-green-400">{data().value.toFixed(2)}%</div>
          </div>
        )}
      </Show>
    </div>
  );
};

export const TooltipExample = () => {
  const navigate = useNavigate();

  // Generate data
  const candleData = generateCandleData();
  const numericData = generateNumericData();
  const yieldCurveData = generateYieldCurveData();

  return (
    <div class="container mx-auto p-6">
      {/* Breadcrumb */}
      <div class="mb-4">
        <button
          onClick={() => navigate("/")}
          class="text-blue-600 hover:text-blue-800 flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </button>
      </div>

      {/* Header */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Tooltip Examples</h1>
        <p class="text-gray-600 mb-4">
          Custom JSX-based tooltips for all chart types. Tooltips can be created using either the{" "}
          <code class="bg-gray-100 px-1 rounded">children</code> function pattern or the{" "}
          <code class="bg-gray-100 px-1 rounded">component</code> prop.
        </p>
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p class="text-sm text-blue-900">
            <strong>Two render modes:</strong>
          </p>
          <ul class="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
            <li>
              <strong>Children function:</strong> Inline JSX using{" "}
              <code class="bg-blue-100 px-1 rounded text-xs">
                {"children={(props) => <div>...</div>}"}
              </code>
            </li>
            <li>
              <strong>Component prop:</strong> Separate component using{" "}
              <code class="bg-blue-100 px-1 rounded text-xs">component={"{MyTooltip}"}</code>
            </li>
          </ul>
        </div>
      </div>

      {/* Section 1: Children Function Pattern */}
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          Children Function Pattern{" "}
          <code class="text-lg bg-gray-100 px-2 py-1 rounded">{"children={(props) => ...}"}</code>
        </h2>
        <div class="space-y-6">
          {/* TimeChart with children */}
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">TimeChart</span>
              <span class="text-gray-600 text-sm">- Inline children function</span>
            </h3>
            <TimeChart class="h-[300px] w-full">
              <TimeChart.Series type="Candlestick" data={candleData} />

              <TimeChart.Tooltip>
                {(props) => {
                  const data = Array.from(props.seriesData.values())[0] as
                    | CandlestickData<Time>
                    | undefined;
                  const date = format(new Date(props.time as string), "MMM dd, yyyy");

                  return (
                    <div class="bg-gray-800 text-white rounded-lg shadow-xl p-3 text-sm">
                      <div class="font-semibold mb-2">{date}</div>
                      <Show when={data}>
                        <div class="space-y-1 text-xs">
                          <div>
                            Open: <span class="font-mono">${data!.open.toFixed(2)}</span>
                          </div>
                          <div>
                            Close: <span class="font-mono">${data!.close.toFixed(2)}</span>
                          </div>
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </TimeChart.Tooltip>
            </TimeChart>
            <div class="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
              <strong>Usage:</strong> Inline function receives tooltip props directly. Good for
              simple tooltips.
            </div>
          </div>

          {/* PriceChart with children */}
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">PriceChart</span>
              <span class="text-gray-600 text-sm">- Inline children function</span>
            </h3>
            <PriceChart class="h-[300px] w-full">
              <PriceChart.Series type="Line" data={numericData} color="#10b981" lineWidth={2} />

              <PriceChart.Tooltip>
                {(props) => {
                  const data = Array.from(props.seriesData.values())[0] as
                    | LineData<number>
                    | undefined;

                  return (
                    <div class="bg-white border-2 border-green-500 rounded-lg shadow-xl p-3 text-sm">
                      <div class="text-gray-700">
                        Index: <span class="font-mono font-bold">{props.time}</span>
                      </div>
                      <Show when={data}>
                        <div class="text-lg font-bold text-green-600 mt-1">
                          ${data!.value.toFixed(2)}
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </PriceChart.Tooltip>
            </PriceChart>
            <div class="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
              <strong>Note:</strong> PriceChart uses numeric X-axis (not time-based).
            </div>
          </div>

          {/* YieldCurveChart with children */}
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                YieldCurveChart
              </span>
              <span class="text-gray-600 text-sm">- Inline children function</span>
            </h3>
            <YieldCurveChart class="h-[300px] w-full">
              <YieldCurveChart.Series
                type="Line"
                data={yieldCurveData}
                color="#a855f7"
                lineWidth={2}
              />

              <YieldCurveChart.Tooltip>
                {(props) => {
                  const data = Array.from(props.seriesData.values())[0] as
                    | LineData<number>
                    | undefined;
                  const months = props.time;
                  const years = months / 12;

                  return (
                    <div class="bg-purple-50 border-2 border-purple-500 rounded-lg shadow-xl p-3 text-sm">
                      <div class="text-purple-900 font-semibold">
                        {years >= 1 ? `${years.toFixed(1)}Y` : `${months}M`}
                      </div>
                      <Show when={data}>
                        <div class="text-lg font-bold text-purple-600 mt-1">
                          {data!.value.toFixed(2)}%
                        </div>
                      </Show>
                    </div>
                  );
                }}
              </YieldCurveChart.Tooltip>
            </YieldCurveChart>
            <div class="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
              <strong>Note:</strong> YieldCurveChart uses months as the X-axis.
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Component Prop Pattern */}
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          Component Prop Pattern{" "}
          <code class="text-lg bg-gray-100 px-2 py-1 rounded">{"component={MyComponent}"}</code>
        </h2>
        <div class="space-y-6">
          {/* TimeChart with component */}
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">TimeChart</span>
              <span class="text-gray-600 text-sm">- Separate component prop</span>
            </h3>
            <TimeChart class="h-[300px] w-full">
              <TimeChart.Series
                type="Candlestick"
                data={candleData}
                upColor="#26a69a"
                downColor="#ef5350"
              />

              <TimeChart.Tooltip component={TimeTooltipComponent} />
            </TimeChart>
            <div class="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
              <strong>Usage:</strong> Reusable component defined separately. Better for complex
              tooltips or when reusing across charts.
            </div>
          </div>

          {/* PriceChart with component */}
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">PriceChart</span>
              <span class="text-gray-600 text-sm">- Separate component prop</span>
            </h3>
            <PriceChart class="h-[300px] w-full">
              <PriceChart.Series type="Line" data={numericData} color="#10b981" lineWidth={2} />

              <PriceChart.Tooltip component={PriceTooltipComponent} />
            </PriceChart>
            <div class="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
              <strong>Usage:</strong> Reusable tooltip component for numeric X-axis charts.
            </div>
          </div>

          {/* YieldCurveChart with component */}
          <div class="bg-white p-6 rounded-lg shadow-lg">
            <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
              <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                YieldCurveChart
              </span>
              <span class="text-gray-600 text-sm">- Separate component prop</span>
            </h3>
            <YieldCurveChart class="h-[300px] w-full">
              <YieldCurveChart.Series
                type="Area"
                data={yieldCurveData}
                lineColor="#a855f7"
                topColor="rgba(168, 85, 247, 0.4)"
                bottomColor="rgba(168, 85, 247, 0)"
                lineWidth={2}
              />

              <YieldCurveChart.Tooltip component={YieldTooltipComponent} />
            </YieldCurveChart>
            <div class="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
              <strong>Benefit:</strong> Component can be imported and reused across multiple charts
              with consistent styling.
            </div>
          </div>
        </div>
      </div>

      {/* Feature Summary */}
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold text-gray-800 mb-2">All Chart Types Supported:</h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>✅ TimeChart (time-based X-axis)</li>
              <li>✅ PriceChart (numeric X-axis)</li>
              <li>✅ YieldCurveChart (duration X-axis)</li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 mb-2">Flexible API:</h3>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>✅ Children function for inline tooltips</li>
              <li>✅ Component prop for reusable tooltips</li>
              <li>✅ Full TypeScript support</li>
              <li>✅ Access to complete chart API</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
