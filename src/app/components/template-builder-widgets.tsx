import React from "react";

// =====================================================================
// Style helpers
// =====================================================================
export function getShadowValue(shadow: string | number | boolean | undefined): string {
  switch (String(shadow ?? "none")) {
    case "sm": return "0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)";
    case "md": return "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)";
    case "lg": return "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)";
    case "xl": return "0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)";
    default:   return "none";
  }
}

// =====================================================================
// Preview-mode interactive sub-components (need hooks, must live outside CanvasItem)
// =====================================================================

export function CheckboxWidget({ c, textCSS }: { c: Record<string, string | number | boolean>; textCSS: React.CSSProperties }) {
  const [checked, setChecked] = React.useState(false);
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="w-4 h-4 accent-ds-purple shrink-0 cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
      <span style={textCSS}>{String(c.label || "I agree")}</span>
      {c.required && <span className="text-red-500 text-sm ml-0.5">*</span>}
    </label>
  );
}

export function RadioWidget({ c, rbCSS, elementId }: { c: Record<string, string | number | boolean>; rbCSS: React.CSSProperties; elementId: string }) {
  const opts = String(c.options || "Option 1,Option 2,Option 3").split(",").map((s) => s.trim()).filter(Boolean);
  const [selected, setSelected] = React.useState(opts[0] ?? "");
  return (
    <div className="flex flex-col gap-2.5" onClick={(e) => e.stopPropagation()}>
      {c.label && <span style={{ ...rbCSS, fontWeight: 600 }}>{String(c.label)}</span>}
      {opts.map((opt, i) => (
        <label key={i} className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="radio"
            name={elementId}
            value={opt}
            checked={selected === opt}
            onChange={() => setSelected(opt)}
            className="w-4 h-4 accent-ds-purple shrink-0 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <span style={rbCSS}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

export function ToggleWidget({ c, tgCSS }: { c: Record<string, string | number | boolean>; tgCSS: React.CSSProperties }) {
  const [isOn, setIsOn] = React.useState(!!c.defaultValue);
  return (
    <div
      className="flex items-center justify-between gap-4 select-none cursor-pointer"
      onClick={(e) => { e.stopPropagation(); setIsOn((v) => !v); }}
    >
      <span style={{ ...tgCSS, fontWeight: 500 }}>{String(c.label || "Enable")}</span>
      <div className="flex items-center gap-2">
        {!isOn && <span style={{ ...tgCSS, fontSize: "11px", color: "#b0b0b0" }}>{String(c.offLabel || "No")}</span>}
        <div
          className="relative w-11 h-6 rounded-full transition-colors"
          style={{ backgroundColor: isOn ? "#46367F" : "#d1d5db" }}
        >
          <div
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
            style={{ left: isOn ? "calc(100% - 20px)" : "4px" }}
          />
        </div>
        {isOn && <span style={{ ...tgCSS, fontSize: "11px", color: "#46367F", fontWeight: 600 }}>{String(c.onLabel || "Yes")}</span>}
      </div>
    </div>
  );
}

export function SignatureWidget({ c, sigCSS }: { c: Record<string, string | number | boolean>; sigCSS: React.CSSProperties }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const [hasDrawing, setHasDrawing] = React.useState(false);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#46367F";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    setHasDrawing(true);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    drawing.current = false;
  };

  const onClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label style={{ ...sigCSS, fontWeight: 600 }}>
        {String(c.label || "Signature")}
        {c.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="border border-ds-haze rounded-lg bg-white overflow-hidden" style={{ height: 100 }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={100}
          className="w-full h-full cursor-crosshair"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-light-gray">
          {String(c.hint || "Sign within the box")}
        </span>
        {hasDrawing && (
          <button
            type="button"
            onClick={onClear}
            className="font-['Poppins',sans-serif] text-[10px] text-ds-purple/60 hover:text-ds-purple transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export function RepeaterWidget({ c, repCSS }: { c: Record<string, string | number | boolean>; repCSS: React.CSSProperties }) {
  const itemLabel = String(c.itemLabel || "Item");
  const [count, setCount] = React.useState(1);

  return (
    <div className="flex flex-col gap-1.5">
      {c.label && (
        <span style={{ ...repCSS, fontSize: "11px", fontWeight: 600 }}>{String(c.label)}</span>
      )}
      {Array.from({ length: count }, (_, idx) => (
        <div key={idx} className="flex items-center gap-2 border border-ds-haze rounded-md px-3 py-2 bg-white">
          <div className="w-3 h-3 text-ds-light-gray opacity-60">
            <svg viewBox="0 0 12 12" fill="none">
              <circle cx="4" cy="3" r="1" fill="currentColor" />
              <circle cx="8" cy="3" r="1" fill="currentColor" />
              <circle cx="4" cy="6" r="1" fill="currentColor" />
              <circle cx="8" cy="6" r="1" fill="currentColor" />
              <circle cx="4" cy="9" r="1" fill="currentColor" />
              <circle cx="8" cy="9" r="1" fill="currentColor" />
            </svg>
          </div>
          <span style={{ ...repCSS, fontSize: "12px" }} className="flex-1">{itemLabel} {idx + 1}</span>
          {count > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCount((n) => n - 1); }}
              className="text-ds-light-gray hover:text-red-400 transition-colors text-[16px] leading-none ml-auto"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setCount((n) => n + 1); }}
        className="flex items-center gap-1.5 border border-dashed border-ds-purple/30 rounded-md px-3 py-1.5 text-ds-purple/60 hover:border-ds-purple/60 hover:text-ds-purple transition-colors cursor-pointer"
      >
        <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: repCSS.fontFamily, fontSize: "11px" }}>Add {itemLabel}</span>
      </button>
    </div>
  );
}
