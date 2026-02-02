'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Code,
    Image as ImageIcon,
    Youtube,
    Undo,
    Redo,
    AlignLeft,
    AlignCenter,
    AlignRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const contentEditableRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [activeMode, setActiveMode] = useState<'none' | 'link' | 'image' | 'video' | 'code'>('none');

    // Form fields
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [codeContent, setCodeContent] = useState('');
    const [savedRange, setSavedRange] = useState<Range | null>(null);

    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

    // Save selection when panel opens
    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            setSavedRange(selection.getRangeAt(0));
        }
    };

    const restoreSelection = () => {
        if (contentEditableRef.current) {
            contentEditableRef.current.focus(); // Focus first to ensure execution
            if (savedRange) {
                const selection = window.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(savedRange);
                }
            }
        }
    };

    // Check which formats are currently active
    const updateActiveFormats = () => {
        const formats = new Set<string>();
        try {
            if (document.queryCommandState('bold')) formats.add('bold');
            if (document.queryCommandState('italic')) formats.add('italic');
            if (document.queryCommandState('insertOrderedList')) formats.add('list'); // Changed to insertOrderedList

            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                let node = selection.anchorNode;
                while (node && node !== contentEditableRef.current) {
                    if (node.nodeName === 'H3') formats.add('h1');
                    if (node.nodeName === 'H4') formats.add('h2');
                    if (node.nodeName === 'PRE') formats.add('code');
                    node = node.parentNode;
                }
            }
        } catch (e) { }
        setActiveFormats(formats);
    };

    // Initial sync and external updates
    useEffect(() => {
        if (contentEditableRef.current && contentEditableRef.current.innerHTML !== value) {
            if (value === '') {
                contentEditableRef.current.innerHTML = '';
            } else if (!isFocused) {
                contentEditableRef.current.innerHTML = value;
            }
        }
    }, [value, isFocused]);

    const execCommand = (command: string, value?: string) => {
        contentEditableRef.current?.focus();
        document.execCommand(command, false, value);
        handleInput();
        setTimeout(updateActiveFormats, 10);
    };

    const handleInput = () => {
        if (contentEditableRef.current) {
            onChange(contentEditableRef.current.innerHTML);
        }
    };

    const insertImage = () => {
        if (imageUrl.trim()) {
            restoreSelection();
            const imageHtml = `
                <div class="rich-block-container relative group my-6 not-prose" contenteditable="false">
                    <button class="remove-block-btn absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 active:scale-95" title="Remove Image">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                    <img src="${imageUrl}" class="w-full h-auto rounded-xl shadow-lg border" />
                </div>
                <p><br/></p>
            `;
            document.execCommand('insertHTML', false, imageHtml);
            setImageUrl('');
            setActiveMode('none');
            handleInput();
        }
    };

    const insertVideo = () => {
        if (videoUrl.trim()) {
            let videoId = '';
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = videoUrl.match(regExp);
            if (match && match[2].length === 11) {
                videoId = match[2];
            }

            if (videoId) {
                restoreSelection();
                const embedHtml = `
                    <div class="rich-block-container relative group my-6 not-prose" contenteditable="false">
                        <button class="remove-block-btn absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 active:scale-95" title="Remove Video">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                        <div class="relative aspect-video rounded-xl overflow-hidden shadow-2xl border bg-black">
                            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    </div>
                    <p><br/></p>
                `;
                document.execCommand('insertHTML', false, embedHtml);
            }
            setVideoUrl('');
            setActiveMode('none');
            handleInput();
        }
    };

    const insertCode = () => {
        if (codeContent.trim()) {
            restoreSelection();
            const escaped = codeContent.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const codeHtml = `
                <div class="rich-block-container relative group my-6 not-prose" contenteditable="false">
                    <button class="remove-block-btn absolute top-2 right-2 z-10 bg-destructive text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 active:scale-95" title="Remove Code Block">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                    <div class="rounded-xl overflow-hidden border border-[#333] shadow-2xl">
                        <div style="background-color: #2d2d2d; padding: 12px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #3d3d3d;">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background-color: #ff5f56;"></span>
                            <span style="width: 12px; height: 12px; border-radius: 50%; background-color: #ffbd2e;"></span>
                            <span style="width: 12px; height: 12px; border-radius: 50%; background-color: #27c93f;"></span>
                        </div>
                        <pre style="background-color: #1e1e1e; color: #d4d4d4; padding: 1.5rem; margin: 0; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.875rem; overflow-x: auto; line-height: 1.6; white-space: pre-wrap; word-break: break-all;"><code>${escaped}</code></pre>
                    </div>
                </div>
                <p><br/></p>
            `;
            document.execCommand('insertHTML', false, codeHtml);
            setCodeContent('');
            setActiveMode('none');
            handleInput();
        }
    };

    const insertLink = (url: string) => {
        if (!url.trim()) return;

        let targetUrl = url.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }

        restoreSelection();
        const selection = window.getSelection();

        if (selection && !selection.isCollapsed) {
            const selectedText = selection.toString();
            const linkHtml = `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 500;">${selectedText}</a>`;
            document.execCommand('insertHTML', false, linkHtml);
        } else {
            const linkHtml = `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 500;">${targetUrl}</a> `;
            document.execCommand('insertHTML', false, linkHtml);
        }

        setLinkUrl('');
        setActiveMode('none');
        handleInput();
    };

    const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const deleteBtn = target.closest('.remove-block-btn');
        if (deleteBtn) {
            const container = deleteBtn.closest('.rich-block-container');
            if (container) {
                container.remove();
                handleInput();
            }
            return;
        }
        updateActiveFormats();
    };

    const toggleMode = (mode: typeof activeMode) => {
        if (mode !== 'none' && mode !== activeMode) {
            saveSelection();
        }
        setActiveMode(prev => prev === mode ? 'none' : mode);
    };

    // ToolbarButton component is no longer used for the specific actions that were changed.
    // It's kept here for other potential uses or if it was intended to be removed entirely.
    const ToolbarButton = ({ icon: Icon, onClick, tooltip, active = false }: any) => (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={active ? "secondary" : "ghost"}
                        size="icon"
                        className={cn("h-8 w-8 rounded-md", active && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground")}
                        onClick={onClick}
                        type="button"
                        title={tooltip} // Fallback for browsers
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="z-50 bg-popover text-popover-foreground shadow-xl border">
                    <p className="font-semibold text-xs">{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <div className={cn("border-2 border-border/50 rounded-xl overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('undo')} title="Undo"><Undo className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => execCommand('redo')} title="Redo"><Redo className="h-4 w-4" /></Button>
                </div>

                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <Button variant={activeFormats.has('bold') ? "secondary" : "ghost"} size="sm" className="h-8 px-2 gap-1.5" onClick={() => execCommand('bold')}>
                        <Bold className="h-3.5 w-3.5" /> <span className="text-xs font-semibold">Bold</span>
                    </Button>
                    <Button variant={activeFormats.has('italic') ? "secondary" : "ghost"} size="sm" className="h-8 px-2 gap-1.5" onClick={() => execCommand('italic')}>
                        <Italic className="h-3.5 w-3.5" /> <span className="text-xs font-semibold">Italic</span>
                    </Button>
                </div>

                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <Button variant={activeFormats.has('h1') ? "secondary" : "ghost"} size="sm" className="h-8 px-2 gap-1" onClick={() => execCommand('formatBlock', 'H3')}>
                        <Heading1 className="h-3.5 w-3.5" /> <span className="text-xs font-semibold">H1</span>
                    </Button>
                    <Button variant={activeFormats.has('h2') ? "secondary" : "ghost"} size="sm" className="h-8 px-2 gap-1" onClick={() => execCommand('formatBlock', 'H4')}>
                        <Heading2 className="h-3.5 w-3.5" /> <span className="text-xs font-semibold">H2</span>
                    </Button>
                    <Button variant={activeFormats.has('list') ? "secondary" : "ghost"} size="sm" className="h-8 px-2 gap-1" onClick={() => execCommand('insertOrderedList')}>
                        <ListOrdered className="h-3.5 w-3.5" /> <span className="text-xs font-semibold">List</span>
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant={activeMode === 'link' ? "secondary" : "ghost"} size="sm" className="h-8 px-2 gap-1.5" onClick={() => toggleMode('link')}>
                        <LinkIcon className="h-3.5 w-3.5" /> <span className="text-xs font-semibold">Link</span>
                    </Button>
                    <Button variant={activeMode === 'image' ? "secondary" : "ghost"} size="sm" className="h-8 px-2 gap-1.5" onClick={() => toggleMode('image')}>
                        <ImageIcon className="h-3.5 w-3.5" /> <span className="text-xs font-semibold">Image</span>
                    </Button>
                    <Button variant={activeMode === 'video' ? "secondary" : "ghost"} size="sm" className="h-8 px-2 gap-1.5" onClick={() => toggleMode('video')}>
                        <Youtube className="h-3.5 w-3.5" /> <span className="text-xs font-semibold">Video</span>
                    </Button>
                    <Button variant={activeMode === 'code' ? "secondary" : "ghost"} size="sm" className="h-8 px-2 gap-1.5" onClick={() => toggleMode('code')}>
                        <Code className="h-3.5 w-3.5" /> <span className="text-xs font-semibold">Code</span>
                    </Button>
                </div>
            </div>

            {/* Inline Action Panel */}
            {activeMode !== 'none' && (
                <div className="bg-primary/5 border-b p-3 animate-in slide-in-from-top-2 duration-200">
                    {activeMode === 'link' && (
                        <div className="flex gap-2 items-center">
                            <LinkIcon className="h-4 w-4 text-primary ml-1" />
                            <Input
                                placeholder="Paste link URL here (e.g. google.com)..."
                                value={linkUrl}
                                onChange={e => setLinkUrl(e.target.value)}
                                className="h-9 bg-background focus:ring-1"
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && insertLink(linkUrl)}
                            />
                            <Button size="sm" onClick={() => insertLink(linkUrl)}>Add Link</Button>
                            <Button variant="ghost" size="sm" onClick={() => setActiveMode('none')}>Cancel</Button>
                        </div>
                    )}
                    {activeMode === 'image' && (
                        <div className="flex gap-2 items-center">
                            <ImageIcon className="h-4 w-4 text-primary ml-1" />
                            <Input
                                placeholder="Paste image URL here..."
                                value={imageUrl}
                                onChange={e => setImageUrl(e.target.value)}
                                className="h-9 bg-background focus:ring-1"
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && insertImage()}
                            />
                            <Button size="sm" onClick={insertImage}>Add Image</Button>
                            <Button variant="ghost" size="sm" onClick={() => setActiveMode('none')}>Cancel</Button>
                        </div>
                    )}
                    {activeMode === 'video' && (
                        <div className="flex gap-2 items-center">
                            <Youtube className="h-4 w-4 text-primary ml-1" />
                            <Input
                                placeholder="Paste YouTube video URL here..."
                                value={videoUrl}
                                onChange={e => setVideoUrl(e.target.value)}
                                className="h-9 bg-background focus:ring-1"
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && insertVideo()}
                            />
                            <Button size="sm" onClick={insertVideo}>Embed Video</Button>
                            <Button variant="ghost" size="sm" onClick={() => setActiveMode('none')}>Cancel</Button>
                        </div>
                    )}
                    {activeMode === 'code' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary">
                                    <Code className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Professional Code Editor</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setActiveMode('none')}>Cancel</Button>
                                    <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-sm" onClick={insertCode}>
                                        Insert Project Code
                                    </Button>
                                </div>
                            </div>
                            <div className="relative rounded-lg overflow-hidden border-2 border-primary/20 shadow-inner bg-[#1e1e1e]">
                                <div className="flex gap-1.5 p-2 bg-[#2d2d2d] border-b border-[#3d3d3d]">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                </div>
                                <Textarea
                                    placeholder="// Type or paste your professional code here..."
                                    value={codeContent}
                                    onChange={e => setCodeContent(e.target.value)}
                                    className="min-h-[220px] font-mono text-sm bg-transparent border-none focus-visible:ring-0 text-[#d4d4d4] p-4 resize-none leading-relaxed"
                                    style={{ tabSize: 4 }}
                                    autoFocus
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Tip: Your code will be rendered in a professional dark-themed container.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Editor Area */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .rich-editor-area ol {
                    list-style-type: decimal !important;
                    padding-left: 2rem !important;
                    margin-top: 1rem !important;
                    margin-bottom: 1rem !important;
                }
                .rich-editor-area ul {
                    list-style-type: disc !important;
                    padding-left: 2rem !important;
                }
                .rich-editor-area li {
                    display: list-item !important;
                    margin-bottom: 0.5rem !important;
                    padding-left: 0.5rem !important;
                }
                .rich-editor-area p {
                    margin-bottom: 1rem !important;
                }
            `}} />
            <div
                ref={contentEditableRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onClick={handleEditorClick}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                className="rich-editor-area min-h-[350px] max-h-[700px] overflow-y-auto p-8 outline-none prose prose-zinc dark:prose-invert max-w-none text-base leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/30 relative"
                data-placeholder={placeholder}
            />
        </div>
    );
}
