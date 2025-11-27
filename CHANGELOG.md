# @dschz/solid-lightweight-charts

## 0.4.0

### Summary

Version 0.4.0 introduces comprehensive tooltip support across all chart types with flexible rendering options and full SolidJS reactivity.

#### 💬 Custom JSX Tooltips

- **Tooltip components** for all chart types (`TimeChart.Tooltip`, `PriceChart.Tooltip`, `YieldCurveChart.Tooltip`)
- **Two rendering modes** for maximum flexibility:
  - **Inline JSX pattern** - Render tooltips using a children function that receives tooltip data
  - **Component prop pattern** - Pass reusable tooltip components for consistent styling across charts
- **Full type safety** with TypeScript integration and proper chart-specific types
- **SolidJS reactivity** - Tooltips automatically update when hovering over chart data
- **Flexible positioning** with customizable offset, placement, and styling options
- **Automatic lifecycle management** - Tooltips are properly mounted, updated, and cleaned up

#### 📊 Tooltip Props & Configuration

**TooltipRootProps** - Configuration options for tooltip behavior:

- `id` - HTML id attribute for the tooltip root element (default: "solid-lwc-tooltip-root")
- `class` - CSS class for custom styling
- `style` - Inline styles for the tooltip container
- `zIndex` - Z-index for tooltip positioning (default: 20)
- `fixed` - Use fixed positioning for modals/dialogs (default: false)
- `offset` - Position offset from cursor (default: { x: 8, y: 8 })
- `onShow` - Callback when tooltip becomes visible
- `onHide` - Callback when tooltip becomes hidden
- `onPositionCalculated` - Callback for custom position calculations
- `children` - Function that receives tooltip data and returns JSX
- `component` - Alternative to children: a component that receives tooltip data as props

**TooltipProps** - Data passed to tooltip render functions:

- `chart` - The chart instance for advanced use cases
- `point` - Cursor position relative to the chart's top-left corner
- `time` - Time/horizontal axis value at the cursor position (Time for TimeChart, number for PriceChart/YieldCurveChart)
- `seriesData` - Map of series to their data values at the cursor position

#### 📝 Usage Examples

**Inline JSX Pattern:**

```tsx
<TimeChart>
  <TimeChart.Series type="Candlestick" data={data} />
  <TimeChart.Tooltip>
    {(props) => (
      <div class="tooltip">
        <div>Time: {props.time}</div>
        <div>Value: {Array.from(props.seriesData.values())[0]?.value}</div>
      </div>
    )}
  </TimeChart.Tooltip>
</TimeChart>
```

**Component Prop Pattern:**

```tsx
const MyTooltip = (props: TooltipProps<Time>) => (
  <div class="tooltip">
    <div>Time: {props.time}</div>
    <Show when={Array.from(props.seriesData.values())[0]}>
      {(data) => <div>Value: {data().value}</div>}
    </Show>
  </div>
);

<TimeChart>
  <TimeChart.Series type="Line" data={data} />
  <TimeChart.Tooltip component={MyTooltip} />
</TimeChart>;
```

#### 🎯 Chart Type Support

- **TimeChart** - Tooltips with `Time` (string dates) as the horizontal scale
- **PriceChart** - Tooltips with numeric X-axis values
- **YieldCurveChart** - Tooltips with duration values (months) as the horizontal scale

#### 🔄 SolidJS Reactivity

Tooltips properly integrate with SolidJS's reactivity system:

- Use `Show` component with callback pattern for reactive data access
- All props passed to tooltip functions are reactive getters
- Automatic cleanup and re-rendering on data changes

#### 🛠️ Playground Examples

Added comprehensive `TooltipExample.tsx` showcasing:

- All three chart types with tooltips
- Both inline JSX and component prop patterns
- Proper SolidJS reactivity patterns
- Custom styling and theming examples

#### 🏗️ Internal Improvements

- Created reusable `createCustomSeries` hook for shared custom series logic
- Created reusable `createSeriesLifecycle` hook for shared series lifecycle management
- Eliminated ~360 lines of duplicated code across chart implementations
- Improved maintainability and consistency across all chart types

## 0.3.3

### Patch Changes

- Fixes broken price chart onSetData handler test

## 0.3.2

### Patch Changes

- Updates README content regarding chart sizing and adds table of contents for easier navigation.

## 0.3.1

### Patch Changes

- Removes default size styling (`width: 100%` and `height: 100%`) across all chart containers as this broke more things than it fixed.

## 0.3.0

### Summary

Version 0.3.0 of Solid Lightweight Charts adds support for more chart callbacks, addresses some pain points with chart sizing and some housekeeping items.

- **Chart Event Subscription Support:**

  - All chart components (`TimeChart`, `PriceChart`, `YieldCurveChart`) now support `onClick`, `onDblClick`, and `onCrosshairMove` props for subscribing to chart-level mouse and crosshair events.
  - These events provide access to mouse position, time, and price data for custom interactivity.
  - See the new "Chart Events" page in the playground for a live demo.

