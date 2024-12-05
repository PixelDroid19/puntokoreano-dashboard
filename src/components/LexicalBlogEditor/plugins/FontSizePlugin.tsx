// src/components/LexicalBlogEditor/plugins/FontSizePlugin.tsx
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';
import { Select } from 'antd';

const FONT_SIZES = [
  { label: 'Pequeño', value: '12px' },
  { label: 'Normal', value: '16px' },
  { label: 'Grande', value: '20px' },
  { label: 'Muy grande', value: '24px' },
];

const FontSizePlugin = () => {
  const [editor] = useLexicalComposerContext();

  const handleChange = (value: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText({ fontSize: value });
      }
    });
  };

  return (
    <Select
      style={{ width: 120 }}
      options={FONT_SIZES}
      onChange={handleChange}
      placeholder="Tamaño"
    />
  );
};

export default FontSizePlugin;