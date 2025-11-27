import type { IChartApiBase, IPaneApi, MouseEventHandler, Time } from "lightweight-charts";
import { createEffect, onCleanup } from "solid-js";

import type { PanePrimitive } from "../types";

export const detachPanePrimitives = <HorzScaleItem = Time>(
  primitives: PanePrimitive<HorzScaleItem>[],
  pane?: IPaneApi<HorzScaleItem>,
) => {
  if (!pane) return;

  for (const primitive of primitives) {
    pane.detachPrimitive(primitive);
  }
};

export const attachPanePrimitives = <HorzScaleItem = Time>(
  primitives: PanePrimitive<HorzScaleItem>[],
  pane?: IPaneApi<HorzScaleItem>,
) => {
  if (!pane) return;

  // Detach the primitives from the pane before attaching them again
  detachPanePrimitives(primitives, pane);

  for (const primitive of primitives) {
    pane.attachPrimitive(primitive);
  }
};

type ChartSubscriptionMethod<HorzScaleItem = Time> = keyof Pick<
  IChartApiBase<HorzScaleItem>,
  "subscribeClick" | "subscribeDblClick" | "subscribeCrosshairMove"
>;
type ChartUnubscriptionMethod<HorzScaleItem = Time> = keyof Pick<
  IChartApiBase<HorzScaleItem>,
  "unsubscribeClick" | "unsubscribeDblClick" | "unsubscribeCrosshairMove"
>;

export const createSubscriptionEffect = <HorzScaleItem = Time>(
  chart: Omit<IChartApiBase<HorzScaleItem>, "addSeries">,
  methods: [ChartSubscriptionMethod<HorzScaleItem>, ChartUnubscriptionMethod<HorzScaleItem>],
  eventHandlers?: MouseEventHandler<HorzScaleItem> | MouseEventHandler<HorzScaleItem>[],
) => {
  createEffect(() => {
    if (!eventHandlers) return;
    const [subscribe, unsubscribe] = methods;

    if (Array.isArray(eventHandlers)) {
      for (const handler of eventHandlers) {
        chart[subscribe](handler);
      }
    } else {
      chart[subscribe](eventHandlers);
    }

    onCleanup(() => {
      if (Array.isArray(eventHandlers)) {
        for (const handler of eventHandlers) {
          chart[unsubscribe](handler);
        }
      } else {
        chart[unsubscribe](eventHandlers);
      }
    });
  });
};
