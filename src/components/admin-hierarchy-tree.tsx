"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HierarchyNode {
  id: string;
  name: string;
  level: number;
  path: string;
  parentId: string | null;
  userCount: number;
  children?: HierarchyNode[];
  isNewlyCreated?: boolean;
}

interface AdminHierarchyTreeProps {
  tree: HierarchyNode[];
  onAddStructure?: (parentId: string, parentName: string) => void;
  onViewUsers?: (structureId: string, structureName: string) => void;
  loading?: boolean;
  realUserCount?: number;
}

// Level-based color coding
const getLevelStyling = (level: number, isNewlyCreated?: boolean) => {
  const baseStyles = {
    0: { // Company
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      background: "bg-purple-50/30 border-purple-200",
      icon: "text-purple-600"
    },
    1: { // Division
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      background: "bg-blue-50/30 border-blue-200",
      icon: "text-blue-600"
    },
    2: { // Department
      badge: "bg-green-50 text-green-700 border-green-200",
      background: "bg-green-50/30 border-green-200",
      icon: "text-green-600"
    },
    3: { // Team
      badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
      background: "bg-yellow-50/30 border-yellow-200",
      icon: "text-yellow-600"
    }
  };

  const style = baseStyles[level as keyof typeof baseStyles] || {
    badge: "bg-gray-50 text-gray-700 border-gray-200",
    background: "bg-gray-50/30 border-gray-200",
    icon: "text-gray-600"
  };

  // Add glow effect for newly created structures
  if (isNewlyCreated) {
    return {
      ...style,
      background: `${style.background} ring-2 ring-green-200 shadow-lg`,
      badge: `${style.badge} ring-1 ring-green-300`
    };
  }

  return style;
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

function TreeNode({ 
  node, 
  expanded, 
  onToggle, 
  onAddStructure, 
  onViewUsers,
  expandedNodes 
}: { 
  node: HierarchyNode;
  expanded: boolean;
  onToggle: (nodeId: string) => void;
  onAddStructure?: (parentId: string, parentName: string) => void;
  onViewUsers?: (structureId: string, structureName: string) => void;
  expandedNodes: Set<string>;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const styling = getLevelStyling(node.level, node.isNewlyCreated);

  return (
    <div className="select-none">
      {/* Node Row */}
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-sm",
        styling.background
      )}>
        <div className="flex items-center gap-3 flex-1">
          {/* Expand/Collapse Button */}
          <div className="flex items-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onToggle(node.id)}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="h-6 w-6" />
            )}
          </div>

          {/* Node Icon */}
          <Building2 className={cn("h-5 w-5", styling.icon)} />

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground">{node.name}</h4>
              <Badge variant="outline" className={cn("text-xs", styling.badge)}>
                {getLevelName(node.level)}
              </Badge>
              {node.isNewlyCreated && (
                <Badge className="text-xs bg-green-500 text-white">New</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">{node.path}</p>
          </div>


        </div>


      </div>



      {/* Children */}
      {hasChildren && expanded && (
        <div className="ml-6 mt-2 space-y-2">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              expanded={expandedNodes.has(child.id)}
              onToggle={onToggle}
              onAddStructure={onAddStructure}
              onViewUsers={onViewUsers}
              expandedNodes={expandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminHierarchyTree({ 
  tree, 
  onAddStructure, 
  onViewUsers, 
  loading = false,
  realUserCount 
}: AdminHierarchyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = getAllNodeIds(tree);
    setExpandedNodes(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getAllNodeIds = (nodes: HierarchyNode[]): string[] => {
    const ids: string[] = [];
    const traverse = (nodeList: HierarchyNode[]) => {
      nodeList.forEach(node => {
        ids.push(node.id);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return ids;
  };

  // Helper functions
  const getTotalUsers = (node: HierarchyNode): number => {
    let total = node.userCount;
    if (node.children) {
      total += node.children.reduce((sum, child) => sum + getTotalUsers(child), 0);
    }
    return total;
  };

  const getMaxDepth = (node: HierarchyNode): number => {
    if (!node.children || node.children.length === 0) return node.level;
    return Math.max(...node.children.map(child => getMaxDepth(child)));
  };

  // Calculate statistics
  const totalStructures = getAllNodeIds(tree).length;
  const totalUsers = realUserCount ?? tree.reduce((sum, node) => sum + getTotalUsers(node), 0);
  const maxDepth = tree.length > 0 ? Math.max(...tree.map(node => getMaxDepth(node))) : -1;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organisational Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Org Tree
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hierarchy Statistics */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalStructures}</div>
            <div className="text-sm text-muted-foreground">Total Structures</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{maxDepth + 1}</div>
            <div className="text-sm text-muted-foreground">Max Depth</div>
          </div>
        </div>

        {/* Tree Display */}
        <div className="space-y-2">
          {tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              expanded={expandedNodes.has(node.id)}
              onToggle={toggleNode}
              onAddStructure={onAddStructure}
              onViewUsers={onViewUsers}
              expandedNodes={expandedNodes}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 