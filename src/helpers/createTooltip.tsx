import type { MouseEventParams } from "lightweight-charts";
import {
  type Accessor,
  batch,
  createMemo,
  createSignal,
  type JSX,
  mergeProps,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { render } from "solid-js/web";

import type { TooltipChartApi, TooltipProps, TooltipRootProps } from "../types";

/**
 * Creates a tooltip for any Lightweight Charts instance.
 *
 * This hook handles all tooltip lifecycle, positioning, and rendering logic.
 * It can be used with TimeChart, PriceChart, YieldCurveChart, or any custom chart type.
 *
 * The generic constraint ensures the chart has the required methods (chartElement,
 * subscribeCrosshairMove, unsubscribeCrosshairMove), but the full ChartType is preserved
 * and passed through to the tooltip render props, giving users access to the complete chart API.
 *
 * @param chart - Accessor function that returns the chart instance
 * @param props - Tooltip configuration props
 *
 * @example
 * ```tsx
 * const Tooltip = (props: TooltipProps<Time, IChartApi>) => {
 *   const { chart } = useTimeChart();
 *   createTooltip(chart, props);
 *   return null;
 * };
 * ```
 */
export function createTooltip<HorzScaleItem>(
  chart: Accessor<TooltipChartApi<HorzScaleItem>>,
  props: TooltipRootProps<HorzScaleItem>,
) {
  const _props = mergeProps(
    {
      id: "solid-lwc-tooltip-root",
      style: {} as JSX.CSSProperties,
      zIndex: 20,
      fixed: false,
      offset: { x: 8, y: 8 },
    },
    props,
  );

  let tooltipRoot!: HTMLDivElement;

  const [visible, setVisible] = createSignal(false);
  // Initialize with a dummy value - it will be set before the tooltip is ever shown
  // The tooltip only renders when visible() is true, which only happens after valid data is set
  const [tooltipProps, setTooltipProps] = createSignal<TooltipProps<HorzScaleItem>>({
    chart: chart(),
    seriesData: new Map(),
    point: { x: -1, y: -1 },
    time: undefined as unknown as HorzScaleItem,
  });

  const onCrosshairMove = (param: MouseEventParams<HorzScaleItem>) => {
    const container = chart().chartElement();

    const outOfBounds =
      !param.point ||
      !param.time ||
      param.point.x < 0 ||
      param.point.y < 0 ||
      param.point.x > container.clientWidth ||
      param.point.y > container.clientHeight;

    if (outOfBounds) {
      setVisible(false);
      _props.onHide?.();
      return;
    }

    batch(() => {
      setVisible(true);

      // At this point, we know point and time are defined due to the out-of-bounds check above
      setTooltipProps({
        chart: chart(),
        seriesData: param.seriesData,
        point: param.point!,
        time: param.time!,
      });
    });

    _props.onShow?.();
  };

  const TooltipRoot = () => {
    const tooltipPosition = createMemo(() => {
      let left = (tooltipProps().point?.x ?? 0) + (_props.offset.x ?? 10);
      let top = (tooltipProps().point?.y ?? 0) + (_props.offset.y ?? 10);

      // For fixed positioning, convert chart-relative coords to viewport coords
      if (_props.fixed) {
        const chartRect = chart().chartElement().getBoundingClientRect();
        left += chartRect.left;
        top += chartRect.top;
      }

      return _props.onPositionCalculated?.({ left, top }) ?? { left, top };
    });

    return (
      <Show when={visible()}>
        <div
          ref={tooltipRoot}
          id={_props.id}
          class={_props.class}
          style={{
            position: _props.fixed ? "fixed" : "absolute",
            "pointer-events": "none",
            "z-index": _props.zIndex,
            left: `${tooltipPosition().left}px`,
            top: `${tooltipPosition().top}px`,
            ..._props.style,
          }}
        >
          {_props.component
            ? (() => {
                const Component = _props.component;
                return <Component {...tooltipProps()} />;
              })()
            : _props.children?.(tooltipProps())}
        </div>
      </Show>
    );
  };

  onMount(() => {
    chart().subscribeCrosshairMove(onCrosshairMove);
    const dispose = render(() => <TooltipRoot />, chart().chartElement());

    onCleanup(() => {
      chart().unsubscribeCrosshairMove(onCrosshairMove);
      dispose();
      tooltipRoot?.remove();
    });
  });
}
