import type {
  CustomData,
  CustomSeriesOptions,
  IChartApiBase,
  ICustomSeriesPaneView,
  IPanePrimitive,
  ISeriesApi,
  ISeriesPrimitiveBase,
  MouseEventHandler,
  SeriesAttachedParameter,
  SeriesDataItemTypeMap,
  SeriesMarker,
  SeriesPartialOptionsMap,
  SeriesType,
  Time,
} from "lightweight-charts";
import type { Accessor, Component, JSX } from "solid-js";

// Special internal type to track the next pane index for chart instances
export type ChartWithPaneState<T> = T & {
  __nextPaneIndex: number;
  __getNextPaneIndex: () => number;
};

export type IOptionsChartApi = IChartApiBase<number>;
export type BuiltInSeriesType = Exclude<SeriesType, "Custom">;

export type ChartContextType<T, HorzScaleItem = Time> = {
  readonly chart: Accessor<T>;
  readonly primitives: Accessor<PanePrimitive<HorzScaleItem>[]>;
  readonly onChartPrimitivesAttached: (primitives: PanePrimitive<HorzScaleItem>[]) => void;
  readonly onChartPrimitivesDetached: (primitives: PanePrimitive<HorzScaleItem>[]) => void;
};

/**
 * Common props for all chart components.
 */
export type ChartCommonProps<T, HorzScaleItem = Time> = {
  /**
   * The id of the chart container.
   */
  readonly id?: string;

  /**
   * The class name of the chart container.
   */
  readonly class?: string;

  /**
   * The style of the chart container.
   */
  readonly style?: JSX.CSSProperties;

  /**
   * The pane primitives to be used for the default chart pane (pane index 0).
   */
  readonly primitives?: PanePrimitive<HorzScaleItem>[];

  /**
   * Whether to force a repaint of the chart when the chart is resized.
   */
  readonly forceRepaintOnResize?: boolean;

  /**
   * The ref of the chart container.
   */
  readonly ref?: (el: HTMLDivElement) => void;

  /**
   * Callback function that is called when the chart is created.
   * @param chart - The created chart instance.
   */
  readonly onCreateChart?: (chart: T) => void;

  /**
   * Callback function that is called when the chart is resized. If autoSize is `true`, this will not be called.
   * @param width - The width of the chart.
   * @param height - The height of the chart.
   */
  readonly onResize?: (width: number, height: number) => void;

  /**
   * Callback function that is called when the pane primitives are attached to the root chart pane.
   * @param primitives - The primitives that were attached to the root chart pane.
   */
  readonly onPrimitivesAttached?: (primitives: PanePrimitive<HorzScaleItem>[]) => void;

  /**
   * Callback function that is called when the pane primitives are detached from the root chart pane.
   * @param primitives - The primitives that were detached from the root chart pane.
   */
  readonly onPrimitivesDetached?: (primitives: PanePrimitive<HorzScaleItem>[]) => void;

  /**
   * Callback function that is called when the chart is clicked.
   * @param event - The event that was triggered.
   */
  readonly onClick?: MouseEventHandler<HorzScaleItem> | MouseEventHandler<HorzScaleItem>[];

  /**
   * Callback function that is called when the chart is double clicked.
   * @param event - The event that was triggered.
   */
  readonly onDblClick?: MouseEventHandler<HorzScaleItem> | MouseEventHandler<HorzScaleItem>[];

  /**
   * Callback function that is called when the crosshair moves.
   * @param event - The event that was triggered.
   */
  readonly onCrosshairMove?: MouseEventHandler<HorzScaleItem> | MouseEventHandler<HorzScaleItem>[];
};

/**
 * The type for the Lightweight Charts pane primitive object.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/pane-primitives
 */
export type PanePrimitive<HorzScaleItem = Time> = IPanePrimitive<HorzScaleItem>;

/**
 * The type for the Lightweight Charts series primitive object.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives
 */
export type SeriesPrimitive<T extends SeriesType, HorzScaleItem = Time> = ISeriesPrimitiveBase<
  SeriesAttachedParameter<HorzScaleItem, T>
>;

export type SeriesCommonProps<
  T extends SeriesType,
  HorzScaleItem = Time,
