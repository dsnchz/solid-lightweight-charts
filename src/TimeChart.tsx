import {
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type SeriesMarker,
  type Time,
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
  BuiltInSeriesType,
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

const TimeChartContext = createContext<ChartContextType<IChartApi, Time>>();

const useTimeChart = () => {
  const ctx = useContext(TimeChartContext);

  if (!ctx) {
    throw new Error("[solid-lightweight-charts] No parent TimeChart component found!");
  }

  return ctx;
};

type TimeChartOptions = NonNullable<Parameters<typeof createChart>[1]>;

/**
 * Props accepted by the `TimeChart` component.
 *
 * In addition to the standard Lightweight Charts options, it supports:
 *
 * - `ref`: optional access to the chart's container DOM element
 * - `onCreateChart`: callback when the chart instance is created
 * - `onResize`: callback after a manual resize (if `autoSize` is false)
 */
type TimeChartProps = ChartCommonProps<IChartApi, Time> & TimeChartOptions;

/**
 * A SolidJS wrapper component for creating a time-based chart using
 * TradingView's `createChart` function from Lightweight Charts.
 *
 * This component sets up the chart lifecycle, provides chart context to child components,
 * and supports auto-sizing or fixed-size rendering.
 *
 * @example
 * ```tsx
 * <TimeChart>
 *   <TimeChart.Series type="Line" data={...} />
 *   <TimeChart.Pane>
 *     <TimeChart.Series type="Histogram" data={...} />
 *   </TimeChart.Pane>
 * </TimeChart>
 * ```
 *
 * @param props - Chart configuration and lifecycle callbacks.
 */
export const TimeChart = (props: ParentProps<TimeChartProps>): JSX.Element => {
  let chartContainer!: HTMLDivElement;

  const _props = mergeProps(
    {
      autoSize: true,
      width: 0,
      height: 0,
      forceRepaintOnResize: false,
      primitives: [] as PanePrimitive<Time>[],
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

  const [chart, setChart] = createSignal<IChartApi>();

  onMount(() => {
    _props.ref?.(chartContainer);
    const chart = createChart(chartContainer, chartOptions) as ChartWithPaneState<IChartApi>;

    chart.__nextPaneIndex = 1; // 0 is the default pane
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

  const onChartPrimitivesAttached = (primitives: PanePrimitive<Time>[]) => {
    local.onPrimitivesAttached?.(primitives);
  };
  const onChartPrimitivesDetached = (primitives: PanePrimitive<Time>[]) => {
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
          <TimeChartContext.Provider
            value={{ chart, primitives, onChartPrimitivesAttached, onChartPrimitivesDetached }}
          >
            {local.children}
          </TimeChartContext.Provider>
        )}
      </Show>
    </>
  );
};

const PaneContext = createContext<PaneContextType<Time>>({
  paneIdx: () => 0,
  panePrimitives: () => [],
  onPanePrimitivesAttached: () => {},
  onPanePrimitivesDetached: () => {},
});

const Pane = (props: PaneProps<Time>) => {
  const { chart } = useTimeChart();

  const _props = mergeProps(
    {
      primitives: [] as PanePrimitive<Time>[],
    },
    props,
  );

  const paneIdx = createMemo(
    () => _props.index ?? (chart() as ChartWithPaneState<IChartApi>).__getNextPaneIndex(),
  );
  const panePrimitives = () => _props.primitives;

  const onPanePrimitivesAttached = (primitives: PanePrimitive<Time>[]) => {
    _props.onAttachPrimitives?.(primitives);
  };

  const onPanePrimitivesDetached = (primitives: PanePrimitive<Time>[]) => {
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
 * Represents an individual pane within a `TimeChart`.
 *
 * If no `index` is provided, the pane index will be automatically assigned and incremented.
 * Each pane hosts its own Y-axis scale, and can be used to render series like volume or indicators
 * separately from the primary chart area.
 *
 * Pane index `0` is reserved for the default pane.
 *
 * @example
 * ```tsx
 * <TimeChart.Pane>
 *   <TimeChart.Series type="Histogram" data={volumeData} />
 * </TimeChart.Pane>
 * ```
 *
 * @param props.index - Optional pane index to explicitly control placement.
 */
TimeChart.Pane = Pane;

const Series = <T extends BuiltInSeriesType>(props: SeriesProps<T>) => {
  const {
    chart,
    primitives: chartPrimitives,
    onChartPrimitivesAttached,
    onChartPrimitivesDetached,
  } = useTimeChart();
  const { paneIdx, panePrimitives, onPanePrimitivesAttached, onPanePrimitivesDetached } =
    useContext(PaneContext);

  const _props = mergeProps(
    {
      primitives: [] as SeriesPrimitive<T, Time>[],
      markers: () => [] as SeriesMarker<Time>[],
    },
    props,
  );

  const [local, options] = splitProps(_props, [
    "data",
    "primitives",
    "markers",
    "onCreateSeries",
    "onRemoveSeries",
    "onSetData",
    "onSetMarkers",
    "onAttachPrimitives",
    "onDetachPrimitives",
  ]);

  onMount(() => {
    const series = chart().addSeries(
      SERIES_DEFINITION_MAP[props.type],
      options,
      paneIdx(),
    ) as ISeriesApi<T>;
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
 * Renders a series (Line, Area, Candlestick, etc.) within a `TimeChart`.
 *
 * This component must be a child of `<TimeChart>` or `<TimeChart.Pane>`, and will automatically
 * attach itself to the correct pane based on context.
 *
 * @typeParam T - The built-in series type (e.g., `"Line"`, `"Area"`, `"Candlestick"`, etc.)
 *
 * @param props.type - The type of series to render.
 * @param props.data - The time-series data to be displayed.
 * @param props.onCreateSeries - Optional callback that receives the underlying `ISeriesApi<T>`.
 * @param props.onSetData - Optional callback fired after `setData()` is called.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/api/interfaces/ISeriesApi
 * @see https://tradingview.github.io/lightweight-charts/docs/series-types
 */
TimeChart.Series = Series;

const CustomSeries = (props: CustomSeriesProps<Time>) => {
  const {
    chart,
    primitives: chartPrimitives,
    onChartPrimitivesAttached,
    onChartPrimitivesDetached,
  } = useTimeChart();
  const { paneIdx, panePrimitives, onPanePrimitivesAttached, onPanePrimitivesDetached } =
    useContext(PaneContext);

  const _props = mergeProps(
    {
      primitives: [] as SeriesPrimitive<"Custom", Time>[],
      markers: () => [] as SeriesMarker<Time>[],
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
 * A custom series component for the `TimeChart`, used to render data points
 * over time-based X-axis values (e.g., dates and values).
 *
 * @param props.paneView - The required pane view for the custom series -- defines the basic functionality and structure required for creating a custom series view.
 * @param props.data - Time-series data to render (e.g., dates and values).
 * @param props.primitives - Optional [primitives](https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives) to attach to the series.
 * @param props.onCreateSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onRemoveSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onSetData - Optional callback fired after `setData()` is called.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/custom_series
 */
TimeChart.CustomSeries = CustomSeries;

const Tooltip = (props: TooltipRootProps<Time>) => {
  const { chart } = useTimeChart();
  createTooltip(chart, props);
  return null;
};

/**
 * Custom tooltip component for the `TimeChart`.
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
 * <TimeChart>
 *   <TimeChart.Series type="Line" data={data} />
 *   <TimeChart.Tooltip>
 *     {({ time, seriesData }) => (
 *       <div class="tooltip">
 *         <div>Time: {time}</div>
 *         <div>Value: {Array.from(seriesData.values())[0]?.value}</div>
 *       </div>
 *     )}
 *   </TimeChart.Tooltip>
 * </TimeChart>
 * ```
 */
TimeChart.Tooltip = Tooltip;
