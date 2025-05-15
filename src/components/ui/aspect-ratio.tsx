
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import { cn } from "@/lib/utils"

interface AspectRatioProps extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {
  className?: string;
  animated?: boolean;
}

const AspectRatio = ({ 
  className,
  animated = false,
  ...props 
}: AspectRatioProps) => (
  <AspectRatioPrimitive.Root
    className={cn(
      "overflow-hidden rounded-md",
      animated && "transition-all duration-500 hover:scale-[1.02]",
      className
    )}
    {...props}
  />
)

export { AspectRatio }
