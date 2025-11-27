import { render, waitFor } from "@solidjs/testing-library";
import type { IYieldCurveChartApi, SeriesMarker } from "lightweight-charts";
import { createSeriesMarkers } from "lightweight-charts";
import { createSignal } from "solid-js";
import { describe, expect, test, vi } from "vitest";

import { YieldCurveChart } from "../charts/YieldCurveChart";

describe("CHART: YieldCurveChart", () => {
  test("creates the lightweight-charts container", () => {
    const onCreateChartMock = vi.fn();

    const { container } = render(() => <YieldCurveChart onCreateChart={onCreateChartMock} />);
    expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

    expect(onCreateChartMock).toHaveBeenCalled();
  });

  test("throws when series is rendered outside of chart", async () => {
    expect(() => render(() => <YieldCurveChart.Series type="Line" data={[]} />)).toThrow(
      "[solid-lightweight-charts] No parent YieldCurveChart component found!",
    );
  });

  test("applies custom class and style", () => {
    const { container } = render(() => (
      <YieldCurveChart class="custom-class" style={{ width: "500px" }} />
    ));

    const chartElement = container.firstChild as HTMLElement;
    expect(chartElement).toHaveClass("custom-class");
    expect(chartElement.style.width).toBe("500px");
  });

  test("applies chart options", async () => {
    let _yieldCurveChart: IYieldCurveChartApi;

    render(() => (
      <YieldCurveChart
        timeScale={{
          barSpacing: 5,
          minBarSpacing: 2,
        }}
        rightPriceScale={{
          visible: true,
          scaleMargins: { top: 0.1, bottom: 0.1 },
        }}
        onCreateChart={(chart) => {
          _yieldCurveChart = chart;
        }}
      />
    ));

    const chartOptions = _yieldCurveChart!.options();

    expect(chartOptions.timeScale.barSpacing).toBe(5);
    expect(chartOptions.timeScale.minBarSpacing).toBe(2);
    expect(chartOptions.rightPriceScale.visible).toBe(true);
    expect(chartOptions.rightPriceScale.scaleMargins.top).toBe(0.1);
    expect(chartOptions.rightPriceScale.scaleMargins.bottom).toBe(0.1);
  });

  test("handles resize when autoSize is false", () => {
    let _yieldCurveChart: IYieldCurveChartApi;
    const onResizeMock = vi.fn();

    const [dimensions, setDimensions] = createSignal({
      width: 800,
      height: 400,
    });

    render(() => (
      <YieldCurveChart
        autoSize={false}
        width={dimensions().width}
        height={dimensions().height}
        onResize={onResizeMock}
        onCreateChart={(chart) => {
          _yieldCurveChart = chart;
          vi.spyOn(_yieldCurveChart, "resize");
        }}
      />
    ));

    expect(_yieldCurveChart!).toBeDefined();

    setDimensions({ width: 1000, height: 500 });

    expect(_yieldCurveChart!.resize).toHaveBeenCalledWith(1000, 500, false);
    expect(onResizeMock).toHaveBeenCalledWith(1000, 500);
  });

  test("does not resize when autoSize is true", () => {
    let _yieldCurveChart: IYieldCurveChartApi;

    const [dimensions, setDimensions] = createSignal({
      width: 800,
      height: 400,
    });

    render(() => (
      <YieldCurveChart
        autoSize={true}
        width={dimensions().width}
        height={dimensions().height}
        onCreateChart={(chart) => {
          _yieldCurveChart = chart;
          vi.spyOn(_yieldCurveChart, "resize");
        }}
      />
    ));

    expect(_yieldCurveChart!).toBeDefined();

    setDimensions({ width: 1000, height: 500 });

    expect(_yieldCurveChart!.resize).not.toHaveBeenCalled();
  });

  test("renders a series", async () => {
    // YieldCurveChart uses numeric time values (similar to PriceChart)
    const testData = [
      { time: 0, value: 2.5 }, // 0M
      { time: 3, value: 2.7 }, // 3M
      { time: 6, value: 3.0 }, // 6M
    ];

    const onCreateSeriesMock = vi.fn();

    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series
          type="Line"
          data={testData}
          onCreateSeries={onCreateSeriesMock}
          color="#ff0000"
        />
      </YieldCurveChart>
    ));

    // Wait for the callback to be called
    await waitFor(() => {
      expect(onCreateSeriesMock).toHaveBeenCalled();
    });
  });

  test("updates series data when props change", async () => {
    // YieldCurveChart uses numeric time values
    const [data, setData] = createSignal([
      { time: 0, value: 2.5 }, // 0M
      { time: 12, value: 3.0 }, // 12M
    ]);

    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={data()} />
      </YieldCurveChart>
    ));

    // Update data after initial render
    await waitFor(() => {
      setData([
        { time: 0, value: 2.5 }, // 0M
        { time: 12, value: 3.0 }, // 12M
        { time: 60, value: 3.5 }, // 5Y
      ]);
    });
  });

  test("renders multiple series", async () => {
    const { container } = render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={[{ time: 0, value: 100 }]} />
        <YieldCurveChart.Series type="Area" data={[{ time: 0, value: 90 }]} />
      </YieldCurveChart>
    ));

    // Verify the chart container is present
    expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

    // Verify the table structure for chart rendering
    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();

    // Should have canvas elements for rendering the series
    const canvases = container.querySelectorAll("canvas");
    expect(canvases.length).toBeGreaterThan(0);
  });

  test("renders a pane with series", async () => {
    const { container } = render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={[{ time: 0, value: 100 }]} />
        <YieldCurveChart.Pane>
          <YieldCurveChart.Series type="Area" data={[{ time: 0, value: 1000 }]} />
        </YieldCurveChart.Pane>
      </YieldCurveChart>
    ));

    await waitFor(() => {
      // Verify the chart container is present
      expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

      // Verify the table structure
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();

      // Should have multiple rows for different panes
      const tableRows = table!.querySelectorAll("tr");
      expect(tableRows.length).toBeGreaterThan(1);

      // Should have a pane separator (1px height row) between panes
      const paneSeparator = Array.from(tableRows).find((row) => row.style.height === "1px");
      expect(paneSeparator).toBeInTheDocument();

      // Should have canvas elements for both panes
      const canvases = container.querySelectorAll("canvas");
      expect(canvases.length).toBeGreaterThan(1);
    });
  });

  test("renders a pane with explicit index", async () => {
    const { container } = render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={[{ time: 0, value: 100 }]} />
        <YieldCurveChart.Pane index={2}>
          <YieldCurveChart.Series type="Area" data={[{ time: 0, value: 1000 }]} />
        </YieldCurveChart.Pane>
      </YieldCurveChart>
    ));

    await waitFor(() => {
      // Verify the chart container is present
      expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

      // Verify the table structure
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();

      // Should have multiple rows for different panes (main + explicit index 2)
      const tableRows = table!.querySelectorAll("tr");
      expect(tableRows.length).toBeGreaterThan(1);

      // Should have pane separators
      const paneSeparators = Array.from(tableRows).filter((row) => row.style.height === "1px");
      expect(paneSeparators.length).toBeGreaterThan(0);
    });
  });

  test("calls onSetData when series data is set", async () => {
    const onSetDataMock = vi.fn();
    const testData = [
      { time: 0, value: 2.5 },
      { time: 12, value: 3.0 },
    ];

    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={testData} onSetData={onSetDataMock} />
      </YieldCurveChart>
    ));

    // Wait for series data to be set
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
    });
  });

  test("renders series with primitives", async () => {
    const testData = [{ time: 0, value: 100 }];
    const mockPrimitive = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
    };

    const { container } = render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={testData} primitives={[mockPrimitive]} />
      </YieldCurveChart>
    ));

    await waitFor(() => {
      // Verify the chart container is present
      expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

      // Verify the table structure
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();

      // Verify primitives were called
      expect(mockPrimitive.updateAllViews).toHaveBeenCalled();
    });
  });

  test("renders custom series", async () => {
    const testData = [{ time: 0, value: 2.5 }];
    const mockPaneView = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      renderer: vi.fn(),
      update: vi.fn(),
      priceValueBuilder: vi.fn(() => [2.5]), // Return array of values for custom series
      isWhitespace: vi.fn(() => false),
      defaultOptions: vi.fn(() => ({ color: "#000000" })),
    } as unknown as Parameters<typeof YieldCurveChart.CustomSeries>[0]["paneView"];

    const onCreateSeriesMock = vi.fn();

    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.CustomSeries
          paneView={mockPaneView}
          data={testData}
          onCreateSeries={onCreateSeriesMock}
        />
      </YieldCurveChart>
    ));

    // Wait for the callback to be called
    await waitFor(() => {
      expect(onCreateSeriesMock).toHaveBeenCalled();
    });
  });

  test("custom series with primitives", async () => {
    const testData = [{ time: 0, value: 100 }];
    const mockPaneView = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      renderer: vi.fn(),
      update: vi.fn(),
      priceValueBuilder: vi.fn(() => [100]),
      isWhitespace: vi.fn(() => false),
      defaultOptions: vi.fn(() => ({ color: "#000000" })),
    } as unknown as Parameters<typeof YieldCurveChart.CustomSeries>[0]["paneView"];
    const mockPrimitive = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
    };

    const { container } = render(() => (
      <YieldCurveChart>
        <YieldCurveChart.CustomSeries
          paneView={mockPaneView}
          data={testData}
          primitives={[mockPrimitive]}
        />
      </YieldCurveChart>
    ));

    await waitFor(() => {
      // Verify the chart container is present
      expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

      // Verify the table structure
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();

      // Verify primitives were called
      expect(mockPrimitive.updateAllViews).toHaveBeenCalled();
    });
  });

  test("calls onRemoveSeries when series is unmounted", async () => {
    const testData = [{ time: 0, value: 2.5 }];
    const onRemoveSeriesMock = vi.fn();

    const { unmount } = render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={testData} onRemoveSeries={onRemoveSeriesMock} />
      </YieldCurveChart>
    ));

    unmount();

    await waitFor(() => {
      expect(onRemoveSeriesMock).toHaveBeenCalled();
    });
  });

  test("cleans up on unmount", async () => {
    const { container, unmount } = render(() => <YieldCurveChart />);

    // Verify chart was created
    expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

    unmount();

    // Verify chart container is removed after unmount
    expect(container.querySelector(".tv-lightweight-charts")).not.toBeInTheDocument();
  });

  test("works with createSeriesMarkers API", async () => {
    const onSetDataMock = vi.fn(({ series, data }) => {
      const markers: SeriesMarker<number>[] = [
        {
          time: data[0].time,
          position: "aboveBar",
          color: "#f68410",
          shape: "circle",
          text: "Buy",
        } as SeriesMarker<number>,
      ];
      createSeriesMarkers(series, markers);
    });

    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series
          type="Line"
          data={[{ time: 0, value: 2.5 }]}
          onSetData={onSetDataMock}
        />
      </YieldCurveChart>
    ));

    // Verify onSetData was called
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
    });
  });

  test("renders pane with primitives", async () => {
    const mockPanePrimitive = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      attached: vi.fn(),
      detached: vi.fn(),
    };

    const onAttachPrimitivesMock = vi.fn();
    const onDetachPrimitivesMock = vi.fn();

    const { container } = render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Series type="Line" data={[{ time: 0, value: 2.5 }]} />
        <YieldCurveChart.Pane
          primitives={[mockPanePrimitive]}
          onAttachPrimitives={onAttachPrimitivesMock}
          onDetachPrimitives={onDetachPrimitivesMock}
        >
          <YieldCurveChart.Series type="Area" data={[{ time: 0, value: 1000 }]} />
        </YieldCurveChart.Pane>
      </YieldCurveChart>
    ));

    await waitFor(() => {
      // Verify the chart container is present
      expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

      // Verify pane primitives were attached
      expect(onAttachPrimitivesMock).toHaveBeenCalledWith([mockPanePrimitive]);

      // Verify primitive methods were called
      expect(mockPanePrimitive.updateAllViews).toHaveBeenCalled();
    });
  });

  test("handles pane primitives attach/detach lifecycle", async () => {
    const mockPanePrimitive = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      attached: vi.fn(),
      detached: vi.fn(),
    };

    const onAttachPrimitivesMock = vi.fn();
    const onDetachPrimitivesMock = vi.fn();

    const { unmount } = render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Pane
          primitives={[mockPanePrimitive]}
          onAttachPrimitives={onAttachPrimitivesMock}
          onDetachPrimitives={onDetachPrimitivesMock}
        >
          <YieldCurveChart.Series type="Line" data={[{ time: 0, value: 2.5 }]} />
        </YieldCurveChart.Pane>
      </YieldCurveChart>
    ));

    await waitFor(() => {
      expect(onAttachPrimitivesMock).toHaveBeenCalledWith([mockPanePrimitive]);
    });

    // Unmount to trigger detach
    unmount();

    await waitFor(() => {
      expect(onDetachPrimitivesMock).toHaveBeenCalledWith([mockPanePrimitive]);
    });
  });

  test("handles reactive pane primitives updates", async () => {
    const mockPrimitive1 = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      attached: vi.fn(),
      detached: vi.fn(),
    };

    const mockPrimitive2 = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      attached: vi.fn(),
      detached: vi.fn(),
    };

    const [primitives, setPrimitives] = createSignal([mockPrimitive1]);
    const onPrimitivesAttachedMock = vi.fn();

    render(() => (
      <YieldCurveChart>
        <YieldCurveChart.Pane
          primitives={primitives()}
          onAttachPrimitives={onPrimitivesAttachedMock}
        >
          <YieldCurveChart.Series type="Line" data={[{ time: 0, value: 2.5 }]} />
        </YieldCurveChart.Pane>
      </YieldCurveChart>
    ));

    await waitFor(() => {
      expect(onPrimitivesAttachedMock).toHaveBeenCalledWith([mockPrimitive1]);
    });

    // Update primitives to trigger reactive update
    setPrimitives([mockPrimitive1, mockPrimitive2]);

    await waitFor(() => {
      expect(onPrimitivesAttachedMock).toHaveBeenCalledWith([mockPrimitive1, mockPrimitive2]);
    });
  });

  test("processes chart and pane primitives", async () => {
    // Chart-level primitives
    const chartPrimitive1 = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      attached: vi.fn(),
      detached: vi.fn(),
    };

    const chartPrimitive2 = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      attached: vi.fn(),
      detached: vi.fn(),
    };

    // Pane-level primitives
    const panePrimitive1 = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      attached: vi.fn(),
      detached: vi.fn(),
    };

    const panePrimitive2 = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      attached: vi.fn(),
      detached: vi.fn(),
    };

    const [chartPrimitives, setChartPrimitives] = createSignal([chartPrimitive1]);
    const [panePrimitives, setPanePrimitives] = createSignal([panePrimitive1]);

    const onChartPrimitivesAttachedMock = vi.fn();
    const onChartPrimitivesDetachedMock = vi.fn();
    const onPanePrimitivesAttachedMock = vi.fn();
    const onPanePrimitivesDetachedMock = vi.fn();

    const { unmount } = render(() => (
      <YieldCurveChart
        primitives={chartPrimitives()}
        onPrimitivesAttached={onChartPrimitivesAttachedMock}
        onPrimitivesDetached={onChartPrimitivesDetachedMock}
      >
        <YieldCurveChart.Series type="Line" data={[{ time: 0, value: 2.5 }]} />
        <YieldCurveChart.Pane
          primitives={panePrimitives()}
          onAttachPrimitives={onPanePrimitivesAttachedMock}
          onDetachPrimitives={onPanePrimitivesDetachedMock}
        >
          <YieldCurveChart.Series type="Area" data={[{ time: 0, value: 1000 }]} />
        </YieldCurveChart.Pane>
      </YieldCurveChart>
    ));

    // Wait for initial primitives to be attached
    await waitFor(() => {
      expect(onChartPrimitivesAttachedMock).toHaveBeenCalledWith([chartPrimitive1]);
      expect(onPanePrimitivesAttachedMock).toHaveBeenCalledWith([panePrimitive1]);
    });

    // Verify primitives were called
    await waitFor(() => {
      expect(chartPrimitive1.updateAllViews).toHaveBeenCalled();
      expect(panePrimitive1.updateAllViews).toHaveBeenCalled();
    });

    // Update chart-level primitives reactively
    setChartPrimitives([chartPrimitive1, chartPrimitive2]);

    await waitFor(() => {
      expect(onChartPrimitivesAttachedMock).toHaveBeenCalledWith([
        chartPrimitive1,
        chartPrimitive2,
      ]);
    });

    // Update pane-level primitives reactively
    setPanePrimitives([panePrimitive1, panePrimitive2]);

    await waitFor(() => {
      expect(onPanePrimitivesAttachedMock).toHaveBeenCalledWith([panePrimitive1, panePrimitive2]);
    });

    // Unmount to test detach lifecycle
    unmount();

    await waitFor(() => {
      expect(onChartPrimitivesDetachedMock).toHaveBeenCalledWith([
        chartPrimitive1,
        chartPrimitive2,
      ]);
      expect(onPanePrimitivesDetachedMock).toHaveBeenCalledWith([panePrimitive1, panePrimitive2]);
    });
  });
});
