# @dschz/solid-lightweight-charts

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
