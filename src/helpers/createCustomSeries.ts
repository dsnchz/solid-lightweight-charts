import {
  createSeriesMarkers,
  type IPaneApi,
  type ISeriesApi,
  type SeriesMarker,
} from "lightweight-charts";
import { type Accessor, createEffect, mergeProps, onCleanup, onMount, splitProps } from "solid-js";

import type { CustomSeriesProps, PanePrimitive, SeriesPrimitive } from "../types";
import { attachPanePrimitives, detachPanePrimitives } from "./utils";

/**
 * Minimal interface defining the chart methods required for custom series functionality.
 * This allows the hook to work with any chart type (TimeChart, PriceChart, YieldCurveChart)
 * without being constrained by their specific type hierarchies.
 */
interface CustomSeriesChartApi<HorzScaleItem> {
  addCustomSeries(
    paneView: CustomSeriesProps<HorzScaleItem>["paneView"],
    options: Record<string, unknown>,
    paneIdx: number,
  ): ISeriesApi<"Custom", HorzScaleItem>;
  removeSeries(series: ISeriesApi<"Custom", HorzScaleItem>): void;
  panes(): IPaneApi<HorzScaleItem>[];
}

/**
 * Parameters required by the createCustomSeries hook.
 */
type CreateCustomSeriesParams<HorzScaleItem, ChartType> = {
  /** Accessor function that returns the chart instance */
  readonly chart: Accessor<ChartType & CustomSeriesChartApi<HorzScaleItem>>;
  /** Accessor function that returns the pane index */
  readonly paneIdx: Accessor<number>;
  /** Accessor function that returns chart-level primitives */
  readonly chartPrimitives: Accessor<PanePrimitive<HorzScaleItem>[]>;
  /** Accessor function that returns pane-level primitives */
  readonly panePrimitives: Accessor<PanePrimitive<HorzScaleItem>[]>;
  /** Callback when chart primitives are attached */
  readonly onChartPrimitivesAttached: (primitives: PanePrimitive<HorzScaleItem>[]) => void;
  /** Callback when chart primitives are detached */
  readonly onChartPrimitivesDetached: (primitives: PanePrimitive<HorzScaleItem>[]) => void;
  /** Callback when pane primitives are attached */
  readonly onPanePrimitivesAttached: (primitives: PanePrimitive<HorzScaleItem>[]) => void;
  /** Callback when pane primitives are detached */
  readonly onPanePrimitivesDetached: (primitives: PanePrimitive<HorzScaleItem>[]) => void;
};

/**
 * Creates a custom series lifecycle manager for any Lightweight Charts instance.
 *
 * This hook handles all custom series lifecycle, data management, primitives, and markers.
 * It can be used with TimeChart, PriceChart, YieldCurveChart, or any custom chart type.
 *
 * The generic constraint ensures the chart has the required methods, but the full ChartType
 * is preserved and passed through to callbacks.
 *
 * @param params - Object containing chart, pane, and primitive management values
 * @param props - Custom series configuration props
 *
 * @example
 * ```tsx
 * const CustomSeries = (props: CustomSeriesProps<Time>) => {
 *   const { chart, primitives: chartPrimitives, ... } = useTimeChart();
 *   const { paneIdx, panePrimitives, ... } = useContext(PaneContext);
 *
 *   createCustomSeries({
 *     chart,
 *     paneIdx,
 *     chartPrimitives,
 *     panePrimitives,
 *     onChartPrimitivesAttached,
 *     onChartPrimitivesDetached,
 *     onPanePrimitivesAttached,
 *     onPanePrimitivesDetached,
 *   }, props);
 *
 *   return null;
 * };
 * ```
 */
export function createCustomSeries<HorzScaleItem, ChartType>(
  props: CustomSeriesProps<HorzScaleItem>,
  params: CreateCustomSeriesParams<HorzScaleItem, ChartType>,
) {
  const {
    chart,
    paneIdx,
    chartPrimitives,
    panePrimitives,
    onChartPrimitivesAttached,
    onChartPrimitivesDetached,
    onPanePrimitivesAttached,
    onPanePrimitivesDetached,
  } = params;

  const _props = mergeProps(
    {
      primitives: [] as SeriesPrimitive<"Custom", HorzScaleItem>[],
      markers: () => [] as SeriesMarker<HorzScaleItem>[],
    },
    props,
  );

  const [local, options] = splitProps(_props, [
    "data",
    "primitives",
    "markers",
    "paneView",
    "onCreateSeries",
    "onRemoveSeries",
    "onSetData",
    "onSetMarkers",
    "onAttachPrimitives",
    "onDetachPrimitives",
  ]);

  onMount(() => {
    const series = chart().addCustomSeries(local.paneView, options, paneIdx());
    local.onCreateSeries?.(series, paneIdx());

    const seriesPane = chart().panes()[paneIdx()];

    createEffect(() => {
      series.setData(local.data);
      local.onSetData?.({ chart: chart() as never, series, data: local.data });

      const dataMarkers = local.markers(local.data);
      createSeriesMarkers(series, dataMarkers);
      local.onSetMarkers?.(dataMarkers);
    });

    createEffect(() => {
      // If paneIdx is 0, use the primitives from the chart context, otherwise use the primitives from the pane context
      const currentPanePrimitives = paneIdx() === 0 ? chartPrimitives() : panePrimitives();
      const attachCallback = paneIdx() === 0 ? onChartPrimitivesAttached : onPanePrimitivesAttached;
      const detachCallback = paneIdx() === 0 ? onChartPrimitivesDetached : onPanePrimitivesDetached;

      attachPanePrimitives(currentPanePrimitives, seriesPane);
      attachCallback(currentPanePrimitives);

      onCleanup(() => {
        detachPanePrimitives(currentPanePrimitives, seriesPane);
        detachCallback(currentPanePrimitives);
      });
    });

    createEffect(() => {
      const currentPrimitives = local.primitives;

      for (const primitive of currentPrimitives) {
        series.attachPrimitive(primitive);
      }

      local.onAttachPrimitives?.(currentPrimitives);

      onCleanup(() => {
        for (const primitive of currentPrimitives) {
          series.detachPrimitive(primitive);
        }

        local.onDetachPrimitives?.(currentPrimitives);
      });
    });

    createEffect(() => {
      series.applyOptions(options);
    });

    onCleanup(() => {
      chart().removeSeries(series);
      local.onRemoveSeries?.(series, paneIdx());
    });
  });
}
