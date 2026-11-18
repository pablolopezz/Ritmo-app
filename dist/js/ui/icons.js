// Small, local SVG set: consistent strokes, no icon library or network request.
const paths = {
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  watch:'<rect x="5" y="5" width="14" height="14" rx="4"/><path d="m8 5 1-4h6l1 4M8 19l1 4h6l1-4M12 8v4l3 2"/>',
  home:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  food:'<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M20 21V3c-4 2-5 7-5 10h5"/>',
  train:'<path d="m7 7 10 10M3 8l5-5M16 21l5-5M2 5l3-3M19 22l3-3M5 10l5-5M14 19l5-5"/>',
  progress:'<path d="M4 4v16h16M8 14l4-4 4 3 5-7M17 6h4v4"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  settings:'<path d="M10 2h4l.6 3 2 1.2 2.8-1 2 3.5-2.2 2v2.6l2.2 2-2 3.5-2.8-1-2 1.2-.6 3h-4l-.6-3-2-1.2-2.8 1-2-3.5 2.2-2v-2.6l-2.2-2 2-3.5 2.8 1 2-1.2Z"/><circle cx="12" cy="12" r="3"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  moon:'<path d="M20.5 13A8.8 8.8 0 0 1 11 3.5 8.8 8.8 0 1 0 20.5 13Z"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  basket:'<path d="m8 4-5 7M16 4l5 7M3 10h18l-2 10H5ZM9 14v3M15 14v3"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18M7 15h3M14 15h3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  shuffle:'<path d="M3 6h3l12 12h3M18 15l3 3-3 3M3 18h3l4-4M14 10l4-4h3M18 3l3 3-3 3"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  scale:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M8 8a6 6 0 0 1 8 0M12 7v4"/>',
  play:'<path d="m9 5 11 7-11 7Z"/>',
  trophy:'<path d="M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4M16 5h4v3a4 4 0 0 1-4 4M12 13v6M8 21h8"/>',
  shield:'<path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  edit:'<path d="m14 5 5 5M4 20l5-1L21 7l-5-5L4 14ZM13 21h8"/>',
  trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>'
};
export const icon = name => `<svg class="ui-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]||paths.arrow}</svg>`;
