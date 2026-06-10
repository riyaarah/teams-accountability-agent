"use client";

import { FileVideo, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

type Props = { onTranscript: (text: string) => void; };

function parseVTT(content: string): string {
  const lines = content.split("\n");
  const textLines: string[] = [];
  let prevSpeaker = "";
  let prevText = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "WEBVTT" || trimmed.match(/^\d+$/) || trimmed.match(/[\d:]+\s*-->/)) continue;

    // Teams VTT format: "<v SpeakerName>text</v>" or "SpeakerName: text"
    const vTag = trimmed.match(/^<v ([^>]+)>(.+)<\/v>$/);
    const colonTag = trimmed.match(/^([^:]+):\s+(.+)$/);

    if (vTag) {
      const [, speaker, text] = vTag;
      if (speaker === prevSpeaker && prevText) {
        textLines[textLines.length - 1] += " " + text;
        prevText += " " + text;
      } else {
        textLines.push(`${speaker}: ${text}`);
        prevSpeaker = speaker;
        prevText = text;
      }
    } else if (colonTag && colonTag[1].split(" ").length <= 4) {
      const [, speaker, text] = colonTag;
      if (speaker === prevSpeaker && prevText) {
        textLines[textLines.length - 1] += " " + text;
        prevText += " " + text;
      } else {
        textLines.push(`${speaker}: ${text}`);
        prevSpeaker = speaker;
        prevText = text;
      }
    } else if (trimmed && !trimmed.match(/^NOTE/) && prevSpeaker) {
      textLines[textLines.length - 1] += " " + trimmed;
      prevText += " " + trimmed;
    }
  }

  return textLines.filter(Boolean).join("\n");
}

function parseDocx(content: string): string {
  // Basic extraction from docx XML text content
  return content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function TranscriptUpload({ onTranscript }: Props) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!["vtt", "txt", "docx"].includes(ext ?? "")) {
      setError("Supported: .vtt (Teams), .txt, .docx");
      return;
    }

    const text = await file.text();
    let parsed = text;

    if (ext === "vtt") parsed = parseVTT(text);
    else if (ext === "docx") parsed = parseDocx(text);

    if (!parsed.trim()) {
      setError("Could not parse transcript. Try copy-pasting instead.");
      return;
    }

    onTranscript(parsed);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#65625a", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
        Import Teams transcript
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `1.5px dashed ${dragging ? "#c9a84c" : fileName ? "#4caf7d" : "#2e2e3f"}`,
          borderRadius: "8px",
          padding: "16px",
          cursor: "pointer",
          background: dragging ? "rgba(201,168,76,0.05)" : fileName ? "rgba(76,175,125,0.05)" : "#0d0d14",
          display: "flex", alignItems: "center", gap: "12px",
          transition: "all 0.15s"
        }}
      >
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
          background: fileName ? "rgba(76,175,125,0.1)" : "rgba(201,168,76,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: fileName ? "#4caf7d" : "#c9a84c"
        }}>
          {fileName ? <FileVideo size={18} /> : <Upload size={18} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {fileName ? (
            <>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#4caf7d", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</p>
              <p style={{ fontSize: "11px", color: "#65625a", margin: 0 }}>Transcript loaded — scroll down to review</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#f2f0eb", margin: "0 0 2px" }}>Drop Teams .vtt file here</p>
              <p style={{ fontSize: "11px", color: "#65625a", margin: 0 }}>or click to browse · .vtt · .txt · .docx</p>
            </>
          )}
        </div>
        {fileName && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setFileName(""); onTranscript(""); }}
            style={{ background: "transparent", border: "none", color: "#65625a", cursor: "pointer", padding: "4px" }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && <p style={{ fontSize: "12px", color: "#e05252", margin: "6px 0 0" }}>{error}</p>}

      <p style={{ fontSize: "11px", color: "#3a3a50", margin: "6px 0 0" }}>
        In Teams: open a meeting → Recap → Transcript → Download as .vtt
      </p>

      <input ref={inputRef} type="file" accept=".vtt,.txt,.docx" style={{ display: "none" }} onChange={onFileChange} />
    </div>
  );
}
