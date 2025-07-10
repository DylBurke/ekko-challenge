"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganisationStructure {
  id: string;
  name: string;
  level: number;
  path: string;
  parentId: string | null;
  userCount: number;
  children?: OrganisationStructure[];
}

interface TreeNodeProps {
  node: OrganisationStructure;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  depth?: number;
}

const getLevelName = (level: number): string => {
  switch (level) {
    case 0: return "Company";
    case 1: return "Division";
    case 2: return "Department";
    case 3: return "Team";
    default: return `Level ${level}`;
  }
};

export function TreeNode({ 
  node, 
  isExpanded, 
  onToggle, 
  depth = 0 
}: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const paddingLeft = depth * 24; // 24px per level
  
  return (
    <div className="select-none">
      {/* Node Row */}
      <div
        className={cn(
          "flex items-center py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
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
              {node.name}
            </h4>
            
            {/* Level Badge */}
            <Badge variant="outline" className="text-xs">
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
            {node.path}
          </p>
        </div>
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
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
} 