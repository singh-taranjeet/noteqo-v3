import React from "react";
import type { NodeViewProps } from "@tiptap/react";
import { BlockWrapper } from "./BlockWrapper";

export interface CustomAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export interface WithBlockWrapperOptions {
  getCustomActions?: (props: NodeViewProps) => CustomAction[];
  getCustomUI?: (props: NodeViewProps) => React.ReactNode;
}

export function withBlockWrapper(
  WrappedComponent: React.ComponentType<NodeViewProps>,
  options?: WithBlockWrapperOptions,
) {
  const WithBlockWrapperComponent = (props: NodeViewProps) => {
    const customActions = options?.getCustomActions?.(props) || [];
    const customUI = options?.getCustomUI?.(props) || null;

    return (
      <BlockWrapper
        {...props}
        customActions={customActions}
        customUI={customUI}
      >
        <WrappedComponent {...props} />
      </BlockWrapper>
    );
  };

  WithBlockWrapperComponent.displayName = `withBlockWrapper(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithBlockWrapperComponent;
}
