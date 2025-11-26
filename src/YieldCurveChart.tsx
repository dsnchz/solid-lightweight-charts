import {
  createSeriesMarkers,
  createYieldCurveChart,
  type ISeriesApi,
  type IYieldCurveChartApi,
  type SeriesDefinition,
  type SeriesMarker,
  type YieldCurveSeriesType,
} from "lightweight-charts";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  mergeProps,
  onCleanup,
  onMount,
  type ParentProps,
  Show,
  splitProps,
  useContext,
} from "solid-js";

import { SERIES_DEFINITION_MAP } from "./constants";
import { createTooltip } from "./createTooltip";
import type {
  ChartCommonProps,
  ChartContextType,
  ChartWithPaneState,
  CustomSeriesProps,
  PaneContextType,
  PanePrimitive,
  PaneProps,
  SeriesPrimitive,
  SeriesProps,
  TooltipRootProps,
} from "./types";
import { attachPanePrimitives, createSubscriptionEffect, detachPanePrimitives } from "./utils";

const YieldCurveChartContext = createContext<ChartContextType<IYieldCurveChartApi, number>>();

export const useYieldCurveChart = () => {
  const ctx = useContext(YieldCurveChartContext);

  if (!ctx) {
    throw new Error("[solid-lightweight-charts] No parent YieldCurveChart component found!");
  }

  return ctx;
};

type YieldCurveChartOptions = NonNullable<Parameters<typeof createYieldCurveChart>[1]>;

/**
 * Props for the `YieldCurveChart` component, extending Lightweight Charts'
 * `createYieldCurveChart` configuration with chart lifecycle hooks.
 *
 * @property ref - Optional DOM element ref for the chart container.
 * @property onCreateChart - Callback invoked after the chart instance is created.
 * @property onResize - Callback triggered when the chart is manually resized (if `autoSize: false`).
 */
type YieldCurveChartProps = ChartCommonProps<IYieldCurveChartApi, number> & YieldCurveChartOptions;

/**
 * A SolidJS wrapper component for rendering yield curve charts using
 * TradingView's `createYieldCurveChart` API.
 *
 * Yield curve charts are specifically designed for plotting interest rate curves
 * over time-to-maturity durations. The X-axis is treated as a duration (not a date),
 * and grid/crosshair rendering behavior differs from time- and price-based charts.
 *
 * - Horizontal scale is linear and represents time durations (e.g., months)
 * - Whitespace gaps are not considered for crosshairs and grid lines
 * - Supports vertical panes and multiple overlayed series
 *
 * @example
 * ```tsx
 * <YieldCurveChart>
 *   <YieldCurveChart.Series type="Line" data={...} />
 *   <YieldCurveChart.Pane>
 *     <YieldCurveChart.Series type="Area" data={...} />
 *   </YieldCurveChart.Pane>
 * </YieldCurveChart>
 * ```
 *
 * @param props - Configuration and lifecycle hooks for the chart instance.
 */
