"use client";

import { useEffect, useState } from "react";
import { TreeNode } from "./tree-node";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganisationStructure {
  id: string;
  name: string;
  level: number;
  path: string;
  parentId: string | null;
  userCount: number;
  children?: OrganisationStructure[];
}

interface HierarchyData {
  tree: OrganisationStructure[];
  metadata: {
    totalStructures: number;
    maxDepth: number;
    totalUsers: number;
    levelDistribution: Record<string, number>;
  };
}

export function OrganisationalTree() {
  const [data, setData] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
            .filter((node: OrganisationStructure) => node.level === 0)
            .map((node: OrganisationStructure) => node.id);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-muted-foreground">Loading...</span>
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
        <p className="text-muted-foreground">No organisational structures found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {data.tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          isExpanded={expandedNodes.has(node.id)}
          onToggle={toggleNode}
        />
      ))}
    </div>
  );
} 