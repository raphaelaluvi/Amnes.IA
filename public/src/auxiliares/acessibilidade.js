const STORAGE_KEY = "g01_color_filter_mode";

export const COLOR_FILTER_PRESETS = {
    normal: {
        label: "Padrão",
        cssFilter: "none"
    },
    protanopia: {
        label: "Protanopia",
        cssFilter: "contrast(1.05) saturate(0.78) hue-rotate(-12deg)"
    },
    deuteranopia: {
        label: "Deuteranopia",
        cssFilter: "contrast(1.08) saturate(0.82) hue-rotate(8deg)"
    },
    tritanopia: {
        label: "Tritanopia",
        cssFilter: "contrast(1.12) saturate(0.86) hue-rotate(26deg)"
    }
};

export const COLOR_FILTER_ORDER = ["normal", "protanopia", "deuteranopia", "tritanopia"];

export function getSavedColorFilterMode() {
    const savedMode = window.localStorage.getItem(STORAGE_KEY);
    if (!savedMode || !COLOR_FILTER_PRESETS[savedMode]) {
        return "normal";
    }
    return savedMode;
}

export function applyColorFilterMode(game, mode) {
    const safeMode = COLOR_FILTER_PRESETS[mode] ? mode : "normal";
    const canvas = game?.canvas;
    if (!canvas) {
        return "normal";
    }

    canvas.style.filter = COLOR_FILTER_PRESETS[safeMode].cssFilter;
    window.localStorage.setItem(STORAGE_KEY, safeMode);
    return safeMode;
}

export function applySavedColorFilterMode(game) {
    const mode = getSavedColorFilterMode();
    return applyColorFilterMode(game, mode);
}

export function getNextColorFilterMode(currentMode) {
    const currentIndex = COLOR_FILTER_ORDER.indexOf(currentMode);
    const baseIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (baseIndex + 1) % COLOR_FILTER_ORDER.length;
    return COLOR_FILTER_ORDER[nextIndex];
}
