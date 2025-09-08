import { type ReactNode, Children, isValidElement, Fragment } from "react";

// Define component types explicitly
type ConditionComponentType = typeof If | typeof ElseIf | typeof Else;

// Interfaces for component props
interface ConditionProps {
  condition: boolean;
  children: ReactNode;
}

interface ElseIfProps {
  condition: boolean;
  children: ReactNode;
}

interface ElseProps {
  children: ReactNode;
}

// Type for valid condition components
type ConditionComponent = React.ReactElement<
  typeof If | typeof Else | typeof ElseIf
>;

// Type guard to check if a component is a valid condition component
const isConditionComponent = (
  component: unknown
): component is ConditionComponent => {
  if (!isValidElement(component)) return false;

  const componentType = component.type as ConditionComponentType;
  return [If, ElseIf, Else].includes(componentType);
};

// If component
export const If = ({ condition, children }: ConditionProps) => {
  if (!condition) return null;
  return <Fragment>{children}</Fragment>;
};

// ElseIf component
export const ElseIf = ({ condition, children }: ElseIfProps) => {
  if (!condition) return null;
  return <Fragment>{children}</Fragment>;
};

// Else component
export const Else = ({ children }: ElseProps) => {
  return <Fragment>{children}</Fragment>;
};

// Condition component with strict children typing
export const Condition = ({
  children,
}: {
  children: ConditionComponent | ConditionComponent[];
}) => {
  const childrenArray = Children.toArray(children).filter(
    (child): child is ConditionComponent => isConditionComponent(child)
  );

  // Validate that all children are valid condition components
  if (childrenArray.length !== Children.count(children)) {
    const invalidChild = Children.toArray(children).find(
      (child) => !isConditionComponent(child)
    );
    throw new Error(
      `Invalid child component in Condition. Only If, ElseIf, and Else components are allowed, but received: ${
        isValidElement(invalidChild)
          ? (invalidChild.type as { name?: string }).name ??
            String(invalidChild.type)
          : typeof invalidChild
      }`
    );
  }

  // Find first If or ElseIf with true condition
  const matchingCondition = childrenArray.find(
    (child) =>
      (child.type === If || child.type === ElseIf) &&
      "condition" in child.props &&
      child.props.condition
  );

  if (matchingCondition) {
    return matchingCondition;
  }

  // Find first Else component as fallback
  const elseComponent = childrenArray.find((child) => child.type === Else);

  return elseComponent ?? null;
};

Condition.If = If;
Condition.Else = Else;
Condition.ElseIf = ElseIf;
