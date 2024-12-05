import { jsx as _jsx } from "react/jsx-runtime";
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
    const handleChange = (value) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                selection.formatText({ fontSize: value });
            }
        });
    };
    return (_jsx(Select, { style: { width: 120 }, options: FONT_SIZES, onChange: handleChange, placeholder: "Tama\u00F1o" }));
};
export default FontSizePlugin;
