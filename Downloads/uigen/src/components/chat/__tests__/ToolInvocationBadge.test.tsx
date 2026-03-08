import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

describe("ToolInvocationBadge", () => {
  describe("str_replace_editor tool", () => {
    it("displays 'Creating' message for create command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/components/Button.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Creating Button.jsx")).toBeDefined();
    });

    it("displays 'Editing' message for str_replace command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "str_replace", path: "/components/Card.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Editing Card.jsx")).toBeDefined();
    });

    it("displays 'Updating' message for insert command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "insert", path: "/App.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Updating App.jsx")).toBeDefined();
    });

    it("displays 'Viewing' message for view command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "view", path: "/utils/helpers.js" }}
          state="result"
        />
      );

      expect(screen.getByText("Viewing helpers.js")).toBeDefined();
    });

    it("displays filename only, not full path", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/src/components/ui/Button.tsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Creating Button.tsx")).toBeDefined();
      expect(screen.queryByText("/src/components/ui/Button.tsx")).toBeNull();
    });
  });

  describe("file_manager tool", () => {
    it("displays 'Deleting' message for delete command", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{ command: "delete", path: "/components/OldComponent.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Deleting OldComponent.jsx")).toBeDefined();
    });

    it("displays 'Renaming' message with new name for rename command", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{
            command: "rename",
            path: "/components/Button.jsx",
            new_path: "/components/PrimaryButton.jsx",
          }}
          state="result"
        />
      );

      expect(screen.getByText("Renaming Button.jsx to PrimaryButton.jsx")).toBeDefined();
    });

    it("displays 'Renaming' message without new name if not provided", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{ command: "rename", path: "/components/Button.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Renaming Button.jsx")).toBeDefined();
    });
  });

  describe("state handling", () => {
    it("shows completed indicator for result state", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/App.jsx" }}
          state="result"
        />
      );

      // Check for completed indicator (green dot)
      const completedIndicator = container.querySelector(".bg-emerald-500");
      expect(completedIndicator).toBeDefined();
    });

    it("shows loading spinner for non-result state", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/App.jsx" }}
          state="call"
        />
      );

      // Check for loading spinner
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeDefined();
    });

    it("shows loading spinner when state is undefined", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/App.jsx" }}
        />
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeDefined();
    });
  });

  describe("fallback behavior", () => {
    it("handles unknown tool names gracefully", () => {
      render(
        <ToolInvocationBadge
          toolName="unknown_tool"
          state="result"
        />
      );

      expect(screen.getByText("unknown tool")).toBeDefined();
    });

    it("handles missing args for str_replace_editor", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          state="result"
        />
      );

      expect(screen.getByText("Modifying file")).toBeDefined();
    });

    it("handles missing args for file_manager", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          state="result"
        />
      );

      expect(screen.getByText("Managing file")).toBeDefined();
    });
  });

  describe("visual consistency", () => {
    it("applies consistent styling classes", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/App.jsx" }}
          state="result"
        />
      );

      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain("inline-flex");
      expect(badge.className).toContain("items-center");
      expect(badge.className).toContain("gap-2");
      expect(badge.className).toContain("px-3");
      expect(badge.className).toContain("py-1.5");
      expect(badge.className).toContain("bg-neutral-50");
      expect(badge.className).toContain("rounded-lg");
      expect(badge.className).toContain("border");
    });
  });
});
