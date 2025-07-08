"use client";

import { useEffect, useState } from "react";
import { TreeNode } from "./tree-node";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, RefreshCw } from "lucide-react";

interface OrganizationStructure {
  id: string;
  name: string;
  level: number;
  path: string;
  parentId: string | null;
  userCount: number;
  children?: OrganizationStructure[];
}

interface HierarchyData {
  tree: OrganizationStructure[];
  metadata: {
    totalStructures: number;
    maxDepth: number;
    totalUsers: number;
    levelDistribution: Record<string, number>;
  };
}

export function OrganizationalTree() {
  const [data, setData] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const fetchHierarchyData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hierarchy/tree');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        // Auto-expand root nodes
        if (result.data.tree) {
          const rootIds = result.data.tree
            .filter((node: OrganizationStructure) => node.level === 0)
            .map((node: OrganizationStructure) => node.id);
          setExpandedNodes(new Set(rootIds));
        }
      } else {
        throw new Error(result.message || 'Failed to load hierarchy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchyData();
  }, []);

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
    if (data?.tree) {
      const allIds = getAllNodeIds(data.tree);
      setExpandedNodes(new Set(allIds));
    }
  };

  const collapseAll = () => {
    if (data?.tree) {
      const rootIds = data.tree
        .filter(node => node.level === 0)
        .map(node => node.id);
      setExpandedNodes(new Set(rootIds));
    }
  };

  const getAllNodeIds = (nodes: OrganizationStructure[]): string[] => {
    const ids: string[] = [];
    
    const traverse = (nodeList: OrganizationStructure[]) => {
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

  const filterNodes = (nodes: OrganizationStructure[], term: string): OrganizationStructure[] => {
    if (!term.trim()) return nodes;
    
    const filtered: OrganizationStructure[] = [];
    
    nodes.forEach(node => {
      const matchesSearch = node.name.toLowerCase().includes(term.toLowerCase()) ||
                           node.path.toLowerCase().includes(term.toLowerCase());
      
      const filteredChildren = node.children ? filterNodes(node.children, term) : [];
      
      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        });
      }
    });
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-muted-foreground">Loading organizational structure...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Error: {error}</p>
        <Button onClick={fetchHierarchyData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data?.tree?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No organizational structures found.</p>
      </div>
    );
  }

  const filteredTree = filterNodes(data.tree, searchTerm);

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search structures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
          <Button variant="outline" size="sm" onClick={fetchHierarchyData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="flex items-center gap-2">
                     <Badge variant="secondary">
             {filteredTree.length} result{filteredTree.length !== 1 ? 's' : ''} for &quot;{searchTerm}&quot;
           </Badge>
          {filteredTree.length === 0 && (
            <span className="text-sm text-muted-foreground">
              No structures match your search.
            </span>
          )}
        </div>
      )}

      {/* Tree Display */}
      <div className="space-y-1">
        {filteredTree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            isExpanded={expandedNodes.has(node.id)}
            onToggle={toggleNode}
            searchTerm={searchTerm}
          />
        ))}
      </div>

      {/* Summary */}
      {data.metadata && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2">Hierarchy Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Structures:</span>
              <span className="ml-2 font-medium">{data.metadata.totalStructures}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Max Depth:</span>
              <span className="ml-2 font-medium">{data.metadata.maxDepth}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Users:</span>
              <span className="ml-2 font-medium">{data.metadata.totalUsers}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Showing:</span>
              <span className="ml-2 font-medium">{filteredTree.length} structure{filteredTree.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 