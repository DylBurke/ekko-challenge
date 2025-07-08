"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationStructure {
  id: string;
  name: string;
  level: number;
  path: string;
  parentId: string | null;
  userCount: number;
  children?: OrganizationStructure[];
}

interface TreeNodeProps {
  node: OrganizationStructure;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  searchTerm?: string;
  depth?: number;
}

const getLevelColor = (level: number): string => {
  switch (level) {
    case 0: return "bg-slate-100 text-slate-800 border-slate-200"; // Company
    case 1: return "bg-blue-50 text-blue-700 border-blue-200"; // Division
    case 2: return "bg-green-50 text-green-700 border-green-200"; // Department
    case 3: return "bg-purple-50 text-purple-700 border-purple-200"; // Team
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getLevelName = (level: number): string => {
  switch (level) {
    case 0: return "Company";
    case 1: return "Division";
    case 2: return "Department";
    case 3: return "Team";
    default: return `Level ${level}`;
  }
};

const highlightText = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm.trim()) return text;
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return parts.map((part, index) => 
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export function TreeNode({ 
  node, 
  isExpanded, 
  onToggle, 
  searchTerm = "", 
  depth = 0 
}: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const paddingLeft = depth * 24; // 24px per level
  
  return (
    <div className="select-none">
      {/* Node Row */}
      <div
        className={cn(
          "flex items-center py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors",
          "border border-transparent hover:border-border"
        )}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
      >
        {/* Expand/Collapse Button */}
        <div className="flex items-center mr-3">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onToggle(node.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="h-6 w-6" /> // Spacer for leaf nodes
          )}
        </div>

        {/* Node Icon */}
        <div className="mr-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Node Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {/* Node Name */}
            <h4 className="font-medium text-foreground truncate">
              {highlightText(node.name, searchTerm)}
            </h4>
            
            {/* Level Badge */}
            <Badge 
              variant="outline" 
              className={cn("text-xs", getLevelColor(node.level))}
            >
              {getLevelName(node.level)}
            </Badge>
            
            {/* User Count */}
            {node.userCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{node.userCount}</span>
              </div>
            )}
          </div>
          
          {/* Path */}
          <p className="text-sm text-muted-foreground truncate mt-1">
            {highlightText(node.path, searchTerm)}
          </p>
        </div>

        {/* Children Count */}
        {hasChildren && (
          <Badge variant="secondary" className="ml-2">
            {node.children!.length} {node.children!.length === 1 ? 'child' : 'children'}
          </Badge>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              isExpanded={isExpanded}
              onToggle={onToggle}
              searchTerm={searchTerm}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
} 