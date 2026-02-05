/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import {createRoot} from "react-dom/client";
import {App} from "./App";
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "@/dev";

const elem = document.getElementById("root")!;

// Примечание: StrictMode убран, чтобы избежать двойных запросов в dev-режиме.
// StrictMode в dev-режиме намеренно вызывает useEffect дважды для выявления побочных эффектов.
// Если нужна дополнительная отладка, можно временно вернуть <StrictMode>.
const app = (
    <DevSupport ComponentPreviews={ComponentPreviews}
                useInitialHook={useInitial}
    >
        <App/>
    </DevSupport>
);

if (import.meta.hot) {
    // With hot module reloading, `import.meta.hot.data` is persisted.
    const root = (import.meta.hot.data.root ??= createRoot(elem));
    root.render(app);
} else {
    // The hot module reloading API is not available in production.
    createRoot(elem).render(app);
}
