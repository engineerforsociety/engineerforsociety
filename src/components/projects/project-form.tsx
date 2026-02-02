'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Separator } from '@/components/ui/separator';
import {
    Plus,
    Trash2,
    Upload,
    User,
    Wrench,
    Cpu,
    AppWindow,
    Code,
    FileText,
    Youtube,
    Link as LinkIcon,
    Image as ImageIcon
} from 'lucide-react';

// Tags Configuration
const allTags = [
    'Animals', 'Arduino User Group', 'Audio', 'Cars', 'Clocks', 'Communication',
    'Data Collection', 'Debugging Tools', 'Disability Reduction', 'Drones',
    'Embedded', 'Energy Efficiency', 'Entertainment System', 'Environmental Sensing',
    'Food And Drinks', 'Games', 'Garden', 'Greener Planet', 'Health',
    'Helicopters', 'Home Automation', 'Human Welfare', 'Internet Of Things',
    'Kids', 'Lights', 'Monitoring', 'Music', 'Passenger Vehicles', 'Pets',
    'Planes', 'Remote Control', 'Robots', 'Security', 'Smart appliances',
    'Smartwatches', 'Tools', 'Toys', 'Tracking', 'Transportation',
    'Wardriving', 'Wearables', 'Weather'
];

// Tools Configuration
const allTools = [
    '3D Printer', 'Arduino IDE', 'Band Saw', 'Breadboard', 'CNC Router',
    'Drill Press', 'Glue Gun', 'Hammer', 'Hand Drill', 'Helping Hands',
    'Jumper Wires', 'Laser Cutter', 'Multimeter', 'Oscilloscope', 'PCB Holder',
    'Pliers', 'Sander', 'Screwdriver Set', 'Soldering Iron', 'Soldering Station',
    'Tape Measure', 'Tweezers', 'Wire Stripper', 'Vise', 'Utility Knife'
];

