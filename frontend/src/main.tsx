import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { useCueSceneStore } from "./stores/CueSceneStore";
import { useFixtureStore } from "./stores/FixtureStore";
import { useShowProjectStore } from "./stores/ShowProjectStore";
import { useTimelineTrackStore } from "./stores/TimelineTrackStore";
import { resetCollections } from "./utils/persistence";
import "./styles.css";

function App() {
  const [active, setActive] = useState<string>(routes[1]?.route ?? "/cues");
  const current = routes.find((route) => route.route === active) ?? routes[0];
  const CurrentPage = current.Component;

  useEffect(() => {
    void useFixtureStore.getState().load();
    void useCueSceneStore.getState().load();
    void useTimelineTrackStore.getState().load();
    void useShowProjectStore.getState().load();
  }, []);

  const reset = () => {
    resetCollections();
    void useFixtureStore.getState().load();
    void useCueSceneStore.getState().load();
    void useTimelineTrackStore.getState().load();
    void useShowProjectStore.getState().load();
  };

  return (
    <div className="shell">
      <aside>
        <div className="brand">舞台灯光编排模拟器</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={active === route.route ? "active" : ""}
              onClick={() => setActive(route.route)}
            >
              {route.name}
            </button>
          ))}
        </nav>
        <button className="btn ghost reset" type="button" onClick={reset}>重置本地数据</button>
      </aside>
      <CurrentPage onNavigate={setActive} />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
