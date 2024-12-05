import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode } from "@lexical/rich-text";
import ToolbarPlugin from './plugins/ToolbarPlugin';

interface Props {
    namespace: string;
    theme: Record<string, any>
}

export const LexicalEditor = ({ namespace, theme }: Props) => {

    const onError = (err: any) => {
        console.log(err)
    }

    const initialConfig = {
        namespace: namespace,
        theme: theme,
        onError: onError,
        nodes: [
            HeadingNode
        ]
    }

    return (
        <LexicalComposer initialConfig={initialConfig} >
            <div className='rounded-xl text-black text-left'>
                <ToolbarPlugin />
                <div className='bg-white'>
                    <RichTextPlugin
                    contentEditable={<ContentEditable className='min-h-40 resize-none text-base py-4 px-3 caret-[#444] outline-0 size' />}
                    placeholder={<></>}
                    ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                </div>

            </div>
        </LexicalComposer>
    )
}
export default LexicalEditor;