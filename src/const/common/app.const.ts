export const APP_CONFIG = {
	name: "Blueprint",
	version: "1.0",
} as const;

export const FOOTER_CONTENT = {
	versionPrefix: "Version",
	privacyPolicy: "Privacy Policy",
	termsOfUse: "Terms of Use",
	separator: "|",
} as const;

export const THEME_CONFIG = {
	storageKey: "bsp-theme",
	light: "light",
	dark: "dark",
} as const;

export const THEME_TOGGLE_LABELS = {
	switchToDark: "Switch to dark mode",
	switchToLight: "Switch to light mode",
} as const;

export const ICON_SIZES = {
	default: 20,
	small: 18,
	large: 24,
} as const;

export const AUTH_CARD_MAX_WIDTH = "440px";

/** Screen reader text when route guards show the loader icon only. */
export const APP_LOADING_ACCESSIBLE_LABEL = "Loading";
