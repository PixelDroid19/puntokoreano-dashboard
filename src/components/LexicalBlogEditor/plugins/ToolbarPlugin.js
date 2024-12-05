import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CAN_REDO_COMMAND, CAN_UNDO_COMMAND, REDO_COMMAND, UNDO_COMMAND, SELECTION_CHANGE_COMMAND, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, $getSelection, $isRangeSelection, $createParagraphNode, $getNodeByKey } from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isParentElementRTL, $wrapNodes, $isAtNodeEnd } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND, $isListNode, ListNode } from "@lexical/list";
import { createPortal } from "react-dom";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from "@lexical/rich-text";
import { $createCodeNode, $isCodeNode, getDefaultCodeLanguage, getCodeLanguages } from "@lexical/code";
const LowPriority = 1;
const supportedBlockTypes = new Set([
    "paragraph",
    "quote",
    "code",
    "h1",
    "h2",
    "ul",
    "ol"
]);
const blockTypeToBlockName = {
    code: "Code Block",
    h1: "Large Heading",
    h2: "Small Heading",
    h3: "Heading",
    h4: "Heading",
    h5: "Heading",
    ol: "Numbered List",
    paragraph: "Normal",
    quote: "Quote",
    ul: "Bulleted List"
};
function Divider() {
    return _jsx("div", { className: "divider" });
}
function positionEditorElement(editor, rect) {
    if (rect === null) {
        editor.style.opacity = "0";
        editor.style.top = "-1000px";
        editor.style.left = "-1000px";
    }
    else {
        editor.style.opacity = "1";
        editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
        editor.style.left = `${rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2}px`;
    }
}
function FloatingLinkEditor({ editor }) {
    const editorRef = useRef(null);
    const inputRef = useRef(null);
    const mouseDownRef = useRef(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [isEditMode, setEditMode] = useState(false);
    const [lastSelection, setLastSelection] = useState(null);
    const updateLinkEditor = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isLinkNode(parent)) {
                setLinkUrl(parent.getURL());
            }
            else if ($isLinkNode(node)) {
                setLinkUrl(node.getURL());
            }
            else {
                setLinkUrl("");
            }
        }
        const editorElem = editorRef.current;
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;
        if (editorElem === null) {
            return;
        }
        const rootElement = editor.getRootElement();
        if (selection !== null &&
            !nativeSelection.isCollapsed &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode)) {
            const domRange = nativeSelection.getRangeAt(0);
            let rect;
            if (nativeSelection.anchorNode === rootElement) {
                let inner = rootElement;
                while (inner.firstElementChild != null) {
                    inner = inner.firstElementChild;
                }
                rect = inner.getBoundingClientRect();
            }
            else {
                rect = domRange.getBoundingClientRect();
            }
            if (!mouseDownRef.current) {
                positionEditorElement(editorElem, rect);
            }
            setLastSelection(selection);
        }
        else if (!activeElement || activeElement.className !== "link-input") {
            positionEditorElement(editorElem, null);
            setLastSelection(null);
            setEditMode(false);
            setLinkUrl("");
        }
        return true;
    }, [editor]);
    useEffect(() => {
        return mergeRegister(editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateLinkEditor();
            });
        }), editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
            updateLinkEditor();
            return true;
        }, LowPriority));
    }, [editor, updateLinkEditor]);
    useEffect(() => {
        editor.getEditorState().read(() => {
            updateLinkEditor();
        });
    }, [editor, updateLinkEditor]);
    useEffect(() => {
        if (isEditMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditMode]);
    return (_jsx("div", { ref: editorRef, className: "link-editor", children: isEditMode ? (_jsx("input", { ref: inputRef, className: "link-input", value: linkUrl, onChange: (event) => {
                setLinkUrl(event.target.value);
            }, onKeyDown: (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    if (lastSelection !== null) {
                        if (linkUrl !== "") {
                            editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                        }
                        setEditMode(false);
                    }
                }
                else if (event.key === "Escape") {
                    event.preventDefault();
                    setEditMode(false);
                }
            } })) : (_jsx(_Fragment, { children: _jsxs("div", { className: "link-input", children: [_jsx("a", { href: linkUrl, target: "_blank", rel: "noopener noreferrer", children: linkUrl }), _jsx("div", { className: "link-edit", role: "button", tabIndex: 0, onMouseDown: (event) => event.preventDefault(), onClick: () => {
                            setEditMode(true);
                        } })] }) })) }));
}
function Select({ onChange, className, options, value }) {
    return (_jsxs("select", { className: className, onChange: onChange, value: value, children: [_jsx("option", { hidden: true, value: "" }), options.map((option) => (_jsx("option", { value: option, children: option }, option)))] }));
}
function getSelectedNode(selection) {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) {
        return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    }
    else {
        return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
    }
}
function BlockOptionsDropdownList({ editor, blockType, toolbarRef, setShowBlockOptionsDropDown }) {
    const dropDownRef = useRef(null);
    useEffect(() => {
        const toolbar = toolbarRef.current;
        const dropDown = dropDownRef.current;
        if (toolbar !== null && dropDown !== null) {
            const { top, left } = toolbar.getBoundingClientRect();
            dropDown.style.top = `${top + 40}px`;
            dropDown.style.left = `${left}px`;
        }
    }, [dropDownRef, toolbarRef]);
    useEffect(() => {
        const dropDown = dropDownRef.current;
        const toolbar = toolbarRef.current;
        if (dropDown !== null && toolbar !== null) {
            const handle = (event) => {
                const target = event.target;
                if (!dropDown.contains(target) && !toolbar.contains(target)) {
                    setShowBlockOptionsDropDown(false);
                }
            };
            document.addEventListener("click", handle);
            return () => {
                document.removeEventListener("click", handle);
            };
        }
    }, [dropDownRef, setShowBlockOptionsDropDown, toolbarRef]);
    const formatParagraph = () => {
        if (blockType !== "paragraph") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createParagraphNode());
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatLargeHeading = () => {
        if (blockType !== "h1") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createHeadingNode("h1"));
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatSmallHeading = () => {
        if (blockType !== "h2") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createHeadingNode("h2"));
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatBulletList = () => {
        if (blockType !== "ul") {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND);
        }
        else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND);
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatNumberedList = () => {
        if (blockType !== "ol") {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND);
        }
        else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND);
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatQuote = () => {
        if (blockType !== "quote") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createQuoteNode());
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };
    const formatCode = () => {
        if (blockType !== "code") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createCodeNode());
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };
    return (_jsxs("div", { className: "dropdown", ref: dropDownRef, children: [_jsxs("button", { className: "item", onClick: formatParagraph, children: [_jsx("span", { className: "icon paragraph" }), _jsx("span", { className: "text", children: "Normal" }), blockType === "paragraph" && _jsx("span", { className: "active" })] }), _jsxs("button", { className: "item", onClick: formatLargeHeading, children: [_jsx("span", { className: "icon large-heading" }), _jsx("span", { className: "text", children: "Large Heading" }), blockType === "h1" && _jsx("span", { className: "active" })] }), _jsxs("button", { className: "item", onClick: formatSmallHeading, children: [_jsx("span", { className: "icon small-heading" }), _jsx("span", { className: "text", children: "Small Heading" }), blockType === "h2" && _jsx("span", { className: "active" })] }), _jsxs("button", { className: "item", onClick: formatBulletList, children: [_jsx("span", { className: "icon bullet-list" }), _jsx("span", { className: "text", children: "Bullet List" }), blockType === "ul" && _jsx("span", { className: "active" })] }), _jsxs("button", { className: "item", onClick: formatNumberedList, children: [_jsx("span", { className: "icon numbered-list" }), _jsx("span", { className: "text", children: "Numbered List" }), blockType === "ol" && _jsx("span", { className: "active" })] }), _jsxs("button", { className: "item", onClick: formatQuote, children: [_jsx("span", { className: "icon quote" }), _jsx("span", { className: "text", children: "Quote" }), blockType === "quote" && _jsx("span", { className: "active" })] }), _jsxs("button", { className: "item", onClick: formatCode, children: [_jsx("span", { className: "icon code" }), _jsx("span", { className: "text", children: "Code Block" }), blockType === "code" && _jsx("span", { className: "active" })] })] }));
}
export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [blockType, setBlockType] = useState("paragraph");
    const [selectedElementKey, setSelectedElementKey] = useState(null);
    const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] = useState(false);
    const [codeLanguage, setCodeLanguage] = useState("");
    const [isRTL, setIsRTL] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === "root"
                ? anchorNode
                : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);
            if (elementDOM !== null) {
                setSelectedElementKey(elementKey);
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType(anchorNode, ListNode);
                    const type = parentList ? parentList.getTag() : element.getTag();
                    setBlockType(type);
                }
                else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();
                    setBlockType(type);
                    if ($isCodeNode(element)) {
                        setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
                    }
                }
            }
            // Update text format
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));
            setIsStrikethrough(selection.hasFormat("strikethrough"));
            setIsCode(selection.hasFormat("code"));
            setIsRTL($isParentElementRTL(selection));
            // Update links
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isLinkNode(parent) || $isLinkNode(node)) {
                setIsLink(true);
            }
            else {
                setIsLink(false);
            }
        }
    }, [editor]);
    useEffect(() => {
        return mergeRegister(editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        }), editor.registerCommand(SELECTION_CHANGE_COMMAND, (_payload, newEditor) => {
            updateToolbar();
            return false;
        }, LowPriority), editor.registerCommand(CAN_UNDO_COMMAND, (payload) => {
            setCanUndo(payload);
            return false;
        }, LowPriority), editor.registerCommand(CAN_REDO_COMMAND, (payload) => {
            setCanRedo(payload);
            return false;
        }, LowPriority));
    }, [editor, updateToolbar]);
    const codeLanguges = useMemo(() => getCodeLanguages(), []);
    const onCodeLanguageSelect = useCallback((e) => {
        editor.update(() => {
            if (selectedElementKey !== null) {
                const node = $getNodeByKey(selectedElementKey);
                if ($isCodeNode(node)) {
                    node.setLanguage(e.target.value);
                }
            }
        });
    }, [editor, selectedElementKey]);
    const insertLink = useCallback(() => {
        if (!isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
        }
        else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink]);
    return (_jsxs("div", { className: "toolbar", ref: toolbarRef, children: [_jsx("button", { disabled: !canUndo, onClick: () => {
                    editor.dispatchCommand(UNDO_COMMAND);
                }, className: "toolbar-item spaced", "aria-label": "Undo", children: _jsx("i", { className: "format undo" }) }), _jsx("button", { disabled: !canRedo, onClick: () => {
                    editor.dispatchCommand(REDO_COMMAND);
                }, className: "toolbar-item", "aria-label": "Redo", children: _jsx("i", { className: "format redo" }) }), _jsx(Divider, {}), supportedBlockTypes.has(blockType) && (_jsxs(_Fragment, { children: [_jsxs("button", { className: "toolbar-item block-controls", onClick: () => setShowBlockOptionsDropDown(!showBlockOptionsDropDown), "aria-label": "Formatting Options", children: [_jsx("span", { className: "icon block-type " + blockType }), _jsx("span", { className: "text", children: blockTypeToBlockName[blockType] }), _jsx("i", { className: "chevron-down" })] }), showBlockOptionsDropDown &&
                        createPortal(_jsx(BlockOptionsDropdownList, { editor: editor, blockType: blockType, toolbarRef: toolbarRef, setShowBlockOptionsDropDown: setShowBlockOptionsDropDown }), document.body), _jsx(Divider, {})] })), blockType === "code" ? (_jsxs(_Fragment, { children: [_jsx(Select, { className: "toolbar-item code-language", onChange: onCodeLanguageSelect, options: codeLanguges, value: codeLanguage }), _jsx("i", { className: "chevron-down inside" })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                        }, className: "toolbar-item spaced " + (isBold ? "active" : ""), "aria-label": "Format Bold", children: _jsx("i", { className: "format bold" }) }), _jsx("button", { onClick: () => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
                        }, className: "toolbar-item spaced " + (isItalic ? "active" : ""), "aria-label": "Format Italics", children: _jsx("i", { className: "format italic" }) }), _jsx("button", { onClick: () => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
                        }, className: "toolbar-item spaced " + (isUnderline ? "active" : ""), "aria-label": "Format Underline", children: _jsx("i", { className: "format underline" }) }), _jsx("button", { onClick: () => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
                        }, className: "toolbar-item spaced " + (isStrikethrough ? "active" : ""), "aria-label": "Format Strikethrough", children: _jsx("i", { className: "format strikethrough" }) }), _jsx("button", { onClick: () => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
                        }, className: "toolbar-item spaced " + (isCode ? "active" : ""), "aria-label": "Insert Code", children: _jsx("i", { className: "format code" }) }), _jsx("button", { onClick: insertLink, className: "toolbar-item spaced " + (isLink ? "active" : ""), "aria-label": "Insert Link", children: _jsx("i", { className: "format link" }) }), isLink &&
                        createPortal(_jsx(FloatingLinkEditor, { editor: editor }), document.body), _jsx(Divider, {}), _jsx("button", { onClick: () => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
                        }, className: "toolbar-item spaced", "aria-label": "Left Align", children: _jsx("i", { className: "format left-align" }) }), _jsx("button", { onClick: () => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
                        }, className: "toolbar-item spaced", "aria-label": "Center Align", children: _jsx("i", { className: "format center-align" }) }), _jsx("button", { onClick: () => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
                        }, className: "toolbar-item spaced", "aria-label": "Right Align", children: _jsx("i", { className: "format right-align" }) }), _jsx("button", { onClick: () => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
                        }, className: "toolbar-item", "aria-label": "Justify Align", children: _jsx("i", { className: "format justify-align" }) }), " "] }))] }));
}
