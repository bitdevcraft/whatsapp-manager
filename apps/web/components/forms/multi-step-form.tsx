"use client";

import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "@workspace/ui/lib/utils";
import React, {
  createContext,
  HTMLProps,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type MultiStepFormSchema = z.ZodObject<Record<string, z.ZodTypeAny>>;
type MultiStepFormValues<T extends MultiStepFormSchema> = z.infer<T> &
  FieldValues;
type MultiStepFormContextValue = ReturnType<
  typeof useMultiStepForm<MultiStepFormSchema>
>;

interface MultiStepFormProps<T extends MultiStepFormSchema> {
  className?: string;
  form: UseFormReturn<MultiStepFormValues<T>>;
  onSubmit: (data: MultiStepFormValues<T>) => void;
  schema: T;
  useStepTransition?: boolean;
}

type StepProps = React.PropsWithChildren<
  React.HTMLProps<HTMLDivElement> & {
    asChild?: boolean;
    name: string;
  }
>;

const MultiStepFormContext = createContext<MultiStepFormContextValue | null>(
  null
);

/**
 * @name MultiStepForm
 * @description Multi-step form component for React
 * @param schema
 * @param form
 * @param onSubmit
 * @param children
 * @param className
 * @constructor
 */
export function MultiStepForm<T extends MultiStepFormSchema>({
  children,
  className,
  form,
  onSubmit,
  schema,
}: React.PropsWithChildren<MultiStepFormProps<T>>) {
  const steps = useMemo(
    () =>
      React.Children.toArray(children).filter(
        (child): child is React.ReactElement<StepProps> =>
          React.isValidElement(child) && child.type === MultiStepFormStep
      ),
    [children]
  );

  const header = useMemo(() => {
    return React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) && child.type === MultiStepFormHeader
    );
  }, [children]);

  const footer = useMemo(() => {
    return React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) && child.type === MultiStepFormFooter
    );
  }, [children]);

  const stepNames = steps.map((step) => step.props.name);
  const multiStepForm = useMultiStepForm(schema, form, stepNames);

  return (
    <MultiStepFormContext.Provider
      value={multiStepForm as unknown as MultiStepFormContextValue}
    >
      <form
        className={cn(className, "flex size-full flex-col overflow-hidden")}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {header}

        <div className="relative transition-transform duration-500">
          {steps.map((step, index) => {
            const isActive = index === multiStepForm.currentStepIndex;

            return (
              <AnimatedStep
                currentIndex={multiStepForm.currentStepIndex}
                direction={multiStepForm.direction}
                index={index}
                isActive={isActive}
                key={step.props.name}
              >
                {step}
              </AnimatedStep>
            );
          })}
        </div>

        {footer}
        {/* <DevTool control={form.control} /> */}
      </form>
    </MultiStepFormContext.Provider>
  );
}

export function MultiStepFormContextProvider(props: {
  children: (context: ReturnType<typeof useMultiStepForm>) => React.ReactNode;
}) {
  const ctx = useMultiStepFormContext();

  if (Array.isArray(props.children)) {
    const [child] = props.children;

    return (
      child as (context: ReturnType<typeof useMultiStepForm>) => React.ReactNode
    )(ctx);
  }

  return props.children(ctx);
}

export const MultiStepFormStep = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<
    HTMLProps<HTMLDivElement> & {
      asChild?: boolean;
    }
  >
>(function MultiStepFormStep({ asChild, children, ...props }, ref) {
  const Cmp = asChild ? Slot : "div";

  return (
    <Cmp ref={ref} {...props}>
      <Slottable>{children}</Slottable>
    </Cmp>
  );
});

/**
 * @name useMultiStepForm
 * @description Hook for multi-step forms
 * @param schema
 * @param form
 * @param stepNames
 */
