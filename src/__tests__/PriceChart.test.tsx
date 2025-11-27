import { render, waitFor } from "@solidjs/testing-library";
import type { SeriesMarker } from "lightweight-charts";
import type { ISeriesApi } from "lightweight-charts";
import { createSeriesMarkers } from "lightweight-charts";
import { createSignal } from "solid-js";
import { describe, expect, test, vi } from "vitest";

import { PriceChart } from "../charts/PriceChart";
import type { IOptionsChartApi } from "../types";

describe("CHART: PriceChart", () => {
  test("creates the lightweight-charts container", () => {
    const onCreateChartMock = vi.fn();

    const { container } = render(() => <PriceChart onCreateChart={onCreateChartMock} />);
    expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

    expect(onCreateChartMock).toHaveBeenCalled();
  });

  test("throws when series is rendered outside of chart", async () => {
    expect(() =>
      render(() => <PriceChart.Series type="Line" data={[{ time: 0, value: 100 }]} />),
    ).toThrow("[solid-lightweight-charts] No parent PriceChart component found!");
  });

  test("applies custom class and style", () => {
    const { container } = render(() => (
      <PriceChart class="custom-class" style={{ width: "500px" }} />
    ));

    const chartElement = container.firstChild as HTMLElement;
    expect(chartElement).toHaveClass("custom-class");
    expect(chartElement.style.width).toBe("500px");
  });

  test("applies chart options", async () => {
    let _priceChart: IOptionsChartApi;

    render(() => (
      <PriceChart
        timeScale={{
          barSpacing: 5,
          minBarSpacing: 2,
        }}
        rightPriceScale={{
          visible: true,
          scaleMargins: { top: 0.1, bottom: 0.1 },
        }}
        onCreateChart={(chart) => {
          _priceChart = chart;
        }}
      />
    ));

    const chartOptions = _priceChart!.options();

    expect(chartOptions.timeScale.barSpacing).toBe(5);
    expect(chartOptions.timeScale.minBarSpacing).toBe(2);
    expect(chartOptions.rightPriceScale.visible).toBe(true);
    expect(chartOptions.rightPriceScale.scaleMargins.top).toBe(0.1);
    expect(chartOptions.rightPriceScale.scaleMargins.bottom).toBe(0.1);
  });

  test("does not resize when autoSize is true", () => {
    let _priceChart: IOptionsChartApi;

    const [dimensions, setDimensions] = createSignal({
      width: 800,
      height: 400,
    });

    render(() => (
      <PriceChart
        autoSize={true}
        width={dimensions().width}
        height={dimensions().height}
        onCreateChart={(chart) => {
          _priceChart = chart;
          vi.spyOn(_priceChart, "resize");
        }}
      />
    ));

    expect(_priceChart!).toBeDefined();

    setDimensions({ width: 1000, height: 500 });

    expect(_priceChart!.resize).not.toHaveBeenCalled();
  });

  test("handles resize when autoSize is false", () => {
    let _priceChart: IOptionsChartApi;
    const onResizeMock = vi.fn();

    const [dimensions, setDimensions] = createSignal({
      width: 800,
      height: 400,
    });

    render(() => (
      <PriceChart
        autoSize={false}
        width={dimensions().width}
        height={dimensions().height}
        onResize={onResizeMock}
        onCreateChart={(chart) => {
          _priceChart = chart;
          vi.spyOn(_priceChart, "resize");
        }}
      />
    ));

    expect(_priceChart!).toBeDefined();

    setDimensions({ width: 1000, height: 500 });

    expect(_priceChart!.resize).toHaveBeenCalledWith(1000, 500, false);
    expect(onResizeMock).toHaveBeenCalledWith(1000, 500);
  });

  test("renders a series", async () => {
    const testData = [
      { time: 0, value: 100 },
      { time: 1, value: 105 },
    ];

    const onCreateSeriesMock = vi.fn();

    render(() => (
      <PriceChart>
        <PriceChart.Series
          type="Line"
          data={testData}
          onCreateSeries={onCreateSeriesMock}
          color="#ff0000"
        />
      </PriceChart>
    ));

    // Wait for the callback to be called
    await waitFor(() => {
      expect(onCreateSeriesMock).toHaveBeenCalled();
    });
  });

  test("updates series data when props change", async () => {
    const [data, setData] = createSignal([
      { time: 0, value: 100 },
      { time: 1, value: 105 },
    ]);

    const onSetDataMock = vi.fn();

    render(() => (
      <PriceChart>
        <PriceChart.Series type="Line" data={data()} onSetData={onSetDataMock} />
      </PriceChart>
    ));

    setData([
      { time: 0, value: 100 },
      { time: 1, value: 105 },
      { time: 2, value: 110 },
    ]);

    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalledWith({
        chart: expect.any(Object),
        series: expect.any(Object),
        data: [
          { time: 0, value: 100 },
          { time: 1, value: 105 },
          { time: 2, value: 110 },
        ],
      });
    });
  });

  test("renders a pane with series", async () => {
    let chartInstance: IOptionsChartApi;
    const seriesInstances: ISeriesApi<"Line" | "Histogram", number>[] = [];

    const onCreateChart = (chart: IOptionsChartApi) => {
      chartInstance = chart;
    };

    const onCreateSeries = (series: ISeriesApi<"Line" | "Histogram", number>) => {
      seriesInstances.push(series);
    };

    const { container } = render(() => (
      <PriceChart onCreateChart={onCreateChart}>
        <PriceChart.Series
          type="Line"
          data={[{ time: 0, value: 100 }]}
          onCreateSeries={onCreateSeries}
        />
        <PriceChart.Pane>
          <PriceChart.Series
            type="Histogram"
            data={[{ time: 0, value: 1000 }]}
            onCreateSeries={onCreateSeries}
          />
        </PriceChart.Pane>
      </PriceChart>
    ));

    // Verify chart container is present
    expect(container.querySelector(".tv-lightweight-charts")).toBeInTheDocument();

    // Wait for both series to be created
    await waitFor(() => {
      expect(seriesInstances).toHaveLength(2);
    });

    // Verify chart instance was created
    expect(chartInstance!).toBeDefined();

    // Verify we have both series types
    expect(seriesInstances[0]).toBeDefined(); // Line series
    expect(seriesInstances[1]).toBeDefined(); // Histogram series
  });

  test("renders a pane with explicit index", async () => {
    const { container } = render(() => (
      <PriceChart>
        <PriceChart.Series type="Line" data={[{ time: 0, value: 100 }]} />
        <PriceChart.Pane index={2}>
          <PriceChart.Series type="Histogram" data={[{ time: 0, value: 1000 }]} />
        </PriceChart.Pane>
      </PriceChart>
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
      { time: 0, value: 100 },
      { time: 1, value: 105 },
    ];

    render(() => (
      <PriceChart>
        <PriceChart.Series type="Line" data={testData} onSetData={onSetDataMock} />
      </PriceChart>
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
      <PriceChart>
        <PriceChart.Series type="Line" data={testData} primitives={[mockPrimitive]} />
      </PriceChart>
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
    const testData = [{ time: 0, value: 100 }];
    const mockPaneView = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
      renderer: vi.fn(),
      update: vi.fn(),
      priceValueBuilder: vi.fn(() => [100]),
      isWhitespace: vi.fn(() => false),
      defaultOptions: vi.fn(() => ({ color: "#000000" })),
    } as unknown as Parameters<typeof PriceChart.CustomSeries>[0]["paneView"];

    const onCreateSeriesMock = vi.fn();

    render(() => (
      <PriceChart>
        <PriceChart.CustomSeries
          paneView={mockPaneView}
          data={testData}
          onCreateSeries={onCreateSeriesMock}
        />
      </PriceChart>
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
    } as unknown as Parameters<typeof PriceChart.CustomSeries>[0]["paneView"];
    const mockPrimitive = {
      updateAllViews: vi.fn(),
      paneViews: vi.fn(() => []),
    };

    const { container } = render(() => (
      <PriceChart>
        <PriceChart.CustomSeries
          paneView={mockPaneView}
          data={testData}
          primitives={[mockPrimitive]}
        />
      </PriceChart>
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
    const testData = [{ time: 0, value: 100 }];
    const onRemoveSeriesMock = vi.fn();

    const { unmount } = render(() => (
      <PriceChart>
        <PriceChart.Series type="Line" data={testData} onRemoveSeries={onRemoveSeriesMock} />
      </PriceChart>
    ));

    unmount();

    await waitFor(() => {
      expect(onRemoveSeriesMock).toHaveBeenCalled();
    });
  });

  test("cleans up on unmount", async () => {
    const { container, unmount } = render(() => <PriceChart />);

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
      <PriceChart>
        <PriceChart.Series type="Line" data={[{ time: 0, value: 100 }]} onSetData={onSetDataMock} />
      </PriceChart>
    ));

    // Verify onSetData was called
    await waitFor(() => {
      expect(onSetDataMock).toHaveBeenCalled();
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
      <PriceChart
        primitives={chartPrimitives()}
        onPrimitivesAttached={onChartPrimitivesAttachedMock}
        onPrimitivesDetached={onChartPrimitivesDetachedMock}
      >
        <PriceChart.Series type="Line" data={[{ time: 0, value: 100 }]} />
        <PriceChart.Pane
          primitives={panePrimitives()}
          onAttachPrimitives={onPanePrimitivesAttachedMock}
          onDetachPrimitives={onPanePrimitivesDetachedMock}
        >
          <PriceChart.Series type="Histogram" data={[{ time: 0, value: 1000 }]} />
        </PriceChart.Pane>
      </PriceChart>
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