> = SeriesPartialOptionsMap[T] & {
  /**
   * The data to be displayed in the series.
   */
  readonly data: SeriesDataItemTypeMap<HorzScaleItem>[T][];

  /**
   * The primitives to be used for the series.
   *
   * @see https://tradingview.github.io/lightweight-charts/docs/plugins/series-primitives
   */
  readonly primitives?: SeriesPrimitive<T, HorzScaleItem>[];

  /**
   * The markers to be used for the series.
   */
  readonly markers?: (
    data: SeriesDataItemTypeMap<HorzScaleItem>[T][],
  ) => SeriesMarker<HorzScaleItem>[];

  /**
   * Callback function that is called when the series is created.
   * @param series - The created line series instance.
   */
  readonly onCreateSeries?: (series: ISeriesApi<T, HorzScaleItem>, paneIndex: number) => void;

  /**
   * Callback function that is called when the series is removed.
   * @param series - The removed line series instance.
   */
  readonly onRemoveSeries?: (series: ISeriesApi<T, HorzScaleItem>, paneIndex: number) => void;

  /**
   * Callback function that is called when the series data is set. Listening to this callback can be useful
   * for when you want to make use of the [createSeriesMarker](https://tradingview.github.io/lightweight-charts/tutorials/how_to/series-markers) API
   * to generate custom markers based on the data within the series.
   *
   * @param params - An object containing the series instance and the data being set
   */
  readonly onSetData?: (params: OnSetDataParams<T, HorzScaleItem>) => void;

  /**
   * Callback function that is called when the series markers are set.
   * @param markers - The markers that were set on the series
   */
  readonly onSetMarkers?: (markers: SeriesMarker<HorzScaleItem>[]) => void;

  /**
   * Callback function that is called when the series primitives are attached.
   * @param primitives - The primitives that were attached to the series
   */
  readonly onAttachPrimitives?: (primitives: SeriesPrimitive<T, HorzScaleItem>[]) => void;

  /**
   * Callback function that is called when the series primitives are detached.
   * @param primitives - The primitives that were detached from the series
   */
  readonly onDetachPrimitives?: (primitives: SeriesPrimitive<T, HorzScaleItem>[]) => void;
};

/**
 * Parameters passed to the onSetData callback function
 */
export type OnSetDataParams<T extends SeriesType, HorzScaleItem = Time> = {
  /**
   * The chart instance that had seriesdata set on it
   */
  readonly chart: Omit<IChartApiBase<HorzScaleItem>, "addSeries">;

  /**
   * The series instance that had data set on it
   */
  readonly series: ISeriesApi<T, HorzScaleItem>;

  /**
   * The data that was set on the series
   */
  readonly data: SeriesDataItemTypeMap<HorzScaleItem>[T][];
};

/**
 * Props for the Lightweight Charts Series component.
 */
export type SeriesProps<T extends BuiltInSeriesType, HorzScaleItem = Time> = SeriesCommonProps<
  T,
  HorzScaleItem
> & {
  /**
   * The type of the series.
   */
  readonly type: T;
};

/**
 * The type for the Lightweight Charts custom series pane view object.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/custom_series
 */
export type CustomSeriesPaneView<HorzScaleItem = Time> = ICustomSeriesPaneView<
  HorzScaleItem,
  CustomData<HorzScaleItem>,
  CustomSeriesOptions
>;

/**
 * Props for the Lightweight Charts Custom Series component.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/plugins/custom_series
 */
export type CustomSeriesProps<HorzScaleItem = Time> = SeriesCommonProps<"Custom", HorzScaleItem> & {
  readonly paneView: CustomSeriesPaneView<HorzScaleItem>;
};

export type PaneContextType<HorzScaleItem = Time> = {
  readonly paneIdx: Accessor<number>;
  readonly panePrimitives: Accessor<PanePrimitive<HorzScaleItem>[]>;
  readonly onPanePrimitivesAttached: (primitives: PanePrimitive<HorzScaleItem>[]) => void;
  readonly onPanePrimitivesDetached: (primitives: PanePrimitive<HorzScaleItem>[]) => void;
};

/**
 * Props for the Lightweight Charts Pane component.
 */
