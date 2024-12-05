import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode } from "@lexical/rich-text";
import ToolbarPlugin from './plugins/ToolbarPlugin';
export const LexicalEditor = ({ namespace, theme }) => {
    const onError = (err) => {
        console.log(err);
    };
    const initialConfig = {
        namespace: namespace,
        theme: theme,
        onError: onError,
        nodes: [
            HeadingNode
        ]
    };
    return (_jsx(LexicalComposer, { initialConfig: initialConfig, children: _jsxs("div", { className: 'rounded-xl text-black text-left', children: [_jsx(ToolbarPlugin, {}), _jsxs("div", { className: 'bg-white', children: [_jsx(RichTextPlugin, { contentEditable: _jsx(ContentEditable, { className: 'min-h-40 resize-none text-base py-4 px-3 caret-[#444] outline-0 size' }), placeholder: _jsx(_Fragment, {}), ErrorBoundary: LexicalErrorBoundary }), _jsx(HistoryPlugin, {}), _jsx(AutoFocusPlugin, {})] })] }) }));
};
export default LexicalEditor;
