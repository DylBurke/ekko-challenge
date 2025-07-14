"use client";

import { AdminHierarchyTree } from "@/components/admin-hierarchy-tree";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

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

export default function HierarchyPage() {
  const [hierarchyTree, setHierarchyTree] = useState<HierarchyNode[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchHierarchyData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch hierarchy data which includes user counts
      const hierarchyResponse = await fetch('/api/hierarchy/tree');
      
      if (hierarchyResponse.ok) {
        const hierarchyData = await hierarchyResponse.json();
        
        if (hierarchyData.success) {
          setHierarchyTree(hierarchyData.data.tree);
          setTotalUsers(hierarchyData.data.metadata.totalUsers);
        }
      }
    } catch (error) {
      console.error('Error fetching hierarchy data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHierarchyData();
  }, [fetchHierarchyData]);

  const handleAddStructure = (parentId: string, name: string) => {
    // In a real app, you would create the structure here
    console.log('Add structure:', name, 'to parent:', parentId);
  };

  const handleViewUsers = (structureId: string, structureName: string) => {
    // In a real app, you would show users for this structure
    console.log('View users for:', structureName);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Gekko Pty Ltd</h1>
                <p className="text-sm text-muted-foreground">Organisational Hierarchy</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="default" size="sm">Hierarchy</Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/demo">User Demo</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">Admin</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Organisational Hierarchy
          </h2>
          <p className="text-muted-foreground">
            Interactive view of the organisational structure with color-coded levels
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Each user count shows the number of employees with permissions specifically assigned to that structure, not the cumulative count of all users in that division or department.
            </p>
          </div>
        </div>

        <AdminHierarchyTree 
          tree={hierarchyTree}
          onAddStructure={handleAddStructure}
          onViewUsers={handleViewUsers}
          loading={loading}
          realUserCount={totalUsers}
        />
      </main>
    </div>
  );
} 