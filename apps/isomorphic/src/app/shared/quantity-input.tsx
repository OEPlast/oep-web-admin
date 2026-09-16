'use client';

import { useEffect, useState } from 'react';
import { Input, ActionIcon, InputProps } from 'rizzui';
import { PiPlusBold, PiMinusBold } from 'react-icons/pi';
import cn from '@core/utils/class-names';

export default function QuantityInput({
  name,
  error,
  onChange,
  defaultValue,
  className,
  max,
  variantType,
  disabled,
}: {
  name?: string;
  variantType?: InputProps['variant'];
  error?: string;
  onChange?: (value: number) => void;
  defaultValue?: number;
  className?: string;
  max?: number;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? 0);
  const [internalError, setInternalError] = useState<string | undefined>(
    undefined
  );

  function handleIncrement() {
    let newValue = value + 1;
    if (typeof max === 'number' && newValue > max) {
      setInternalError(`Cannot be greater than ${max}`);
      return;
    }
    setValue(newValue);
    setInternalError(undefined);
    onChange && onChange(newValue);
  }

  function handleDecrement() {
    let newValue = value > 1 ? value - 1 : 1;
    setValue(newValue);
    setInternalError(undefined);
    onChange && onChange(newValue);
  }

  function handleOnChange(inputValue: number) {
    let num = Number(inputValue);
    if (typeof max === 'number' && num > max) {
      setInternalError(`Cannot be greater than ${max}`);
      setValue(num);
      onChange && onChange(num);
      return;
    }
    setValue(num);
    setInternalError(undefined);
    onChange && onChange(num);
  }

  useEffect(() => {
    setValue(defaultValue ?? 1);
    onChange && onChange(defaultValue ?? 1);
    setInternalError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Input
      type="number"
      min={0}
      {...(typeof max === 'number' ? { max } : {})}
      name={name}
      value={value}
      placeholder="1"
      onChange={(e) => handleOnChange(Number(e.target.value))}
      variant={variantType ?? 'text'}
      className={cn('w-24 text-center [&_.is-focus]:ring-0', className)}
      inputClassName="px-0 [&_input]:text-center"
      prefix={
        <ActionIcon
          title="Decrement"
          size="sm"
          variant="outline"
          className="h-7 w-7 scale-90"
          onClick={() => handleDecrement()}
          disabled={disabled}
        >
          <PiMinusBold className="h-4 w-4" />
        </ActionIcon>
      }
      suffix={
        <ActionIcon
          title="Increment"
          size="sm"
          variant="outline"
          className="h-7 w-7 scale-90"
          onClick={() => handleIncrement()}
          disabled={disabled}
        >
          <PiPlusBold className="h-4 w-4" />
        </ActionIcon>
      }
      suffixClassName="flex items-center"
      error={internalError || error}
      disabled={disabled}
      readOnly={disabled}
    />
  );
}
