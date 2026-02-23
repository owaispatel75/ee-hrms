import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Store expanded menu state in localStorage
const STORAGE_KEY = 'nav_expanded_items';

export function NavMain({ items = [], position }: { items: NavItem[]; position: 'left' | 'right' }) {
    const page = usePage();
    const { state } = useSidebar();
    
    // Check if the document is in RTL mode
    const isRtl = document.documentElement.dir === 'rtl';
    
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    
    // Determine the actual position considering RTL mode
    const effectivePosition = isRtl ? (position === 'left' ? 'right' : 'left') : position;
    
    // Initialize expanded state
    useEffect(() => {
        // Start with a clean slate - close all menus
        const newExpandedItems: Record<string, boolean> = {};
        
        // Process menus that should be expanded
        const processMenuItems = (menuItems: NavItem[], parentKey?: string) => {
            menuItems.forEach(item => {
                // If this is the active item or contains the active item
                const isItemActive = isActive(item.href);
                const hasActiveChild = item.children && isChildActive(item.children);
                
                // If this item or its children are active, expand it
                if (parentKey && (isItemActive || hasActiveChild)) {
                    newExpandedItems[parentKey] = true;
                }
                
                // If this item has children and is active, has active children, or defaultOpen is true, expand it
                if (item.children && (isItemActive || hasActiveChild || item.defaultOpen === true)) {
                    newExpandedItems[item.title] = true;
                    
                    // Recursively check children
                    processMenuItems(item.children, item.title);
                }
                
                // Check nested children with their own keys
                if (item.children) {
                    checkNestedChildren(item.children, 1, newExpandedItems);
                }
            });
        };
        
        processMenuItems(items);
        
        // Update state and save to localStorage
        setExpandedItems(newExpandedItems);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newExpandedItems));
        } catch (e) {
            console.error('Error saving navigation state:', e);
        }
    }, [page.url, items]); // Re-run when URL changes or items change
    
    // Helper function to check nested children for active items
    const checkNestedChildren = (
        children: NavItem[], 
        level: number, 
        newExpandedItems: Record<string, boolean>
    ) => {
        children.forEach(child => {
            const childKey = `${level}-${child.title}`;
            const isChildItemActive = isActive(child.href);
            const hasActiveChild = child.children && isChildActive(child.children);
            
            if (child.children && (isChildItemActive || hasActiveChild)) {
                newExpandedItems[childKey] = true;
                checkNestedChildren(child.children, level + 1, newExpandedItems);
            }
        });
    };
    
    const toggleExpand = (title: string) => {
        const newExpandedItems = {
            ...expandedItems,
            [title]: !expandedItems[title]
        };
        
        setExpandedItems(newExpandedItems);
        
        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newExpandedItems));
        } catch (e) {
            console.error('Error saving navigation state:', e);
        }
    };
    
    const isActive = (href?: string) => {
        if (!href) return false;
        
        // Extract pathname from href if it's a full URL
        const hrefPath = href.startsWith('http') ? new URL(href).pathname : href;
        const currentPath = page.url;
        
        const active = currentPath === hrefPath || currentPath.startsWith(hrefPath + '/');
        return active;
    };
    
    const isChildActive = (children?: NavItem[]) => {
        if (!children) return false;
        return children.some(child => isActive(child.href) || isChildActive(child.children));
    };
    
    const renderSubMenu = (children: NavItem[], level: number = 1) => {
        return (
            <SidebarMenuSub>
                {children.map(child => (
                    <div key={child.title}>
                        {child.children ? (
                            // Nested submenu item with children
                            <>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton 
                                        isActive={isChildActive(child.children)}
                                        onClick={() => toggleExpand(`${level}-${child.title}`)}
                                    >
                                        <div className={`flex items-center gap-2 ${effectivePosition === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}>
                                            {state !== "collapsed" && (
                                                <>
                                                    <span className="whitespace-nowrap">{child.title}</span>
                                                    {expandedItems[`${level}-${child.title}`] ? 
                                                        <ChevronDown className="size-5 ml-auto text-muted-foreground" /> : 
                                                        <ChevronRight className="size-5 ml-auto text-muted-foreground" />
                                                    }
                                                </>
                                            )}
                                        </div>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                
                                {/* Render nested children */}
                                {expandedItems[`${level}-${child.title}`] && renderSubMenu(child.children, level + 1)}
                            </>
                        ) : (
                            // Regular submenu item
                            <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild isActive={isActive(child.href)}>
                                    {child.target === '_blank' ? (
                                        <a
                                            href={child.href || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 ${effectivePosition === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}
                                        >
                                            {state !== "collapsed" && <span className="whitespace-nowrap">{child.title}</span>}
                                        </a>
                                    ) : (
                                        <Link
                                            href={child.href || '#'}
                                            prefetch
                                            className={`flex items-center gap-2 ${effectivePosition === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}
                                        >
                                            {state !== "collapsed" && <span className="whitespace-nowrap">{child.title}</span>}
                                        </Link>
                                    )}
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        )}
                    </div>
                ))}
            </SidebarMenuSub>
        );
    };
    
    return (
        <SidebarGroup className="px-1.5 py-0">
            <SidebarMenu className="gap-2">
                {items.map((item) => {
                    const Icon = item.icon as any;
                    const isCollapsed = state === "collapsed";
                    
                    return (
                        <div key={item.title}>
                            {item.children ? (
                                // Parent item with children
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton 
                                            isActive={isChildActive(item.children)} 
                                            tooltip={{ children: item.title }}
                                            onClick={() => toggleExpand(item.title)}
                                        >
                                            <div className={`flex items-center gap-2 w-full ${effectivePosition === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}>
                                                {effectivePosition === 'right' ? (
                                                    !isCollapsed ? (
                                                        <>
                                                            <span className="whitespace-nowrap">{item.title}</span>
                                                            {Icon && <Icon className="size-5 shrink-0" />}
                                                            {expandedItems[item.title] ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                                                        </>
                                                    ) : (
                                                        Icon && <Icon className="size-5 shrink-0" />
                                                    )
                                                ) : (
                                                    <>
                                                        {Icon && <Icon className="size-5 shrink-0" />}
                                                        {!isCollapsed && (
                                                            <>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="whitespace-nowrap">{item.title}</span>
                                                                    {item.badge && (
                                                                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary text-white">
                                                                            {item.badge.label}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {expandedItems[item.title] ? <ChevronDown className="size-5 ml-auto" /> : <ChevronRight className="size-5 ml-auto" />}
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    
                                    {/* Child items */}
                                    {!isCollapsed && expandedItems[item.title] && renderSubMenu(item.children)}
                                </>
                            ) : (
                                // Regular item without children
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={{ children: item.title }}>
                                        {item.target === '_blank' ? (
                                            <a
                                                href={item.href || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-2 ${effectivePosition === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}
                                            >
                                                {effectivePosition === 'right' ? (
                                                    !isCollapsed ? (
                                                        <>
                                                            <span className="whitespace-nowrap">{item.title}</span>
                                                            {Icon && <Icon className="size-5 shrink-0" />}
                                                        </>
                                                    ) : (
                                                        Icon && <Icon className="size-5 shrink-0" />
                                                    )
                                                ) : (
                                                    <>
                                                        {Icon && <Icon className="size-5 shrink-0" />}
                                                        {!isCollapsed && <span className="whitespace-nowrap">{item.title}</span>}
                                                    </>
                                                )}
                                            </a>
                                        ) : (
                                            <Link
                                                href={item.href || '#'}
                                                prefetch
                                                className={`flex items-center gap-2 ${effectivePosition === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}
                                            >
                                                {effectivePosition === 'right' ? (
                                                    !isCollapsed ? (
                                                        <>
                                                            <span className="whitespace-nowrap">{item.title}</span>
                                                            {Icon && <Icon className="size-5 shrink-0" />}
                                                        </>
                                                    ) : (
                                                        Icon && <Icon className="size-5 shrink-0" />
                                                    )
                                                ) : (
                                                    <>
                                                        {Icon && <Icon className="size-5 shrink-0" />}
                                                        {!isCollapsed && <span className="whitespace-nowrap">{item.title}</span>}
                                                    </>
                                                )}
                                            </Link>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        </div>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}