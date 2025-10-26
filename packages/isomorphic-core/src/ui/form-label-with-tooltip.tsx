import { Text, Tooltip } from "rizzui";

interface FormLabelWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  placement?:
    | "top"
    | "top-start"
    | "top-end"
    | "right"
    | "right-start"
    | "right-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "left-start"
    | "left-end";
}

export function FormLabelWithTooltip({ label, tooltip, required = false, placement = "top-start" }: FormLabelWithTooltipProps) {
  return (
    <div className="flex items-center gap-2">
      <span>
        {label}
        {required && " *"}
      </span>
      <Tooltip placement={placement} content={tooltip}>
        <Text as="span" className="cursor-help text-gray-400">
          ⓘ
        </Text>
      </Tooltip>
    </div>
  );
}
