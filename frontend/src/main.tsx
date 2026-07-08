import { createRoot } from "react-dom/client";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/800.css";
import "@fontsource/cairo/900.css";
import App from "./App.tsx";
import "./index.css";
import { requestPermissionAndRegisterToken } from './requestNotificationPermission';
import { registerOnMessageHandler } from './firebase';

createRoot(document.getElementById("root")!).render(<App />);

// Register the Firebase Messaging service worker and request notification permission.
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/firebase-messaging-sw.js')
		.then((registration) => {
			// Service worker registered.
			// Attempt to request notification permission and register token.
				requestPermissionAndRegisterToken().catch(() => {});
				// Register foreground message handler after service worker ready
				registerOnMessageHandler().catch(() => {});
		})
		.catch(() => {});
} else {
	// Fallback: still try to request permission if possible
	requestPermissionAndRegisterToken().catch(() => {});
}