export const YieldCurveChart = (props: ParentProps<YieldCurveChartProps>): JSX.Element => {
  let chartContainer!: HTMLDivElement;

  const _props = mergeProps(
    {
      autoSize: true,
      width: 0,
      height: 0,
      forceRepaintOnResize: false,
      primitives: [] as PanePrimitive<number>[],
      style: {} as JSX.CSSProperties,
    },
    props,
  );

  const [local, options] = splitProps(_props, [
    "id",
    "class",
    "ref",
    "style",
    "primitives",
    "onPrimitivesAttached",
    "onPrimitivesDetached",
    "onCreateChart",
    "onClick",
    "onDblClick",
    "onCrosshairMove",
    "onResize",
    "children",
  ]);

  const [resizeProps, chartOptions] = splitProps(options, [
    "width",
    "height",
    "forceRepaintOnResize",
  ]);

  const [chart, setChart] = createSignal<IYieldCurveChartApi>();

  onMount(() => {
    _props.ref?.(chartContainer);

    const chart = createYieldCurveChart(
      chartContainer,
      chartOptions,
    ) as ChartWithPaneState<IYieldCurveChartApi>;

    chart.__nextPaneIndex = 1;
    chart.__getNextPaneIndex = () => chart.__nextPaneIndex++;

    setChart(chart);

    local.onCreateChart?.(chart);

    createEffect(() => {
      if (chartOptions.autoSize) return;

      chart.resize(resizeProps.width, resizeProps.height, resizeProps.forceRepaintOnResize);
      local.onResize?.(resizeProps.width, resizeProps.height);
    });

    createSubscriptionEffect(chart, ["subscribeClick", "unsubscribeClick"], local.onClick);
    createSubscriptionEffect(chart, ["subscribeDblClick", "unsubscribeDblClick"], local.onDblClick);
    createSubscriptionEffect(
      chart,
      ["subscribeCrosshairMove", "unsubscribeCrosshairMove"],
      local.onCrosshairMove,
    );

    createEffect(() => {
      chart.applyOptions(chartOptions);
    });

    onCleanup(() => {
      chart.remove();
    });
  });

  const primitives = () => _props.primitives;

  const onChartPrimitivesAttached = (primitives: PanePrimitive<number>[]) => {
    local.onPrimitivesAttached?.(primitives);
  };
  const onChartPrimitivesDetached = (primitives: PanePrimitive<number>[]) => {
    local.onPrimitivesDetached?.(primitives);
  };

  const classes = () =>
    local.class ? `solid-lwc-container ${local.class}` : "solid-lwc-container";

  const containerStyle = () => ({
    position: "relative" as const,
    ...local.style,
  });

  return (
    <>
      <div id={local.id} class={classes()} style={containerStyle()} ref={chartContainer} />
      <Show when={chart()}>
        {(chart) => (
          <YieldCurveChartContext.Provider
            value={{ chart, primitives, onChartPrimitivesAttached, onChartPrimitivesDetached }}
          >
            {local.children}
          </YieldCurveChartContext.Provider>
        )}
      </Show>
    </>
  );
};

const PaneContext = createContext<PaneContextType<number>>({
  paneIdx: () => 0,
  panePrimitives: () => [],
  onPanePrimitivesAttached: () => {},
  onPanePrimitivesDetached: () => {},
});

const Pane = (props: PaneProps<number>) => {
  const { chart } = useYieldCurveChart();

  const _props = mergeProps(
    {
      primitives: [] as PanePrimitive<number>[],
    },
    props,
  );

  const paneIdx = createMemo(
    () => _props.index ?? (chart() as ChartWithPaneState<IYieldCurveChartApi>).__getNextPaneIndex(),
  );
  const panePrimitives = () => _props.primitives;

  const onPanePrimitivesAttached = (primitives: PanePrimitive<number>[]) => {
    _props.onAttachPrimitives?.(primitives);
  };

  const onPanePrimitivesDetached = (primitives: PanePrimitive<number>[]) => {
    _props.onDetachPrimitives?.(primitives);
  };

  return (
    <PaneContext.Provider
      value={{ paneIdx, panePrimitives, onPanePrimitivesAttached, onPanePrimitivesDetached }}
    >
      {props.children}
    </PaneContext.Provider>
  );
};

/**
 * A vertical pane for the `YieldCurveChart`, used to stack series with separate Y-axes.
 *
 * Pane index `0` is reserved for the default pane. If `index` is omitted,
 * a unique index will be assigned automatically and incremented within the current chart instance.
 *
 * @example
 * ```tsx
 * <YieldCurveChart.Pane>
 *   <YieldCurveChart.Series type="Histogram" data={...} />
 * </YieldCurveChart.Pane>
 * ```
 *
 * @param props.index - Optional explicit pane index.
 */
YieldCurveChart.Pane = Pane;

