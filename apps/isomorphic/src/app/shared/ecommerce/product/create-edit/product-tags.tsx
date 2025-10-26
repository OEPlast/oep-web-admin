'use client';

import { useEffect, useState } from 'react';
import { Input, Button } from 'rizzui';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import { useFormContext } from 'react-hook-form';
import { PiTagBold, PiXBold } from 'react-icons/pi';

export default function ProductTags({ className }: { className?: string }) {
  const { watch, setValue } = useFormContext();
  const formTags = watch('tags') || [];
  const [tags, setTags] = useState<string[]>(formTags);

  useEffect(() => {
    setTags(formTags);
  }, [formTags]);

  return (
    <FormGroup
      title="Product Tags & Category"
      description="Tags are already managed in Summary tab. Category selection is also in Summary."
      className={cn(className)}
    >
      <ItemCrud tags={tags} setTags={setTags} setValue={setValue} />
    </FormGroup>
  );
}

interface ItemCrudProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  setValue: any;
}

function ItemCrud({ tags, setTags, setValue }: ItemCrudProps) {
  const [itemText, setItemText] = useState<string>('');

  function handleItemAdd(): void {
    if (itemText.trim() !== '') {
      const newTags = [...tags, itemText.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setItemText('');
    }
  }

  function handleItemRemove(text: string): void {
    const updatedTags = tags.filter((item) => item !== text);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  }

  function handleKeyPress(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleItemAdd();
    }
  }

  return (
    <div className="col-span-full">
      <div className="flex items-center gap-4">
        <Input
          value={itemText}
          placeholder="Enter a tag"
          onChange={(e) => setItemText(e.target.value)}
          onKeyPress={handleKeyPress}
          prefix={<PiTagBold className="h-4 w-4" />}
          className="flex-grow"
        />
        <Button
          type="button"
          onClick={handleItemAdd}
          className="shrink-0"
        >
          Add Tag
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((text, index) => (
            <div
              key={index}
              className="flex items-center rounded-full border border-gray-300 bg-gray-50 py-1.5 pe-2.5 ps-3.5 text-sm font-medium text-gray-700"
            >
              {text}
              <button
                type="button"
                onClick={() => handleItemRemove(text)}
                className="ps-2 text-gray-500 hover:text-gray-900"
              >
                <PiXBold className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