- **Default Class on Chart Containers:**

  - All chart container divs now include a default class: `solid-lwc-container`.
  - This makes it easy to target and style chart containers globally or in your own app.

- **Default Sizing Behavior:**

  - Chart containers now default to `width: 100%` and `height: 100%` via inline style, ensuring they fill their parent by default.
  - You can override this with the `style` or `class` prop.
  - To set a fixed size, set `autoSize={false}` and provide `width` and `height` props.

- **onSetData Callback Enhancement:**

  - The `onSetData` callback now includes the chart instance in its payload.
  - This allows users to call methods like `fitContent` after new data has been loaded, enabling more advanced chart interactions and auto-zooming.

- **Improved Documentation & Playground:**

  - Added a new "Chart Events" page to the playground to demonstrate event subscriptions.
  - Expanded README with a new section on chart sizing and layout, and clarified default behaviors.
  - Documented the new default class and sizing approach for chart containers.

## 0.2.5

### Patch Changes

- Adds JSR score badge

## 0.2.4

### Patch Changes

- fixes bundlephobia badge reference

## 0.2.3

### Patch Changes

- Updates readme badges

## 0.2.2

### Patch Changes

- Supports adding pane primitives to root chart panes

## 0.2.1

### Patch Changes

- Updates README markers example

## 0.2.0

### Summary of Changes

**Advanced Primitives & Custom Series Support** - This release significantly expands the charting capabilities with full support for custom visualizations and primitives.

#### 🎨 Custom Series Support

- **Custom series components** for all chart types (`TimeChart.CustomSeries`, `PriceChart.CustomSeries`, `YieldCurveChart.CustomSeries`)
- Full TypeScript integration with proper pane view interfaces
- Reactive data updates and lifecycle management for custom series

#### 🖼️ Series Primitives

- **Series primitives support** for creating custom visualizations attached to specific series
- Interactive drawing capabilities (trend lines, support/resistance levels, price alerts, annotations)
- Proper TypeScript interfaces (`SeriesPrimitive`, `ISeriesPrimitiveAxisView`, `IPrimitivePaneView`, `IPrimitivePaneRenderer`)
- Reactive primitive attachment/detachment with automatic cleanup

#### 🎯 Pane Primitives

- **Pane primitives support** for chart-wide decorations and backgrounds
- Full pane coverage for watermarks, custom grids, corner badges, and overlays
- Proper TypeScript interfaces (`PanePrimitive`, `IPanePrimitivePaneView`)
- Reactive primitive management with lifecycle hooks

#### 📍 Enhanced Markers

- **Series markers prop** for declarative marker management
- Integration with `createSeriesMarkers` API from lightweight-charts
- Reactive marker updates based on data changes
- Support across all chart types and custom series

#### 🔄 New Lifecycle Hooks

- **`onAttachPrimitives`** - Called when primitives are attached (series and pane level)
- **`onDetachPrimitives`** - Called when primitives are detached (series and pane level)
- **`onSetMarkers`** - Called when series markers are updated
- Enhanced primitive lifecycle management with proper cleanup

#### 🏗️ Developer Experience

- **Comprehensive example pages** showcasing primitives usage patterns
- **Interactive primitive demos** with multiple primitive types and real-time updates
- **Full test coverage** for all primitive functionality across chart types
- **Documentation and usage guides** for custom series and primitives implementation

#### 🔧 Technical Improvements

- Proper TypeScript interface compliance for all primitive classes
- Reactive primitive updates with SolidJS reactivity system
- Memory-efficient primitive management with automatic cleanup
- Cross-chart compatibility for primitives (Time, Price, YieldCurve charts)

## 0.1.2

### Patch Changes

- adds solid-js as dev dependency for jsr

## 0.1.1

### Patch Changes

- adds lightweight chart to dev dependencies

## 0.1.0

### Initial Release

**The MVP release** of @dschz/solid-lightweight-charts - A fully typed SolidJS wrapper around TradingView's Lightweight Charts

- **Multiple chart types** with specialized APIs:
  - `TimeChart` for time-based financial data (using `createChart`)
  - `PriceChart` for numeric-based price data (using `createOptionsChart`)
  - `YieldCurveChart` for rate curves and duration-based data (using `createYieldCurveChart`)
- **Complete series type support** for all built-in chart types: Line, Area, Candlestick, Bar, Histogram, Baseline
- **Namespaced component APIs** with intuitive syntax (`<TimeChart.Series />`, `<PriceChart.Series />`, `<YieldCurveChart.Series />`)
- **Multiple panes support** for advanced multi-series visualization (`<TimeChart.Pane />`, `<PriceChart.Pane />`, `<YieldCurveChart.Pane />`)
- **Series markers support** with integration for core `lightweight-charts` APIs (e.g. `createSeriesMarkers`)
- **SolidJS-native reactivity** for all chart options and data updates
- **Proper lifecycle management** and automatic state cleanup
- **Full TypeScript support** with comprehensive type definitions
- **Flexible data handling** with `onSetData` callbacks for advanced chart manipulation
- **Core API compatibility** - can still access underlying `lightweight-charts` APIs for advanced features
