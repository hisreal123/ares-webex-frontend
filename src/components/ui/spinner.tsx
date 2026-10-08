import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-solid border-current border-r-transparent",
  {
    variants: {
      size: {
        sm: "size-4 border-2",
        md: "size-8 border-[3px]",
        lg: "size-12 border-4",
      },
      color: {
        primary: "text-primary",
        current: "text-current",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
    },
  }
)

function Spinner({
  className,
  size,
  color,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof spinnerVariants>) {
  return (
    <span
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size, color, className }))}
      {...props}
    />
  )
}

export { Spinner }
