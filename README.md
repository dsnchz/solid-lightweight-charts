<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Ecosystem&background=tiles&project=solid-lightweight-charts" alt="solid-lightweight-charts">
</p>

# @dschz/solid-lightweight-charts

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Lightweight Charts](https://img.shields.io/badge/lightweight--charts-5.0.0+-orange?style=flat-square)](https://github.com/tradingview/lightweight-charts)
[![npm](https://img.shields.io/npm/v/@dschz/solid-lightweight-charts?color=blue)](https://www.npmjs.com/package/@dschz/solid-lightweight-charts)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@dschz/solid-lightweight-charts)](https://bundlephobia.com/package/@dschz/solid-lightweight-charts)
[![JSR](https://jsr.io/badges/@dschz/solid-lightweight-charts/score)](https://jsr.io/@dschz/solid-lightweight-charts)
[![CI](https://github.com/dsnchz/solid-lightweight-charts/actions/workflows/ci.yaml/badge.svg)](https://github.com/dsnchz/solid-lightweight-charts/actions/workflows/ci.yaml)
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?logo=discord&logoColor=white)](https://discord.gg/jV4MghpHUA)

> A fully typed SolidJS wrapper around TradingView's [Lightweight Charts](https://github.com/tradingview/lightweight-charts), providing declarative, reactive charting with support for time series, price, and yield curve data.

![Solid Lightweight Charts Showcase](assets/solid-lightweight-charts-showcase.png)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎉 What's New in v0.4.0](#-whats-new-in-v040)
- [📆 Installation](#-installation)
- [🚀 Quick Usage](#-quick-usage)
  - [TimeChart (Time-based Data)](#timechart-time-based-data)
  - [PriceChart (Numeric X-axis)](#pricechart-numeric-x-axis)
  - [YieldCurveChart (Duration-based)](#yieldcurvechart-duration-based)
- [📏 Chart Sizing & Layout](#-chart-sizing--layout)
  - [Understanding the Component Structure](#understanding-the-component-structure)
  - [How to Size Your Charts](#how-to-size-your-charts)
  - [Understanding autoSize](#understanding-autosize)
  - [Container Class](#container-class)
  - [Common Patterns](#common-patterns)
- [📊 Chart Examples](#chart-examples)
  - [Multiple Panes and Markers](#multiple-panes-and-markers)
  - [Custom Series](#custom-series)
  - [Series Primitives](#series-primitives)
  - [Pane Primitives](#pane-primitives)
- [🛠 Playground & Examples](#-playground--examples)
- [📚 Resources](#-resources)
- [📄 License](#-license)

## ✨ Features

- ⚡ **SolidJS-native reactivity** for all chart options and data updates
- 🔀 **Multiple chart types** with specialized APIs:
  - `TimeChart` for time-based financial data
  - `PriceChart` for numeric-based price data
  - `YieldCurveChart` for rate curves and duration-based data
- 📈 **Built-in series support**: Line, Area, Candlestick, Bar, Histogram, Baseline
- 🎨 **Custom series support** with full TypeScript integration across all chart types
- 📍 **Series markers** with declarative prop support and reactive updates
- 💬 **Custom JSX tooltips** with flexible rendering (inline JSX or reusable components)
- 📆 **Namespaced APIs** (e.g. `<TimeChart.Series />`, `<PriceChart.Series />`)
- 📊 **Multi-Pane support** for advanced multi-series visualization
- 🖼️ **Pane/Series primitives** for interactive drawings (trend lines, alerts, annotations)
- 🔄 **Lifecycle/Event hooks** for chart, series data, primitives and markers.
- 🔖 **Core API compatibility** - access underlying `lightweight-charts` APIs when needed
- 🧹 **Automatic cleanup** and proper lifecycle management

## 🎉 What's New in v0.4.0

- **Custom JSX Tooltips** - Full tooltip support across all chart types (TimeChart, PriceChart, YieldCurveChart) with flexible rendering options using either inline JSX or reusable components
- For a full list of changes and details, see the [CHANGELOG.md](./CHANGELOG.md).

## 📆 Installation

Install via your favorite package manager:

```bash
npm install solid-js lightweight-charts @dschz/solid-lightweight-charts
pnpm install solid-js lightweight-charts @dschz/solid-lightweight-charts
yarn install solid-js lightweight-charts @dschz/solid-lightweight-charts
bun install solid-js lightweight-charts @dschz/solid-lightweight-charts
```

> These are **peer dependencies**, so they must be installed manually:
>
> - `solid-js`
> - `lightweight-charts`

## 🚀 Quick Usage

### TimeChart (Time-based Data)

```tsx
import { TimeChart } from "@dschz/solid-lightweight-charts";

<TimeChart>
  <TimeChart.Series
    type="Line"
    data={[
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 105 },
    ]}
    lineWidth={2}
    color="#2962FF"
  />
</TimeChart>;
```

### PriceChart (Numeric X-axis)

```tsx
import { PriceChart } from "@dschz/solid-lightweight-charts";

<PriceChart>
  <PriceChart.Series
    type="Line"
    data={[
      { time: 0, value: 100 },
      { time: 1, value: 105 },
    ]}
    lineWidth={2}
    color="#2962FF"
  />
</PriceChart>;
```

### YieldCurveChart (Duration-based)

```tsx
import { YieldCurveChart } from "@dschz/solid-lightweight-charts";

<YieldCurveChart>
  <YieldCurveChart.Series
    type="Line"
    data={[
      { time: 0, value: 3.5 }, // 0M
      { time: 12, value: 3.8 }, // 12M
      { time: 60, value: 4.2 }, // 5Y
    ]}
    lineWidth={2}
    color="#2962FF"
  />
</YieldCurveChart>;
```

## 📏 Chart Sizing & Layout

Chart components (`TimeChart`, `PriceChart`, `YieldCurveChart`) **do not apply any default sizing styles**. You have complete control over how your charts are sized.

### Understanding the Component Structure

It's important to understand that chart components have **two levels of configuration**:

```tsx
<TimeChart
  class="h-[400px] w-full" // Applied to container div
  style={{ border: "1px solid red" }} // Applied to container div
  autoSize={true} // Passed to Lightweight Charts
  width={800} // Passed to Lightweight Charts (ignored if autoSize=true)
  height={400} // Passed to Lightweight Charts (ignored if autoSize=true)
>
  <TimeChart.Series type="Line" data={data} />
</TimeChart>
```

**Container Level** (`class`, `style`, `id`):

- Controls the HTML div that wraps the chart
- Handles sizing, positioning, borders, backgrounds, etc.
- Uses standard CSS/HTML attributes

**Chart Level** (`autoSize`, `width`, `height`, chart options):

- Passed directly to the underlying Lightweight Charts instance
- Controls chart-specific behavior and rendering
- Uses Lightweight Charts API

### How to Size Your Charts

**Option 1: CSS Classes (Recommended)**

```tsx
<TimeChart class="h-[400px] w-full">
  <TimeChart.Series type="Line" data={data} />
</TimeChart>
```

**Option 2: Inline Styles**

```tsx
<TimeChart style={{ height: "400px", width: "100%" }}>
  <TimeChart.Series type="Line" data={data} />
</TimeChart>
```

**Option 3: Fixed Dimensions (autoSize=false)**

```tsx
<TimeChart autoSize={false} width={800} height={400}>
  <TimeChart.Series type="Line" data={data} />
</TimeChart>
```

### Understanding autoSize

- **`autoSize: true` (default)**: Chart fills its container div. The `width` and `height` props are ignored.
- **`autoSize: false`**: Chart uses explicit `width` and `height` props for fixed dimensions.

**Key Point**: When `autoSize={true}`, the chart will automatically resize to match whatever size you've given the container div via `class` or `style`.

### Container Class

All chart containers include the `solid-lwc-container` class for easy global styling:

```css
.solid-lwc-container {
  height: 400px;
  width: 100%;
}
```

### Common Patterns

**Responsive with Tailwind:**

```tsx
<TimeChart class="h-[400px] w-full md:h-[500px]">
  <TimeChart.Series type="Line" data={data} />
</TimeChart>
```

**Fixed size for specific use cases:**

```tsx
<TimeChart autoSize={false} width={600} height={300}>
  <TimeChart.Series type="Line" data={data} />
</TimeChart>
```

**Parent container sizing:**

```tsx
<div class="h-[400px] w-full">
  <TimeChart style={{ height: "100%", width: "100%" }}>
    <TimeChart.Series type="Line" data={data} />
  </TimeChart>
</div>
```

**Container styling + chart options:**

```tsx
<TimeChart
  class="h-[500px] w-full border rounded-lg shadow"
  rightPriceScale={{ visible: true }}
  timeScale={{ timeVisible: true }}
>
  <TimeChart.Series type="Line" data={data} />
</TimeChart>
```

> **Important**: Charts need explicit dimensions to render. If you see a blank chart, make sure you've provided sizing through CSS classes, inline styles, or fixed dimensions.

## 📊 Chart Examples

### Multiple Panes and Markers

```tsx
import { TimeChart } from "@dschz/solid-lightweight-charts";

<TimeChart>
  {/* Main pane with price data and declarative markers */}
  <TimeChart.Series
    type="Candlestick"
    data={candleData}
    markers={(data) => [
      {
        time: data[10].time,
        position: "aboveBar",
        color: "#f68410",
        shape: "circle",
        text: "Buy",
      },
      {
        time: data[20].time,
        position: "belowBar",
        color: "#e91e63",
        shape: "arrowDown",
        text: "Sell",
      },
    ]}
    onSetMarkers={(markers) => console.log("Markers updated:", markers)}
  />

  {/* Secondary pane with volume */}
  <TimeChart.Pane>
    <TimeChart.Series
      type="Histogram"
      data={volumeData}
      priceScaleId="volume"
      color="rgba(76, 175, 80, 0.8)"
    />
  </TimeChart.Pane>
</TimeChart>;
```

### Custom Series

```tsx
import { TimeChart } from "@dschz/solid-lightweight-charts";

// Define your custom pane view
const customPaneView = {
  updateAllViews() {
    /* implementation */
  },
  paneViews() {
    /* implementation */
  },
  priceValueBuilder(plotRow) {
    /* implementation */
  },
  isWhitespace(data) {
    /* implementation */
  },
  defaultOptions() {
    /* implementation */
  },
};

<TimeChart>
  <TimeChart.CustomSeries
    paneView={customPaneView}
    data={customData}
    onCreateSeries={(series) => console.log("Custom series created:", series)}
  />
</TimeChart>;
```

### Series Primitives

```tsx
import { TimeChart, type SeriesPrimitive } from "@dschz/solid-lightweight-charts";
import type {
  ISeriesPrimitiveAxisView,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  Time,
  SeriesAttachedParameter,
} from "lightweight-charts";

// Trend line primitive with proper TypeScript implementation
class TrendLinePrimitive implements SeriesPrimitive<"Line", Time> {
  private _paneViews: TrendLinePaneView[];
  private _point1: { time: Time; value: number };
  private _point2: { time: Time; value: number };

  constructor(point1: { time: Time; value: number }, point2: { time: Time; value: number }) {
    this._point1 = point1;
    this._point2 = point2;
    this._paneViews = [new TrendLinePaneView(this)];
  }

  updateAllViews() {
    this._paneViews.forEach((pv) => pv.update());
  }

  paneViews() {
    return this._paneViews;
  }

  attached(param: SeriesAttachedParameter<Time, "Line">) {
    // Implementation for when primitive is attached
  }

  detached() {
    // Cleanup when primitive is detached
  }

  getPoint1() {
    return this._point1;
  }
  getPoint2() {
    return this._point2;
  }
}

class TrendLinePaneView implements IPrimitivePaneView {
  private _source: TrendLinePrimitive;
  private _renderer: TrendLinePaneRenderer;

  constructor(source: TrendLinePrimitive) {
    this._source = source;
    this._renderer = new TrendLinePaneRenderer();
  }

  update() {
    this._renderer.setData({
      point1: this._source.getPoint1(),
      point2: this._source.getPoint2(),
    });
  }

  renderer() {
    return this._renderer;
  }

  zOrder() {
    return "normal" as const;
  }
}

class TrendLinePaneRenderer implements IPrimitivePaneRenderer {
  private _data: { point1: any; point2: any } | null = null;

  setData(data: { point1: any; point2: any } | null) {
    this._data = data;
  }

  draw(target: any) {
    if (!this._data) return;
    // Canvas 2D rendering implementation
    target.useBitmapCoordinateSpace((scope: any) => {
      const ctx = scope.context;
      // Draw trend line using this._data.point1 and this._data.point2
      // ... drawing logic
    });
  }
}

const trendLine = new TrendLinePrimitive(
  { time: "2023-01-01" as Time, value: 100 },
  { time: "2023-01-10" as Time, value: 120 },
);

<TimeChart>
  <TimeChart.Series
    type="Line"
    data={priceData}
    primitives={[trendLine]}
    onAttachPrimitives={(primitives) => console.log("Primitives attached:", primitives)}
  />
</TimeChart>;
```

### Pane Primitives

```tsx
import { TimeChart, type PanePrimitive } from "@dschz/solid-lightweight-charts";
import type {
  IPanePrimitivePaneView,
  IPrimitivePaneRenderer,
  PaneAttachedParameter,
  Time,
} from "lightweight-charts";

// Watermark primitive with proper TypeScript implementation
class WatermarkPrimitive implements PanePrimitive<Time> {
  private _paneViews: WatermarkPaneView[];
  private _text: string;
  private _color: string;
  private _fontSize: number;

  constructor(text: string, color = "rgba(128, 128, 128, 0.3)", fontSize = 48) {
    this._text = text;
    this._color = color;
    this._fontSize = fontSize;
    this._paneViews = [new WatermarkPaneView(this)];
  }

  updateAllViews() {
    this._paneViews.forEach((pv) => pv.update());
  }

  paneViews() {
    return this._paneViews;
  }

  attached(param: PaneAttachedParameter<Time>) {
    // Pane primitives can use this for initialization
  }

  detached() {
    // Cleanup if needed
  }

  getText() {
    return this._text;
  }
  getColor() {
    return this._color;
  }
  getFontSize() {
    return this._fontSize;
  }
}

class WatermarkPaneView implements IPanePrimitivePaneView {
  private _source: WatermarkPrimitive;
  private _renderer: WatermarkPaneRenderer;

  constructor(source: WatermarkPrimitive) {
    this._source = source;
    this._renderer = new WatermarkPaneRenderer();
  }

  update() {
    this._renderer.setData({
      text: this._source.getText(),
      color: this._source.getColor(),
      fontSize: this._source.getFontSize(),
    });
  }

  renderer() {
    return this._renderer;
  }

  zOrder() {
    return "bottom" as const;
  }
}

class WatermarkPaneRenderer implements IPrimitivePaneRenderer {
  private _data: { text: string; color: string; fontSize: number } | null = null;

  setData(data: { text: string; color: string; fontSize: number } | null) {
    this._data = data;
  }

  draw(target: any) {
    if (!this._data) return;

    target.useBitmapCoordinateSpace((scope: any) => {
      const ctx = scope.context;
      const { width, height } = scope.bitmapSize;

      ctx.save();
      ctx.font = `${this._data!.fontSize}px Arial`;
      ctx.fillStyle = this._data!.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw watermark in center of pane
      ctx.fillText(this._data!.text, width / 2, height / 2);
      ctx.restore();
    });
  }
}

const watermark = new WatermarkPrimitive("DEMO CHART");

<TimeChart>
  <TimeChart.Series type="Line" data={priceData} />

  <TimeChart.Pane
    primitives={[watermark]}
    onAttachPrimitives={(primitives) => console.log("Pane primitives attached")}
  >
    <TimeChart.Series type="Histogram" data={volumeData} />
  </TimeChart.Pane>
</TimeChart>;
```

> **💡 Complete Examples**: For fully working primitive implementations with comprehensive TypeScript types, see the interactive examples in our playground:
>
> - [`SeriesPrimitivesExample.tsx`](./playground/pages/SeriesPrimitivesExample.tsx) - Trend lines, support/resistance, price alerts, annotations
> - [`PanePrimitivesExample.tsx`](./playground/pages/PanePrimitivesExample.tsx) - Watermarks, grid overlays, corner badges

## 🛠 Playground & Examples

See [`playground/App.tsx`](./playground/App.tsx) for a complete working showcase with live interactive examples:

**Core Chart Types:**

- TimeChart with multiple panes (Candlestick+Line, Volume, Area) and series markers
- PriceChart with multiple panes (Line+Area, Histogram) and series markers
- YieldCurveChart with multiple panes (Line, Area) and series markers

**Advanced Features (New in v0.2.0):**

- **Series Primitives Example** - Interactive trend lines, support/resistance levels, price alerts, and text annotations
- **Pane Primitives Example** - Watermarks, custom grid overlays, and corner badges with live updates
- **Custom Series Integration** - Complete examples with proper TypeScript interfaces
- **Dynamic Management** - Real-time updates, lifecycle management, and memory optimization

Run the playground locally:

```bash
git clone https://github.com/dsnchz/solid-lightweight-charts
cd solid-lightweight-charts
bun install
bun start
```

## 📚 Resources

- [TradingView Lightweight Charts Docs](https://tradingview.github.io/lightweight-charts/)
- [Lightweight Charts GitHub](https://github.com/tradingview/lightweight-charts)
- [Discord](https://discord.gg/jV4MghpHUA)

> Full documentation and advanced guides coming soon.

## 📄 License

MIT © [Daniel Sanchez](https://github.com/dsnchz)
