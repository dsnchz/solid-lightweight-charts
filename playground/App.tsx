import { A, Route, Router } from "@solidjs/router";
import { For, type JSX, type ParentProps } from "solid-js";

import { DynamicExample } from "./pages/DynamicExample";
import { EventsExample } from "./pages/EventsExample";
import { Home } from "./pages/Home";
import { PanePrimitivesExample } from "./pages/PanePrimitivesExample";
import { PerformanceExample } from "./pages/PerformanceExample";
import { PriceChartExample } from "./pages/PriceChartExample";
import { SeriesPrimitivesExample } from "./pages/SeriesPrimitivesExample";
import { TimeChartExample } from "./pages/TimeChartExample";
import { TooltipExample } from "./pages/TooltipExample";
import { YieldCurveChartExample } from "./pages/YieldCurveChartExample";

type ExamplePage = {
  readonly path: string;
  readonly name: string;
  readonly component: () => JSX.Element;
  readonly category?: string;
};

const examples: ExamplePage[] = [
  {
    path: "/timechart",
    name: "TimeChart",
    component: TimeChartExample,
    category: "Core Charts",
  },
  {
    path: "/pricechart",
    name: "PriceChart",
    component: PriceChartExample,
    category: "Core Charts",
  },
  {
    path: "/yieldcurve",
    name: "YieldCurveChart",
    component: YieldCurveChartExample,
    category: "Core Charts",
  },
  {
    path: "/events",
    name: "Chart Events",
    component: EventsExample,
    category: "Core Charts",
  },
  {
    path: "/tooltip",
    name: "Tooltips",
    component: TooltipExample,
    category: "Core Charts",
  },
  {
    path: "/series-primitives",
    name: "Series Primitives",
    component: SeriesPrimitivesExample,
    category: "Advanced Features",
  },
  {
    path: "/pane-primitives",
    name: "Pane Primitives",
    component: PanePrimitivesExample,
    category: "Advanced Features",
  },
  {
    path: "/dynamic",
    name: "Dynamic Management",
    component: DynamicExample,
    category: "Advanced Features",
  },
  {
    path: "/performance",
    name: "Performance",
    component: PerformanceExample,
    category: "Advanced Features",
  },
];

function Navigation() {
  const categories = [...new Set(examples.map((ex) => ex.category))];

  return (
    <aside class="w-64 bg-gray-800 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div class="p-4">
        <h1 class="text-2xl font-bold mb-6">
          <A href="/" class="hover:text-gray-300">
            Solid Lightweight Charts
          </A>
        </h1>
        <For each={categories}>
          {(category) => (
            <div class="mb-6">
              <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                {category}
              </h2>
              <div class="space-y-1">
                <For each={examples.filter((ex) => ex.category === category)}>
                  {(example) => (
                    <A
                      href={example.path}
                      class="block px-4 py-2 text-sm rounded hover:bg-gray-700 transition-colors"
                      activeClass="bg-gray-700"
                    >
                      {example.name}
                    </A>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </aside>
  );
}

function RootLayout(props: ParentProps) {
  return (
    <div class="min-h-screen bg-gray-50">
      <Navigation />
      <main class="ml-64 p-8">{props.children}</main>
    </div>
  );
}

export const App = () => {
  return (
    <Router root={RootLayout}>
      <Route path="/" component={Home} />
      <For each={examples}>
        {(example) => <Route path={example.path} component={example.component} />}
      </For>
    </Router>
  );
};
