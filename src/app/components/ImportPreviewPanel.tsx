/**
 * Import Preview Panel — T-07
 *
 * Renders the proposed widget tree from T-06 with color-coded confidence
 * badges, drag-rearrange, delete, swap widget type, and edit field labels.
 *
 * Created by Execute (Wave 4, T-07) on 2026-06-08.
 */

import React, { useState, useCallback } from "react";
import type {
  MatchResult,
  WidgetNode,
  WidgetType,
  MappedField,
} from "../services/import/field-matcher";

const CONFIDENCE_HIGH = 0.9;
const CONFIDENCE_MEDIUM = 0.7;

const WIDGET_TYPE_OPTIONS: WidgetType[] = [
  "text-box", "text-area", "number-input", "toggle", "calendar",
  "dropdown", "radio-button", "checkbox", "attachment", "image",
  "signature", "repeater", "header", "paragraph", "rich-text",
  "container", "divider", "spacer", "page-break", "alert", "button",
  "template-title", "template-description", "partner-tags", "report-field",
  "internal-field", "range", "color",
];

function confidenceClass(c: number): string {
  if (c >= CONFIDENCE_HIGH) return "bg-green-100 text-green-800 border-green-300";
  if (c >= CONFIDENCE_MEDIUM) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  return "bg-red-100 text-red-800 border-red-300";
}

function confidenceLabel(c: number): string {
  if (c >= CONFIDENCE_HIGH) return "High";
  if (c >= CONFIDENCE_MEDIUM) return "Medium";
  return "Low";
}

interface ImportPreviewPanelProps {
  matchResult: MatchResult;
  onChange?: (updated: MatchResult) => void;
}

export function ImportPreviewPanel({
  matchResult,
  onChange,
}: ImportPreviewPanelProps) {
  const [tree, setTree] = useState<WidgetNode[]>(matchResult.widgetTree);

  const emit = useCallback(
    (next: WidgetNode[]) => {
      setTree(next);
      if (onChange) {
        // Recompute stats
        const allFlags: MappedField[] = [];
        let totalConf = 0;
        let totalWidgets = 0;
        const walk = (nodes: WidgetNode[]) => {
          for (const n of nodes) {
            totalWidgets += 1;
            totalConf += n.confidence;
            if (n.fields) {
              for (const f of n.fields) {
                if (f.confidence < CONFIDENCE_MEDIUM) {
                  allFlags.push(f);
                }
              }
            }
          }
        };
        walk(next);
        onChange({
          widgetTree: next,
          lowConfidenceFlags: allFlags,
          stats: {
            totalWidgets,
            avgConfidence: totalWidgets > 0 ? totalConf / totalWidgets : 0,
            lowConfidenceCount: allFlags.length,
          },
        });
      }
    },
    [onChange]
  );

  const onDelete = useCallback(
    (idx: number) => {
      emit(tree.filter((_, i) => i !== idx));
    },
    [tree, emit]
  );

  const onSwapType = useCallback(
    (idx: number, newType: WidgetType) => {
      emit(
        tree.map((n, i) =>
          i === idx
            ? { ...n, type: newType, rationale: `User swapped widget type to ${newType}`, confidence: Math.max(n.confidence, 0.7) }
            : n
        )
      );
    },
    [tree, emit]
  );

  const onEditLabel = useCallback(
    (idx: number, newLabel: string) => {
      emit(
        tree.map((n, i) =>
          i === idx ? { ...n, label: newLabel } : n
        )
      );
    },
    [tree, emit]
  );

  const onMove = useCallback(
    (idx: number, direction: -1 | 1) => {
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= tree.length) return;
      const next = [...tree];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      emit(next);
    },
    [tree, emit]
  );

  return (
    <div className="space-y-2">
      {/* Summary */}
      <div className="bg-ds-light-gray/30 rounded-lg p-3 mb-4 text-sm">
        <span className="font-medium">{matchResult.stats.totalWidgets}</span> widgets proposed ·{" "}
        <span className="font-medium">
          {(matchResult.stats.avgConfidence * 100).toFixed(0)}%
        </span>{" "}
        avg confidence ·{" "}
        {matchResult.stats.lowConfidenceCount > 0 ? (
          <span className="text-red-700 font-medium">
            {matchResult.stats.lowConfidenceCount} need review
          </span>
        ) : (
          <span className="text-green-700 font-medium">all high-confidence</span>
        )}
      </div>

      {tree.length === 0 ? (
        <p className="text-sm text-ds-gray italic">No widgets detected.</p>
      ) : (
        <ul className="space-y-2">
          {tree.map((node, idx) => (
            <li
              key={node.id}
              className={`border rounded-lg p-3 ${confidenceClass(node.confidence)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    <input
                      type="text"
                      value={node.label}
                      onChange={(e) => onEditLabel(idx, e.target.value)}
                      className="bg-transparent border-b border-current/30 focus:outline-none focus:border-current min-w-[120px]"
                    />
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/60 font-mono">
                    {node.type}
                  </span>
                  <span className="text-xs" title={node.rationale}>
                    {confidenceLabel(node.confidence)} ({(node.confidence * 100).toFixed(0)}%)
                  </span>
                  {/* Style badges */}
                  {node.config?.color && (
                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-white/60" title={`Text color: ${node.config.color}`}>
                      <span className="w-3 h-3 rounded-full border border-current/30 inline-block" style={{ background: String(node.config.color) }} />
                      {String(node.config.color)}
                    </span>
                  )}
                  {node.config?.bgColor && node.config.bgColor !== "transparent" && (
                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-white/60" title={`Background: ${node.config.bgColor}`}>
                      <span className="w-3 h-3 rounded border border-current/30 inline-block" style={{ background: String(node.config.bgColor) }} />
                      bg: {String(node.config.bgColor)}
                    </span>
                  )}
                  {node.config?.fontSize && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/60 font-mono">{String(node.config.fontSize)}px</span>
                  )}
                  {node.config?.layout && String(node.config.layout) !== "1col" && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">{String(node.config.layout)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onMove(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Move up"
                    className="text-xs px-1.5 py-0.5 hover:bg-white/40 rounded disabled:opacity-30"
                    type="button"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onMove(idx, 1)}
                    disabled={idx === tree.length - 1}
                    aria-label="Move down"
                    className="text-xs px-1.5 py-0.5 hover:bg-white/40 rounded disabled:opacity-30"
                    type="button"
                  >
                    ↓
                  </button>
                  <select
                    value={node.type}
                    onChange={(e) => onSwapType(idx, e.target.value as WidgetType)}
                    aria-label="Change widget type"
                    className="text-xs px-1 py-0.5 rounded bg-white/60"
                  >
                    {WIDGET_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => onDelete(idx)}
                    aria-label="Delete widget"
                    className="text-xs px-1.5 py-0.5 hover:bg-red-200/40 rounded text-red-700"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </div>
              {node.fields && node.fields.length > 0 && (
                <ul className="mt-2 pl-4 space-y-1 text-xs">
                  {node.fields.map((f) => (
                    <li
                      key={`${node.id}-${f.name}`}
                      className="flex items-center gap-2"
                    >
                      <span className="font-medium">{f.name}</span>
                      <span className="text-gray-600">→</span>
                      <span className="font-mono">{f.widgetType}</span>
                      <span
                        className={`px-1 rounded ${confidenceClass(f.confidence)}`}
                        title={f.rationale}
                      >
                        {(f.confidence * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