export function useMultiStepForm<Schema extends MultiStepFormSchema>(
  schema: Schema,
  form: UseFormReturn<MultiStepFormValues<Schema>>,
  stepNames: string[]
) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState<"backward" | "forward">();

  const isStepValid = useCallback(() => {
    const currentStepName = stepNames[currentStepIndex] as Path<
      MultiStepFormValues<Schema>
    >;
    const currentStepSchema = schema.shape[currentStepName] as z.ZodTypeAny;

    // the user may not want to validate the current step
    // or the step doesn't contain any form field
    if (!currentStepSchema) {
      return true;
    }

    const currentStepData = form.getValues(currentStepName) ?? {};
    const result = currentStepSchema.safeParse(currentStepData);

    return result.success;
  }, [schema, form, stepNames, currentStepIndex]);

  const nextStep = useCallback(
    <Ev extends React.SyntheticEvent>(e: Ev) => {
      // prevent form submission when the user presses Enter
      // or if the user forgets [type="button"] on the button
      e.preventDefault();

      const isValid = isStepValid();

      if (!isValid) {
        const currentStepName = stepNames[currentStepIndex] as Path<
          MultiStepFormValues<Schema>
        >;
        const currentStepSchema = schema.shape[currentStepName] as z.ZodTypeAny;

        if (currentStepSchema) {
          const fields = Object.keys(
            (currentStepSchema as z.ZodObject<Record<string, z.ZodTypeAny>>)
              .shape
          );
          const keys = fields.map((field) => `${currentStepName}.${field}`);

          // trigger validation for all fields in the current step
          for (const key of keys) {
            void form.trigger(key as Path<MultiStepFormValues<Schema>>);
          }

          return;
        }
      }

      if (isValid && currentStepIndex < stepNames.length - 1) {
        setDirection("forward");
        setCurrentStepIndex((prev) => prev + 1);
      }
    },
    [isStepValid, currentStepIndex, stepNames, schema, form]
  );

  const prevStep = useCallback(
    <Ev extends React.SyntheticEvent>(e: Ev) => {
      // prevent form submission when the user presses Enter
      // or if the user forgets [type="button"] on the button
      e.preventDefault();

      if (currentStepIndex > 0) {
        setDirection("backward");
        setCurrentStepIndex((prev) => prev - 1);
      }
    },
    [currentStepIndex]
  );

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < stepNames.length && isStepValid()) {
        setDirection(index > currentStepIndex ? "forward" : "backward");
        setCurrentStepIndex(index);
      }
    },
    [isStepValid, stepNames.length, currentStepIndex]
  );

  const isValid = form.formState.isValid;
  const errors = form.formState.errors;

  return useMemo(
    () => ({
      currentStep: stepNames[currentStepIndex] as string,
      currentStepIndex,
      direction,
      errors,
      form,
      goToStep,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === stepNames.length - 1,
      isStepValid,
      isValid,
      nextStep,
      prevStep,
      totalSteps: stepNames.length,
    }),
    [
      form,
      stepNames,
      currentStepIndex,
      nextStep,
      prevStep,
      goToStep,
      direction,
      isStepValid,
      isValid,
      errors,
    ]
  );
}

export function useMultiStepFormContext<Schema extends MultiStepFormSchema>() {
  const context = useContext(MultiStepFormContext) as unknown as ReturnType<
    typeof useMultiStepForm<Schema>
  >;

  if (!context) {
    throw new Error(
      "useMultiStepFormContext must be used within a MultiStepForm"
    );
  }

  return context;
}

export const MultiStepFormHeader = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<
    HTMLProps<HTMLDivElement> & {
      asChild?: boolean;
    }
  >
>(function MultiStepFormHeader({ asChild, children, ...props }, ref) {
  const Cmp = asChild ? Slot : "div";

  return (
    <Cmp ref={ref} {...props}>
      <Slottable>{children}</Slottable>
    </Cmp>
  );
});

export const MultiStepFormFooter = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<
    HTMLProps<HTMLDivElement> & {
      asChild?: boolean;
    }
  >
>(function MultiStepFormFooter({ asChild, children, ...props }, ref) {
  const Cmp = asChild ? Slot : "div";

  return (
    <Cmp ref={ref} {...props}>
      <Slottable>{children}</Slottable>
    </Cmp>
  );
});

interface AnimatedStepProps {
  currentIndex: number;
  direction: "backward" | "forward" | undefined;
  index: number;
  isActive: boolean;
}

/**
 * @name createStepSchema
 * @description Create a schema for a multi-step form
 * @param steps
 */
export function createStepSchema<T extends Record<string, z.ZodTypeAny>>(
  steps: T
) {
  return z.object(steps);
}

function AnimatedStep({
  children,
  currentIndex,
  direction,
  index,
  isActive,
}: React.PropsWithChildren<AnimatedStepProps>) {
  const [shouldRender, setShouldRender] = useState(isActive);
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);

      return () => clearTimeout(timer);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && stepRef.current) {
      const focusableElement = stepRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElement) {
        (focusableElement as HTMLElement).focus();
      }
    }
  }, [isActive]);

  if (!shouldRender) {
    return null;
  }

  const baseClasses =
    " top-0 left-0 w-full h-full transition-all duration-300 ease-in-out animate-in fade-in zoom-in-95";

  const visibilityClasses = isActive ? "opacity-100" : "opacity-0 absolute";

  const transformClasses = cn(
    "translate-x-0",
    isActive
      ? {}
      : {
          "-translate-x-full": direction === "forward" || index < currentIndex,
          "translate-x-full": direction === "backward" || index > currentIndex,
        }
  );

  const className = cn(baseClasses, visibilityClasses, transformClasses);

  return (
    <div aria-hidden={!isActive} className={className} ref={stepRef}>
      {children}
    </div>
  );
}
