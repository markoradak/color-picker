/**
 * Shared Tailwind className constants for unstyled base components
 * used in the demo site. Mirrors what presets.tsx applies internally.
 */

export const styles = {
  content:
    "z-50 flex w-80 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",

  modeSelector:
    "flex justify-between overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800",
  modeSelectorItem:
    "cursor-pointer rounded-md px-1.5 py-1.5 text-center text-xs font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[active]:bg-white data-[active]:shadow-sm dark:data-[active]:bg-zinc-700 dark:text-zinc-300 dark:data-[active]:text-zinc-100",

  area: "relative aspect-[3/2] w-full cursor-crosshair rounded-lg outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  areaGradient: "rounded-lg",
  areaThumb:
    "h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(0,0,0,0.1)]",

  hueSlider:
    "relative h-3 w-full cursor-pointer rounded-full outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  hueSliderTrack: "rounded-full",
  hueSliderThumb:
    "h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]",

  alphaSlider:
    "relative h-3 w-full cursor-pointer rounded-full outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  alphaSliderTrack: "overflow-hidden rounded-full",
  alphaSliderThumb:
    "h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]",

  input: "flex items-center gap-1",
  inputClassNames: {
    formatToggle:
      "shrink-0 select-none rounded-md border border-zinc-300 bg-white px-2 h-8 text-xs font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700",
    field:
      "w-full rounded-md border border-zinc-300 bg-white px-2 h-8 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 data-[has-tokens=icon]:pr-8 data-[has-tokens=matched]:pr-18",
    tokenBadge:
      "right-2.5 top-1/2 -translate-y-1/2 cursor-pointer outline-none transition-[opacity,transform] duration-150 data-[matched]:select-none data-[matched]:rounded-full data-[matched]:border data-[matched]:border-zinc-300 data-[matched]:bg-zinc-100 data-[matched]:px-2 data-[matched]:py-0.5 data-[matched]:text-[10px] data-[matched]:font-medium data-[matched]:leading-none data-[matched]:dark:border-zinc-600 data-[matched]:dark:bg-zinc-700 data-[matched]:dark:text-zinc-100 not-data-[matched]:opacity-60 not-data-[matched]:hover:opacity-100 data-[editing]:opacity-20 data-[editing]:hover:opacity-80",
    tokenIcon: "h-3.5 w-3.5",
    tokenSearch:
      "right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 transition-[opacity,transform] duration-150 dark:border-zinc-600 dark:bg-zinc-800",
    tokenSearchInput:
      "w-16 border-none bg-transparent text-[10px] outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500",
    tokenSearchIcon: "h-3 w-3 shrink-0 text-zinc-400 dark:text-zinc-500",
    tokenList:
      "max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
    tokenListItem:
      "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs outline-none hover:bg-zinc-100 data-[focused]:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:data-[focused]:bg-zinc-800",
    tokenListSwatch:
      "inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-zinc-200 dark:border-zinc-600",
    tokenListName: "min-w-0 flex-1 truncate",
    tokenListCheck: "h-3 w-3 shrink-0",
    tokenListEmpty: "block px-2.5 py-3 text-center text-xs text-zinc-400 dark:text-zinc-500",
  },

  eyeDropper:
    "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-zinc-300 bg-white outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  eyeDropperClassNames: {
    icon: "h-3.5 w-3.5",
    spinner: "h-3.5 w-3.5 animate-spin",
    check: "h-3.5 w-3.5",
  },

  swatches: "gap-1",
  swatch:
    "relative aspect-square rounded-md border border-zinc-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[active]:ring-1 data-[active]:ring-zinc-900 dark:border-zinc-600 dark:data-[active]:ring-zinc-100",

  gradientEditor: "flex flex-col pb-1",
  gradientEditorClassNames: {
    preview:
      "relative aspect-square w-full cursor-crosshair overflow-hidden rounded-lg",
    stopDot:
      "z-[2] h-3 w-3 cursor-pointer rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)] outline-none data-[active]:ring-2 data-[active]:ring-blue-500",
    baseColor:
      "bottom-2 left-2 z-[2] h-5 w-5 cursor-pointer rounded border border-white/50 shadow-sm outline-none",
    contextMenu:
      "rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
    contextMenuItem:
      "block w-full px-3 py-1.5 text-left text-xs outline-none hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800",
    popoverContent:
      "z-50 flex w-64 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
  },

  gradientSwatches: "gap-1",
  gradientSwatch:
    "relative aspect-square rounded-md border border-zinc-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[active]:ring-1 data-[active]:ring-zinc-900 dark:border-zinc-600 dark:data-[active]:ring-zinc-100",

  trigger:
    "relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 p-1 outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-600",
  triggerClassNames: {
    checkerboard: "inset-1 rounded-md",
    swatch: "h-full w-full rounded-md",
  },

  inputTrigger:
    "inline-flex h-10 w-full cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-1.5 text-left outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 focus-within:ring-2 focus-within:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900",
  inputTriggerClassNames: {
    thumbnail: "h-7 w-7 shrink-0 rounded-md",
    thumbnailCheckerboard: "rounded-md",
    thumbnailSwatch: "rounded-md",
    formatToggle:
      "shrink-0 cursor-pointer select-none rounded px-1 text-xs font-medium opacity-50 outline-none hover:opacity-80 disabled:cursor-not-allowed",
    formatLabel: "shrink-0 select-none text-xs font-medium opacity-50",
    input:
      "w-full cursor-text bg-transparent font-mono text-xs outline-none disabled:cursor-not-allowed dark:text-zinc-100 data-[has-tokens=icon]:pr-7 data-[has-tokens=matched]:pr-16",
    eyeDropper:
      "inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-60 outline-none hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30",
    eyeDropperIcon: "h-3 w-3",
    eyeDropperSpinner: "h-3 w-3 animate-spin",
    eyeDropperCheck: "h-3 w-3",
    tokenBadge:
      "right-1.5 top-1/2 -translate-y-1/2 cursor-pointer outline-none transition-[opacity,transform] duration-150 data-[matched]:select-none data-[matched]:rounded-full data-[matched]:border data-[matched]:border-zinc-300 data-[matched]:bg-zinc-100 data-[matched]:px-1.5 data-[matched]:py-0.5 data-[matched]:text-[10px] data-[matched]:font-medium data-[matched]:leading-none data-[matched]:dark:border-zinc-600 data-[matched]:dark:bg-zinc-700 data-[matched]:dark:text-zinc-100 not-data-[matched]:opacity-60 not-data-[matched]:hover:opacity-100 data-[editing]:opacity-20 data-[editing]:hover:opacity-80",
    tokenIcon: "h-3.5 w-3.5",
    tokenSearch:
      "right-0.5 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 transition-[opacity,transform] duration-150 dark:border-zinc-600 dark:bg-zinc-800",
    tokenSearchInput:
      "w-14 border-none bg-transparent text-[10px] outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500",
    tokenSearchIcon: "h-2.5 w-2.5 shrink-0 text-zinc-400 dark:text-zinc-500",
    gradientDisplay:
      "min-w-0 flex-1 truncate font-mono text-xs dark:text-zinc-100",
    tokenList:
      "max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
    tokenListItem:
      "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs outline-none hover:bg-zinc-100 data-[focused]:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:data-[focused]:bg-zinc-800",
    tokenListSwatch:
      "inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-zinc-200 dark:border-zinc-600",
    tokenListName: "min-w-0 flex-1 truncate",
    tokenListCheck: "h-3 w-3 shrink-0",
    tokenListEmpty: "block px-2.5 py-3 text-center text-xs text-zinc-400 dark:text-zinc-500",
  },
} as const;
