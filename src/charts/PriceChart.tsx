import {
  createOptionsChart,
  createSeriesMarkers,
  type ISeriesApi,
  type SeriesMarker,
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

import { SERIES_DEFINITION_MAP } from "../constants";
import { createTooltip } from "../helpers/createTooltip";
import {
  attachPanePrimitives,
  createSubscriptionEffect,
  detachPanePrimitives,
} from "../helpers/utils";
import type {
  BuiltInSeriesType,
  ChartCommonProps,
  ChartContextType,
  ChartWithPaneState,
  CustomSeriesProps,
  IOptionsChartApi,
  PaneContextType,
  PanePrimitive,
  PaneProps,
  SeriesPrimitive,
  SeriesProps,
  TooltipRootProps,
} from "../types";

const PriceChartContext = createContext<ChartContextType<IOptionsChartApi, number>>();

export const usePriceChart = () => {
  const ctx = useContext(PriceChartContext);

  if (!ctx) {
    throw new Error("[solid-lightweight-charts] No parent PriceChart component found!");
  }

  return ctx;
};

type OptionsChartOptions = NonNullable<Parameters<typeof createOptionsChart>[1]>;

/**
 * Props for `PriceChart`, extending standard Lightweight Charts options
 * used in the `createOptionsChart` API.
 *
 * Includes chart lifecycle callbacks and responsive sizing behavior.
 *
 * @property ref - Optional DOM element ref callback
 * @property onCreateChart - Callback invoked with the chart instance after creation
 * @property onResize - Callback triggered on manual resize (only if `autoSize: false`)
 */
type OptionsChartProps = ChartCommonProps<IOptionsChartApi, number> & OptionsChartOptions;

/**
 * A SolidJS wrapper component for rendering horizontally price-scaled charts using
 * TradingView's `createOptionsChart` API.
 *
 * This chart is ideal for visualizing non-time-based data like:
 * - Option chains (e.g., time-to-expiry as X-axis)
 * - Custom indicators with numeric axes
 * - Static or synthetic data where time is not the primary domain
 *
 * Supports panes, series, and both auto-sized and fixed dimensions.
 *
 * @example
 * ```tsx
 * <PriceChart>
 *   <PriceChart.Series type="Line" data={...} />
 *   <PriceChart.Pane>
 *     <PriceChart.Series type="Histogram" data={...} />
 *   </PriceChart.Pane>
 * </PriceChart>
 * ```
 *
 * @param props - Options chart configuration and lifecycle hooks.
 */
export const PriceChart = (props: ParentProps<OptionsChartProps>): JSX.Element => {
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

  const [chart, setChart] = createSignal<IOptionsChartApi>();

  onMount(() => {
    _props.ref?.(chartContainer);

    const chart = createOptionsChart(
      chartContainer,
      chartOptions,
    ) as ChartWithPaneState<IOptionsChartApi>;

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
          <PriceChartContext.Provider
            value={{ chart, primitives, onChartPrimitivesAttached, onChartPrimitivesDetached }}
          >
            {local.children}
          </PriceChartContext.Provider>
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
  const { chart } = usePriceChart();

  const _props = mergeProps(
    {
      primitives: [] as PanePrimitive<number>[],
    },
    props,
  );

  const paneIdx = createMemo(
    () => _props.index ?? (chart() as ChartWithPaneState<IOptionsChartApi>).__getNextPaneIndex(),
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
 * Defines a vertical pane within a `PriceChart`.
 *
 * If `index` is not provided, it will automatically increment the pane index per chart instance,
 * starting from `1`. The default pane index is `0`.
 *
 * Each pane receives its own Y-axis and is stacked vertically within the chart layout.
 *
 * @example
 * ```tsx
 * <PriceChart.Pane>
 *   <PriceChart.Series type="Histogram" data={...} />
 * </PriceChart.Pane>
 * ```
 *
 * @param props.index - Optional pane index (auto-assigned if omitted)
 */
PriceChart.Pane = Pane;

const Series = <T extends BuiltInSeriesType>(props: SeriesProps<T, number>) => {
  const {
    chart,
    primitives: chartPrimitives,
    onChartPrimitivesAttached,
    onChartPrimitivesDetached,
  } = usePriceChart();
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
      SERIES_DEFINITION_MAP[_props.type],
      options,
      paneIdx(),
    ) as ISeriesApi<T, number>;
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
 * Renders a specific series (e.g., Line, Histogram, Area) into a `PriceChart` instance.
 * The series X-axis is price/numeric-based instead of time.
 *
 * This component reads the active pane index from context and attaches itself accordingly.
 *
 * @typeParam T - Series type (e.g., `"Line"`, `"Area"`, `"Candlestick"`, etc.)
 *
 * @param props.type - Type of series to add.
 * @param props.data - Numeric X-axis data to plot.
 * @param props.onCreateSeries - Optional callback when the underlying `ISeriesApi` is created.
 * @param props.onSetData - Optional callback triggered after setting the data.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/api/interfaces/IOptionsChartApi
 */
PriceChart.Series = Series;

const CustomSeries = (props: CustomSeriesProps<number>) => {
  const {
    chart,
    primitives: chartPrimitives,
    onChartPrimitivesAttached,
    onChartPrimitivesDetached,
  } = usePriceChart();
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
 * A custom series component for the `PriceChart`, used to render data points
 * over price-based X-axis values (e.g., prices and values).
 *
 * @param props.paneView - The required pane view for the custom series -- defines the basic functionality and structure required for creating a custom series view.
 * @param props.data - Numeric X-axis data to render (e.g., prices and values).
 * @param props.primitives - Optional [primitives](https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives) to attach to the series.
 * @param props.onCreateSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onRemoveSeries - Callback fired with the internal `ISeriesApi` instance.
 * @param props.onSetData - Optional callback fired after `setData()` is called.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/custom_series
 */
PriceChart.CustomSeries = CustomSeries;

const Tooltip = (props: TooltipRootProps<number>) => {
  const { chart } = usePriceChart();
  createTooltip(chart, props);
  return null;
};

/**
 * Custom tooltip component for the `PriceChart`.
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
 * <PriceChart>
 *   <PriceChart.Series type="Line" data={data} />
 *   <PriceChart.Tooltip>
 *     {({ time, seriesData }) => (
 *       <div class="tooltip">
 *         <div>Price: {time}</div>
 *         <div>Value: {Array.from(seriesData.values())[0]?.value}</div>
 *       </div>
 *     )}
 *   </PriceChart.Tooltip>
 * </PriceChart>
 * ```
 */
PriceChart.Tooltip = Tooltip;
