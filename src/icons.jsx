export function Icon({ name, size = 18, stroke = 1.8, style }) {
  const p = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style,
  };
  const paths = {
    home:     <><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></>,
    send:     <><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></>,
    inbox:    <><path d="M3 12h5l2 3h4l2-3h5"/><path d="M5 4h14l2 8v6H3v-6l2-8z"/></>,
    building: <><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></>,
    table:    <><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 10h18M9 4v16"/></>,
    print:    <><path d="M6 9V3h12v6"/><rect x="5" y="9" width="14" height="8" rx="1"/><path d="M8 17h8v4H8z"/></>,
    bell:     <><path d="M6 9a6 6 0 1112 0c0 7 3 7 3 7H3s3 0 3-7z"/><path d="M10 21h4"/></>,
    sparkles: <><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/></>,
    plus:     <><path d="M12 5v14M5 12h14"/></>,
    search:   <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></>,
    check:    <><path d="M20 6L9 17l-5-5"/></>,
    x:        <><path d="M18 6L6 18M6 6l12 12"/></>,
    edit:     <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></>,
    trash:    <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></>,
    money:    <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></>,
    clock:    <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    file:     <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></>,
    chevron:  <><path d="M9 6l6 6-6 6"/></>,
    alert:    <><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></>,
    logout:   <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>,
    lock:     <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
    list:     <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
}
