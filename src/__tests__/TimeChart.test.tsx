import { render, waitFor } from "@solidjs/testing-library";
import type { IChartApi, SeriesMarker, Time } from "lightweight-charts";
import { createSeriesMarkers } from "lightweight-charts";
import { createSignal } from "solid-js";
import { describe, expect, test, vi } from "vitest";

import { TimeChart } from "../charts/TimeChart";

describe("CHART: TimeChart", () => {
  test("creates the lightweight-charts container", () => {
    const onCreateChartMock = vi.fn();

    const { container } = render(() => <TimeChart onCreateChart={onCreateChartMock} />);
    expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

    expect(onCreateChartMock).toHaveBeenCalled();
  });

  test("throws when series is rendered outside of chart", async () => {
    expect(() => render(() => <TimeChart.Series type="Line" data={[]} />)).toThrow(
      "[solid-lightweight-charts] No parent TimeChart component found!",
    );
  });

  test("applies custom class and style", () => {
    const { container } = render(() => (
      <TimeChart class="custom-class" style={{ width: "500px" }} />
    ));

    const chartElement = container.firstChild as HTMLElement;
    expect(chartElement).toHaveClass("custom-class");
    expect(chartElement.style.width).toBe("500px");
  });

  test("applies chart options", async () => {
    let _timeChart: IChartApi;

    render(() => (
      <TimeChart
        timeScale={{
          timeVisible: true,
          secondsVisible: false,
        }}
        rightPriceScale={{
          visible: true,
          scaleMargins: { top: 0.1, bottom: 0.1 },
        }}
        onCreateChart={(chart) => {
          _timeChart = chart;
        }}
      />
    ));

    const chartOptions = _timeChart!.options();

    expect(chartOptions.timeScale.timeVisible).toBe(true);
    expect(chartOptions.timeScale.secondsVisible).toBe(false);
    expect(chartOptions.rightPriceScale.visible).toBe(true);
    expect(chartOptions.rightPriceScale.scaleMargins.top).toBe(0.1);
    expect(chartOptions.rightPriceScale.scaleMargins.bottom).toBe(0.1);
  });

  test("does not resize when autoSize is true", () => {
    let _timeChart: IChartApi;

    const [dimensions, setDimensions] = createSignal({
      width: 800,
      height: 400,
    });

    render(() => (
      <TimeChart
        autoSize={true}
        width={dimensions().width}
        height={dimensions().height}
        onCreateChart={(chart) => {
          _timeChart = chart;
          vi.spyOn(_timeChart, "resize");
        }}
      />
    ));

    expect(_timeChart!).toBeDefined();

    setDimensions({ width: 1000, height: 500 });

    expect(_timeChart!.resize).not.toHaveBeenCalled();
  });

  test("handles resize when autoSize is false", () => {
    let _timeChart: IChartApi;
    const onResizeMock = vi.fn();

    const [dimensions, setDimensions] = createSignal({
      width: 800,
      height: 400,
    });

    render(() => (
      <TimeChart
        autoSize={false}
        width={dimensions().width}
        height={dimensions().height}
        onResize={onResizeMock}
        onCreateChart={(chart) => {
          _timeChart = chart;
          vi.spyOn(_timeChart, "resize");
        }}
      />
    ));

    expect(_timeChart!).toBeDefined();

    setDimensions({ width: 1000, height: 500 });

    expect(_timeChart!.resize).toHaveBeenCalledWith(1000, 500, false);
    expect(onResizeMock).toHaveBeenCalledWith(1000, 500);
  });

  test("renders a series", async () => {
    const testData = [
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 105 },
    ];

    const onCreateSeriesMock = vi.fn();

    render(() => (
      <TimeChart>
        <TimeChart.Series
          type="Line"
          data={testData}
          onCreateSeries={onCreateSeriesMock}
          color="#ff0000"
        />
      </TimeChart>
    ));

    // Wait for the callback to be called
    await waitFor(() => {
      expect(onCreateSeriesMock).toHaveBeenCalled();
    });
  });

  test("updates series data when props change", async () => {
    const [data, setData] = createSignal([
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 105 },
    ]);

    render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={data()} />
      </TimeChart>
    ));

    // Update data after initial render
    await waitFor(() => {
      setData([
        { time: "2023-01-01", value: 100 },
        { time: "2023-01-02", value: 105 },
        { time: "2023-01-03", value: 110 },
      ]);
    });
  });

  test("renders multiple series", async () => {
    const { container } = render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={[{ time: "2023-01-01", value: 100 }]} />
        <TimeChart.Series type="Area" data={[{ time: "2023-01-01", value: 90 }]} />
      </TimeChart>
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
      <TimeChart>
        <TimeChart.Series type="Line" data={[{ time: "2023-01-01", value: 100 }]} />
        <TimeChart.Pane>
          <TimeChart.Series type="Histogram" data={[{ time: "2023-01-01", value: 1000 }]} />
        </TimeChart.Pane>
      </TimeChart>
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

  test("calls onSetData when series data is set", async () => {
    const onSetDataMock = vi.fn();
    const testData = [
      { time: "2023-01-01", value: 100 },
      { time: "2023-01-02", value: 105 },
    ];

    render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={testData} onSetData={onSetDataMock} />
      </TimeChart>
    ));

    // Wait for series data to be set
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
    });
  });

  test("renders series with primitives", async () => {
    const testData = [{ time: "2023-01-01", value: 100 }];
    const mockPrimitive = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
    };

    const { container } = render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={testData} primitives={[mockPrimitive]} />
      </TimeChart>
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
    const testData = [{ time: "2023-01-01", value: 100 }];
    const mockPaneView = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      renderer: vi.fn(),
      update: vi.fn(),
      priceValueBuilder: vi.fn(() => [100]),
      isWhitespace: vi.fn(() => false),
      defaultOptions: vi.fn(() => ({ color: "#000000" })),
    } as unknown as Parameters<typeof TimeChart.CustomSeries>[0]["paneView"];

    const onCreateSeriesMock = vi.fn();

    render(() => (
      <TimeChart>
        <TimeChart.CustomSeries
          paneView={mockPaneView}
          data={testData}
          onCreateSeries={onCreateSeriesMock}
        />
      </TimeChart>
    ));

    // Wait for the callback to be called
    await waitFor(() => {
      expect(onCreateSeriesMock).toHaveBeenCalled();
    });
  });

  test("custom series with primitives", async () => {
    const testData = [{ time: "2023-01-01", value: 100 }];
    const mockPaneView = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      renderer: vi.fn(),
      update: vi.fn(),
      priceValueBuilder: vi.fn(() => [100]),
      isWhitespace: vi.fn(() => false),
      defaultOptions: vi.fn(() => ({ color: "#000000" })),
    } as unknown as Parameters<typeof TimeChart.CustomSeries>[0]["paneView"];
    const mockPrimitive = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
    };

    const { container } = render(() => (
      <TimeChart>
        <TimeChart.CustomSeries
          paneView={mockPaneView}
          data={testData}
          primitives={[mockPrimitive]}
        />
      </TimeChart>
    ));

    await waitFor(() => {
      // Verify the chart container is present
      expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

      // Verify the table structure
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();

      // Verify custom series was created and primitives were called
      expect(mockPrimitive.updateAllViews).toHaveBeenCalled();
    });
  });

  test("cleans up on unmount", async () => {
    const { container, unmount } = render(() => <TimeChart />);

    // Verify chart was created
    expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

    unmount();

    // Verify chart container is removed after unmount
    expect(container.querySelector(".tv-lightweight-charts")).not.toBeInTheDocument();
  });

  test("works with createSeriesMarkers API", async () => {
    const onSetDataMock = vi.fn(({ series, data }) => {
      const markers: SeriesMarker<Time>[] = [
        {
          time: data[0].time,
          position: "aboveBar",
          color: "#f68410",
          shape: "circle",
          text: "Buy",
        } as SeriesMarker<Time>,
      ];
      createSeriesMarkers(series, markers);
    });

    render(() => (
      <TimeChart>
        <TimeChart.Series
          type="Line"
          data={[{ time: "2023-01-01", value: 100 }]}
          onSetData={onSetDataMock}
        />
      </TimeChart>
    ));

    // Verify onSetData was called
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
    });
  });

  test("renders a pane with explicit index", async () => {
    const { container } = render(() => (
      <TimeChart>
        <TimeChart.Series type="Line" data={[{ time: "2023-01-01", value: 100 }]} />
        <TimeChart.Pane index={2}>
          <TimeChart.Series type="Histogram" data={[{ time: "2023-01-01", value: 1000 }]} />
        </TimeChart.Pane>
      </TimeChart>
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
      <TimeChart
        primitives={chartPrimitives()}
        onPrimitivesAttached={onChartPrimitivesAttachedMock}
        onPrimitivesDetached={onChartPrimitivesDetachedMock}
      >
        <TimeChart.Series type="Line" data={[{ time: "2023-01-01", value: 100 }]} />
        <TimeChart.Pane
          primitives={panePrimitives()}
          onAttachPrimitives={onPanePrimitivesAttachedMock}
          onDetachPrimitives={onPanePrimitivesDetachedMock}
        >
          <TimeChart.Series type="Histogram" data={[{ time: "2023-01-01", value: 1000 }]} />
        </TimeChart.Pane>
      </TimeChart>
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
