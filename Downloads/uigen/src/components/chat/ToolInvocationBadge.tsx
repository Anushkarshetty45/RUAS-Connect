"use client";

import { Loader2, FileEdit, FilePlus, Trash2, FileType } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args?: any;
  state?: "result" | "call" | "partial-call";
}

function getToolDisplayInfo(toolName: string, args?: any): { icon: React.ReactNode; text: string } {
  if (toolName === "str_replace_editor") {
    const command = args?.command;
    const path = args?.path || args?.file_path;
    const fileName = path ? path.split("/").pop() : "file";

    switch (command) {
      case "create":
        return {
          icon: <FilePlus className="w-3 h-3 text-emerald-600" />,
          text: `Creating ${fileName}`,
        };
      case "str_replace":
        return {
          icon: <FileEdit className="w-3 h-3 text-blue-600" />,
          text: `Editing ${fileName}`,
        };
      case "insert":
        return {
          icon: <FileEdit className="w-3 h-3 text-blue-600" />,
          text: `Updating ${fileName}`,
        };
      case "view":
        return {
          icon: <FileType className="w-3 h-3 text-neutral-600" />,
          text: `Viewing ${fileName}`,
        };
      default:
        return {
          icon: <FileEdit className="w-3 h-3 text-neutral-600" />,
          text: `Modifying ${fileName}`,
        };
    }
  }

  if (toolName === "file_manager") {
    const command = args?.command;
    const path = args?.path || args?.old_path;
    const newPath = args?.new_path;
    const fileName = path ? path.split("/").pop() : "file";
    const newFileName = newPath ? newPath.split("/").pop() : "";

    switch (command) {
      case "delete":
        return {
          icon: <Trash2 className="w-3 h-3 text-red-600" />,
          text: `Deleting ${fileName}`,
        };
      case "rename":
        return {
          icon: <FileEdit className="w-3 h-3 text-amber-600" />,
          text: newFileName ? `Renaming ${fileName} to ${newFileName}` : `Renaming ${fileName}`,
        };
      default:
        return {
          icon: <FileEdit className="w-3 h-3 text-neutral-600" />,
          text: `Managing ${fileName}`,
        };
    }
  }

  // Fallback for unknown tools
  return {
    icon: <FileEdit className="w-3 h-3 text-neutral-600" />,
    text: toolName.replace(/_/g, " "),
  };
}

export function ToolInvocationBadge({ toolName, args, state }: ToolInvocationBadgeProps) {
  const isCompleted = state === "result";
  const { icon, text } = getToolDisplayInfo(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          {icon}
          <span className="text-neutral-700 font-medium">{text}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          {icon}
          <span className="text-neutral-700 font-medium">{text}</span>
        </>
      )}
    </div>
  );
}
