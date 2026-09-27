import React, { useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./rich-text.css";

const MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const FORMATS = [
  "header", "bold", "italic", "underline", "strike",
  "color", "background", "list", "align",
  "blockquote", "code-block", "link",
];

export default function RichTextEditor({ value, onChange, placeholder, testId, minHeight = 200 }) {
  const modules = useMemo(() => MODULES, []);
  return (
    <div className="rte-wrap" style={{ "--rte-min-h": `${minHeight}px` }} data-testid={testId}>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
      />
    </div>
  );
}