export type PaneProps<HorzScaleItem = Time> = {
  /**
   * The index of the pane.
   */
  readonly index?: number;

  /**
   * The children of the pane.
   */
  readonly children: JSX.Element;

  /**
   * The primitives to be used for the pane.
   *
   * @see https://tradingview.github.io/lightweight-charts/docs/plugins/pane-primitives
   */
  readonly primitives?: PanePrimitive<HorzScaleItem>[];

  /**
   * Callback function that is called when the pane primitives are attached.
   * @param primitives - The primitives that were attached to the pane
   */
  readonly onAttachPrimitives?: (primitives: PanePrimitive<HorzScaleItem>[]) => void;

  /**
   * Callback function that is called when the pane primitives are detached.
   * @param primitives - The primitives that were detached from the pane
   */
  readonly onDetachPrimitives?: (primitives: PanePrimitive<HorzScaleItem>[]) => void;
};

type SeriesDataValue<T extends SeriesType = SeriesType, HorzScaleItem = Time> =
  | SeriesDataItemTypeMap[T]
  | { time: HorzScaleItem };

/**
 * The position of the cursor relative to the chart's top-left corner.
 */
type Point = {
  readonly x: number;
  readonly y: number;
};

/**
 * The position of the tooltip relative to the cursor position.
 */
type Position = {
  readonly left: number;
  readonly top: number;
};

/**
 * The chart API for the tooltip.
 *
 * @see https://tradingview.github.io/lightweight-charts/docs/api/interfaces/IChartApiBase
 */
export type TooltipChartApi<HorzScaleItem = Time> = Omit<IChartApiBase<HorzScaleItem>, "addSeries">;

/**
 * Props passed to the SolidJS component that renders the tooltip content.
 *
 * Note: These props are only provided when the tooltip is visible and the cursor
 * is within bounds, so time and point are guaranteed to be defined.
 */
export type TooltipProps<HorzScaleItem = Time> = {
  /** Chart instance for advanced use cases */
  readonly chart: TooltipChartApi<HorzScaleItem>;

  /** Cursor position relative to the chart's top-left corner */
  readonly point: Point;

  /** Time/horizontal axis value at the cursor position */
  readonly time: HorzScaleItem;

  /** Map of series to their data values at the cursor position */
  readonly seriesData: Map<
    ISeriesApi<SeriesType, HorzScaleItem>,
    SeriesDataValue<SeriesType, HorzScaleItem>
  >;
};

/**
 * The root props for the chart tooltip component.
 */
export type TooltipRootProps<HorzScaleItem = Time> = {
  /**
   * HTML id attribute for the tooltip root
   *
   * @default "solid-lwc-tooltip-root"
   */
  readonly id?: string;
  /**
   * CSS class name for the tooltip root
   *
   * @default undefined
   */
  readonly class?: string;
  /**
   * Inline styles for the tooltip root
   *
   * @default {}
   */
  readonly style?: JSX.CSSProperties;
  /**
   * The z-index of the tooltip root
   * @default 20
   */
  readonly zIndex?: number;
  /**
   * Use fixed positioning for the tooltip. Set to true when the chart is in a
   * fixed positioning context (like a dialog or modal) to prevent tooltip clipping.
   * @default false
   */
  readonly fixed?: boolean;

  /**
   * The offset of the tooltip from the cursor position.
   * @default { x: 8, y: 8 }
   */
  readonly offset?: {
    readonly x?: number;
    readonly y?: number;
  };

  /**
   * Optional children function to render the tooltip content.
   */
  readonly children?: (props: TooltipProps<HorzScaleItem>) => JSX.Element;

  /**
   * Optional component to render the tooltip content.
   */
  readonly component?: Component<TooltipProps<HorzScaleItem>>;

  /**
   * Optional callback to process or modify the calculated tooltip position.
   * Receives the calculated position and placement preference, and should return a position object with the same structure.
   * Use this to implement custom positioning logic or constraints.
   *
   * @param position - The calculated position with left and top coordinates
   * @returns Modified position object with left and top coordinates
   *
   * @example
   * ```ts
   * onPositionCalculated: (position) => ({
   *   left: Math.max(0, position.left), // Prevent negative positioning
   *   top: position.top - 5
   * })
   * ```
   */
  readonly onPositionCalculated?: (position: Position) => Position;

  /**
   * Optional callback to be called when the tooltip is hidden.
   */
  readonly onHide?: () => void;
  /**
   * Optional callback to be called when the tooltip is shown.
   */
  readonly onShow?: () => void;
};
