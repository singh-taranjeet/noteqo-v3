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
}

export function withBlockWrapper(
  WrappedComponent: React.ComponentType<NodeViewProps>,
  options?: WithBlockWrapperOptions,
) {
  const WithBlockWrapperComponent = (props: NodeViewProps) => {
    const customActions = options?.getCustomActions?.(props) || [];

    return (
      <BlockWrapper {...props} customActions={customActions}>
        <WrappedComponent {...props} />
      </BlockWrapper>
    );
  };

  WithBlockWrapperComponent.displayName = `withBlockWrapper(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithBlockWrapperComponent;
}