const Series = <T extends YieldCurveSeriesType>(props: SeriesProps<T, number>) => {
  const {
    chart,
    primitives: chartPrimitives,
    onChartPrimitivesAttached,
    onChartPrimitivesDetached,
  } = useYieldCurveChart();
  const { paneIdx, panePrimitives, onPanePrimitivesAttached, onPanePrimitivesDetached } =
    useContext(PaneContext);

  const _props = mergeProps(
    {
      primitives: [] as SeriesPrimitive<T, number>[],
      markers: () => [] as SeriesMarker<number>[],
    },
    props,
  );

  const [local, options] = splitProps(_props, [
    "data",
    "markers",
    "primitives",
    "onCreateSeries",
    "onRemoveSeries",
    "onSetData",
    "onSetMarkers",
    "onAttachPrimitives",
    "onDetachPrimitives",
  ]);

  onMount(() => {
    const seriesDef = SERIES_DEFINITION_MAP[props.type] as SeriesDefinition<YieldCurveSeriesType>;
    const series = chart().addSeries(seriesDef, options, paneIdx()) as ISeriesApi<T, number>;
    local.onCreateSeries?.(series, paneIdx());

    const seriesPane = chart().panes()[paneIdx()];

    createEffect(() => {
      series.setData(local.data);
      local.onSetData?.({ chart: chart(), series, data: local.data });

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

  return null;
};

/**
 * A series component for the `YieldCurveChart`, used to render data points
 * over duration-based X-axis values (e.g., months to maturity).
 *
 * This component attaches the series to the current pane context (default or custom).
 * All series use a numeric X-axis rather than date-based timestamps.
 *
 * @typeParam T - The supported series type for yield curve charts.
 *
 * @param props.type - Series type (e.g., `"Line"`, `"Area"`).
 * @param props.data - Numeric X-axis data to render (e.g., durations and values).
 * @param props.primitives - Optional [primitives](https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives) to attach to the series.
 * @param props.onCreateSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onRemoveSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onSetData - Optional callback fired after `setData()` is called.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/api/interfaces/IYieldCurveChartApi
 */
YieldCurveChart.Series = Series;

const CustomSeries = (props: CustomSeriesProps<number>) => {
  const {
    chart,
    primitives: chartPrimitives,
    onChartPrimitivesAttached,
    onChartPrimitivesDetached,
  } = useYieldCurveChart();
  const { paneIdx, panePrimitives, onPanePrimitivesAttached, onPanePrimitivesDetached } =
    useContext(PaneContext);

  const _props = mergeProps(
    {
      primitives: [] as SeriesPrimitive<"Custom", number>[],
      markers: () => [] as SeriesMarker<number>[],
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
      local.onSetData?.({ chart: chart(), series, data: local.data });

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

  return null;
};

/**
 * A custom series component for the `YieldCurveChart`, used to render data points
 * over duration-based X-axis values (e.g., months to maturity).
 *
 * @param props.paneView - The required pane view for the custom series -- defines the basic functionality and structure required for creating a custom series view..
 * @param props.data - Numeric X-axis data to render (e.g., durations and values).
 * @param props.primitives - Optional [primitives](https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives) to attach to the series.
 * @param props.onCreateSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onRemoveSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onSetData - Optional callback fired after `setData()` is called.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/custom_series
 */
YieldCurveChart.CustomSeries = CustomSeries;

const Tooltip = (props: TooltipRootProps<number>) => {
  const { chart } = useYieldCurveChart();
  createTooltip(chart, props);
  return null;
};

/**
 * Custom tooltip component for the `YieldCurveChart`.
 *
 * Renders a JSX-based tooltip that displays when hovering over chart data.
 * The tooltip automatically follows the cursor and hides when moving outside the chart bounds.
 *
 * @param props.children - Function that receives tooltip data and returns JSX to render
 * @param props.component - Alternative to children: a component that receives tooltip data as props
 * @param props.offset - Position offset from cursor (default: { x: 8, y: 8 })
 * @param props.fixed - Use fixed positioning for modals/dialogs (default: false)
 * @param props.onShow - Callback when tooltip becomes visible
 * @param props.onHide - Callback when tooltip becomes hidden
 *
 * @example
 * ```tsx
 * <YieldCurveChart>
 *   <YieldCurveChart.Series type="Line" data={data} />
 *   <YieldCurveChart.Tooltip>
 *     {({ time, seriesData }) => (
 *       <div class="tooltip">
 *         <div>Maturity: {time} months</div>
 *         <div>Yield: {Array.from(seriesData.values())[0]?.value}%</div>
 *       </div>
 *     )}
 *   </YieldCurveChart.Tooltip>
 * </YieldCurveChart>
 * ```
 */
YieldCurveChart.Tooltip = Tooltip;
