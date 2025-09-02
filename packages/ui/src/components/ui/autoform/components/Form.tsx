import React from "react";

// eslint-disable-next-line react/display-name
export const Form = React.forwardRef<
  HTMLFormElement,
  React.ComponentProps<"form">
>(({ children, ...props }, ref) => {
  return (
    <form ref={ref} className="space-y-4" {...props}>
      {children}
    </form>
  );
});
