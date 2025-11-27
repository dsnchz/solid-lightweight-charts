import type { MouseEventParams, Time } from "lightweight-charts";
import { createSignal, type JSX } from "solid-js";

import { PriceChart } from "../../src/charts/PriceChart";
import { TimeChart } from "../../src/charts/TimeChart";
import { YieldCurveChart } from "../../src/charts/YieldCurveChart";

type EventData = MouseEventParams<Time | number>;

function serializeEvent(event: EventData | null) {
  if (!event) return null;
  return {
    point: event.point,
    time: event.time,
  };
}

export const EventsExample = (): JSX.Element => {
  const [clickEvent, setClickEvent] = createSignal<EventData | null>(null);
  const [dblClickEvent, setDblClickEvent] = createSignal<EventData | null>(null);
  const [crosshairEvent, setCrosshairEvent] = createSignal<EventData | null>(null);

  const timeData = [
    { time: "2023-01-01", value: 100 },
    { time: "2023-01-02", value: 105 },
    { time: "2023-01-03", value: 110 },
  ];

  const priceData = [
    { time: 0, value: 100 },
    { time: 1, value: 105 },
    { time: 2, value: 110 },
  ];

  const yieldData = [
    { time: 0, value: 2.5 },
    { time: 12, value: 2.8 },
    { time: 24, value: 3.0 },
  ];

  const EventDisplay = (props: { title: string; event: EventData | null }) => (
    <div class="bg-white rounded-lg shadow p-4">
      <h3 class="text-lg font-semibold mb-2">{props.title}</h3>
      {props.event ? (
        <pre class="bg-gray-50 p-3 rounded text-sm">
          {JSON.stringify(serializeEvent(props.event), null, 2)}
        </pre>
      ) : (
        <p class="text-gray-500 italic">No event data yet</p>
      )}
    </div>
  );

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold mb-4">Chart Events</h1>
        <p class="text-gray-600 mb-8">
          This example demonstrates the event subscription methods available across all chart types.
          Try clicking, double-clicking, or moving your mouse over the charts below.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-8">
          <div>
            <h2 class="text-xl font-semibold mb-2">TimeChart Events</h2>
            <div class="bg-white rounded-lg shadow p-4 border border-blue-200">
              <TimeChart
                class="h-[300px] w-full"
                onClick={setClickEvent}
                onDblClick={setDblClickEvent}
                onCrosshairMove={setCrosshairEvent}
              >
                <TimeChart.Series type="Line" data={timeData} />
              </TimeChart>
            </div>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-2">PriceChart Events</h2>
            <div class="bg-white rounded-lg shadow p-4 border border-blue-200">
              <PriceChart
                class="h-[300px] w-full"
                onClick={setClickEvent}
                onDblClick={setDblClickEvent}
                onCrosshairMove={setCrosshairEvent}
              >
                <PriceChart.Series type="Line" data={priceData} />
              </PriceChart>
            </div>
          </div>

          <div>
            <h2 class="text-xl font-semibold mb-2">YieldCurveChart Events</h2>
            <div class="bg-white rounded-lg shadow p-4 border border-blue-200">
              <YieldCurveChart
                class="h-[300px] w-full"
                onClick={setClickEvent}
                onDblClick={setDblClickEvent}
                onCrosshairMove={setCrosshairEvent}
              >
                <YieldCurveChart.Series type="Line" data={yieldData} />
              </YieldCurveChart>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Event Data</h2>
          <div class="space-y-4">
            <EventDisplay title="Click Event" event={clickEvent()} />
            <EventDisplay title="Double Click Event" event={dblClickEvent()} />
            <EventDisplay title="Crosshair Move Event" event={crosshairEvent()} />
          </div>
        </div>
      </div>
    </div>
  );
};