export function ProjectForm() {
    const [formState, setFormState] = useState({
        title: '',
        pitch: '',
        description: '',
        status: 'draft',
        notAuthor: false,
        skillLevel: 'Intermediate',
        tags: [] as string[],
        components: [] as { name: string; qty: string; link: string }[],
        tools: [] as string[],
        apps: [] as string[],
        codeLinks: [] as string[],
        docLinks: [] as string[],
        videoLinks: [] as string[],
        teamMembers: [] as string[], // Placeholder for now
    });

    const [newItem, setNewItem] = useState('');
    const [tagSearch, setTagSearch] = useState('');
    const [toolSearch, setToolSearch] = useState('');

    const addComponent = () => {
        setFormState(prev => ({
            ...prev,
            components: [...prev.components, { name: '', qty: '1', link: '' }]
        }));
    };

    const toggleTag = (tag: string) => {
        setFormState(prev => {
            const newTags = prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag];
            return { ...prev, tags: newTags };
        });
    };

    const toggleTool = (tool: string) => {
        setFormState(prev => {
            const newTools = prev.tools.includes(tool)
                ? prev.tools.filter(t => t !== tool)
                : [...prev.tools, tool];
            return { ...prev, tools: newTools };
        });
    };

    const updateComponent = (index: number, field: 'name' | 'qty' | 'link', value: string) => {
        const newComponents = [...formState.components];
        newComponents[index] = { ...newComponents[index], [field]: value };
        setFormState(prev => ({ ...prev, components: newComponents }));
    };

    const addLinkField = (field: 'codeLinks' | 'docLinks' | 'videoLinks') => {
        setFormState(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const updateLink = (field: 'codeLinks' | 'docLinks' | 'videoLinks', index: number, value: string) => {
        const newLinks = [...formState[field]];
        newLinks[index] = value;
        setFormState(prev => ({ ...prev, [field]: newLinks }));
    };

    return (
        <div className="space-y-8 p-1">

            {/* Header / Status */}
            <div className="flex justify-between items-center bg-secondary/5 p-4 rounded-lg">
                <h2 className="text-xl font-semibold">Create New Project</h2>
                <div className="flex items-center gap-2">
                    <Label>Status:</Label>
                    <Select
                        defaultValue="draft"
                        onValueChange={(val) => setFormState(prev => ({ ...prev, status: val }))}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-lg">Project Title</Label>
                    <Input
                        id="title"
                        placeholder="Insert your project title, make it sound cool!"
                        className="text-lg py-6"
                        value={formState.title}
                        onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pitch">Elevator Pitch</Label>
                    <Input
                        id="pitch"
                        placeholder="Describe your project in one short sentence"
                        value={formState.pitch}
                        onChange={(e) => setFormState({ ...formState, pitch: e.target.value })}
                    />
                </div>
            </div>

            {/* Meta Info: Skill & Tags */}
            <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-base">Skill Level</Label>
                        <div className="flex flex-wrap gap-2">
                            {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                                <div
                                    key={level}
                                    onClick={() => setFormState(prev => ({ ...prev, skillLevel: level }))}
                                    className={`
                                        cursor-pointer px-4 py-2 rounded-full border text-sm font-medium transition-all
                                        ${formState.skillLevel === level
                                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                            : 'bg-background hover:bg-secondary/50 border-muted-foreground/30 text-muted-foreground'}
                                    `}
                                >
                                    {level}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-base">Tags ({formState.tags.length})</Label>
                        <div className="border rounded-lg p-3 bg-background/50">
                            <Input
                                placeholder="Search tags..."
                                className="mb-2 h-8 text-sm"
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                            />
                            <ScrollArea className="h-32 pr-2">
                                <div className="flex flex-wrap gap-2">
                                    {allTags.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase())).map(tag => (
                                        <Badge
                                            key={tag}
                                            variant={formState.tags.includes(tag) ? "default" : "outline"}
                                            className={`cursor-pointer ${!formState.tags.includes(tag) && 'opacity-60 hover:opacity-100'}`}
                                            onClick={() => toggleTag(tag)}
                                        >
                                            {tag}
                                            {formState.tags.includes(tag) && <span className="ml-1 text-[10px]">✕</span>}
                                        </Badge>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg h-48 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/5 transition-colors cursor-pointer">
                    <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                    <span className="text-sm font-medium">Upload your cover image</span>
                    <span className="text-xs opacity-70 mt-1">Drag & drop or click to browse</span>
                </div>
            </div>

            {/* The Team */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    The Team
                </h3>

                <div className="flex items-center space-x-2 pb-2">
                    <Checkbox
                        id="notAuthor"
                        checked={formState.notAuthor}
                        onCheckedChange={(c) => setFormState({ ...formState, notAuthor: c as boolean })}
                    />
                    <Label htmlFor="notAuthor" className="cursor-pointer">I'm not this project's author</Label>
                </div>

                <div className="bg-secondary/5 p-4 rounded-lg space-y-3">
                    {/* Current User */}
                    <div className="flex items-center gap-3 bg-background p-2 rounded-md border">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium">razin_ibn_asad</span>
                            <Badge variant="secondary" className="w-fit text-[10px] h-5">Owner</Badge>
                        </div>
                    </div>

                    {/* Additional Team Members */}
                    {formState.teamMembers.map((member, idx) => (
                        <div key={idx} className="flex gap-2">
                            <Input
                                placeholder="Team member name"
                                value={member}
                                onChange={(e) => {
                                    const newMembers = [...formState.teamMembers];
                                    newMembers[idx] = e.target.value;
                                    setFormState({ ...formState, teamMembers: newMembers });
                                }}
                            />
                            <Button variant="ghost" size="icon" onClick={() => {
                                const newMembers = [...formState.teamMembers];
                                newMembers.splice(idx, 1);
                                setFormState({ ...formState, teamMembers: newMembers });
                            }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}

                    <Button variant="outline" size="sm" className="w-full gap-2 border-dashed" onClick={() => {
                        setFormState(prev => ({
                            ...prev,
                            teamMembers: [...prev.teamMembers, '']
                        }));
                    }}>
                        <Plus className="h-4 w-4" /> Add a member
                    </Button>
                </div>
            </div>

            {/* Components & Supplies */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" /> Components and Supplies
                </h3>

                <div className="space-y-4">
                    {formState.components.map((comp, idx) => (
                        <div key={idx} className="flex flex-col gap-2 p-3 border rounded-lg bg-secondary/5">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Component Name (e.g. Arduino Uno)"
                                    className="flex-1"
                                    value={comp.name}
                                    onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                                />
                                <Input
                                    placeholder="Qty"
                                    className="w-20"
                                    value={comp.qty}
                                    onChange={(e) => updateComponent(idx, 'qty', e.target.value)}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                        const newComps = [...formState.components];
                                        newComps.splice(idx, 1);
                                        setFormState({ ...formState, components: newComps });
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Where to buy link (optional)"
                                    className="pl-9 h-9 text-sm text-muted-foreground bg-background/50"
                                    value={comp.link || ''}
                                    onChange={(e) => updateComponent(idx, 'link', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addComponent} className="gap-2">
                        <Plus className="h-4 w-4" /> Select a component or supply
                    </Button>
                </div>
            </div>

            {/* Tools & Machines */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" /> Tools and Machines ({formState.tools.length})
                </h3>

                <div className="border rounded-lg p-4 bg-background/50 space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search or add a tool..."
                            value={toolSearch}
                            onChange={(e) => setToolSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && toolSearch.trim()) {
                                    e.preventDefault();
                                    if (!formState.tools.includes(toolSearch.trim())) {
                                        toggleTool(toolSearch.trim());
                                        setToolSearch('');
                                    }
                                }
                            }}
                        />
                        <Button variant="secondary" onClick={() => {
                            if (toolSearch.trim() && !formState.tools.includes(toolSearch.trim())) {
                                toggleTool(toolSearch.trim());
                                setToolSearch('');
                            }
                        }} disabled={!toolSearch.trim()}>
                            Add
                        </Button>
                    </div>

                    {/* Selected Tools */}
                    {formState.tools.length > 0 && (
                        <div className="pt-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Selected Tools:</Label>
                            <div className="flex flex-wrap gap-2">
                                {formState.tools.map(tool => (
                                    <Badge key={tool} variant="default" className="pl-3 pr-1 py-1 gap-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
                                        {tool}
                                        <button onClick={() => toggleTool(tool)} className="hover:bg-primary-foreground/20 rounded-full p-0.5 ml-1">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator className="my-2" />

                    {/* Suggestions */}
                    <div>
                        <Label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">Common Tools</Label>
                        <ScrollArea className="h-32">
                            <div className="flex flex-wrap gap-2">
                                {allTools.filter(t => t.toLowerCase().includes(toolSearch.toLowerCase()) && !formState.tools.includes(t)).map(tool => (
                                    <Badge
                                        key={tool}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-colors px-3 py-1"
                                        onClick={() => toggleTool(tool)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> {tool}
                                    </Badge>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>

            {/* Apps & Platforms */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AppWindow className="h-5 w-5 text-primary" /> Apps and Platforms
                </h3>

                <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Select an app or platform
                </Button>
            </div>

            {/* Description */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Project Description
                </h3>
                <RichTextEditor
                    placeholder="# Write your project details here..."
                    className="min-h-[300px]"
                    value={formState.description}
                    onChange={(val) => setFormState({ ...formState, description: val })}
                />
            </div>

            {/* Code */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" /> Code
                </h3>
                <div className="space-y-2">
                    {formState.codeLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-2">
                            <Input
                                placeholder="Paste URL (GitHub, Gist, etc.)"
                                value={link}
                                onChange={(e) => updateLink('codeLinks', idx, e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => {
                                const newLinks = [...formState.codeLinks];
                                newLinks.splice(idx, 1);
                                setFormState({ ...formState, codeLinks: newLinks });
                            }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addLinkField('codeLinks')} className="gap-2">
                        <Plus className="h-4 w-4" /> Add a link or embed
                    </Button>
                </div>
            </div>

            {/* Video Links */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-primary" /> Video Demonstration
                </h3>
                <div className="space-y-2">
                    {formState.videoLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-2">
                            <Input
                                placeholder="Paste YouTube or Vimeo URL"
                                value={link}
                                onChange={(e) => updateLink('videoLinks', idx, e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => {
                                const newLinks = [...formState.videoLinks];
                                newLinks.splice(idx, 1);
                                setFormState({ ...formState, videoLinks: newLinks });
                            }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addLinkField('videoLinks')} className="gap-2">
                        <Plus className="h-4 w-4" /> Add video link
                    </Button>
                </div>
            </div>

            {/* Documentation */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" /> Documentation
                </h3>
                <div className="text-sm text-muted-foreground italic mb-2">No documentation to add</div>
                <div className="space-y-2">
                    {formState.docLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-2">
                            <Input
                                placeholder="Paste Documentation URL"
                                value={link}
                                onChange={(e) => updateLink('docLinks', idx, e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => {
                                const newLinks = [...formState.docLinks];
                                newLinks.splice(idx, 1);
                                setFormState({ ...formState, docLinks: newLinks });
                            }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addLinkField('docLinks')} className="gap-2">
                        <Plus className="h-4 w-4" /> Add a link or embed
                    </Button>
                </div>
            </div>

        </div>
    );
}
