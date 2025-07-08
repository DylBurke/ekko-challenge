import { OrganizationalTree } from "@/components/organizational-tree";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function HierarchyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Gekko Pty Ltd</h1>
                <p className="text-sm text-muted-foreground">Organizational Hierarchy</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Dashboard</Link>
              </Button>
              <Button variant="default" size="sm">Hierarchy</Button>
              <Button variant="ghost" size="sm">Users</Button>
              <Button variant="ghost" size="sm">Permissions</Button>
              <Button variant="ghost" size="sm">Settings</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Organizational Structure
              </h2>
              <p className="text-lg text-muted-foreground">
                Explore the complete hierarchy of Gekko Pty Ltd
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <span className="mr-2">📥</span>
                Export
              </Button>
              <Button>
                <span className="mr-2">➕</span>
                Add Structure
              </Button>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Structures
                </CardTitle>
                <span className="text-2xl font-bold text-foreground">17</span>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Max Depth
                </CardTitle>
                <span className="text-2xl font-bold text-foreground">4</span>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <span className="text-2xl font-bold text-foreground">14</span>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Permissions
                </CardTitle>
                <span className="text-2xl font-bold text-foreground">16</span>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Organizational Tree Component */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organizational Tree</CardTitle>
                <CardDescription>
                  Interactive view of the complete organizational structure
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Company</Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Division</Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Department</Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Team</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OrganizationalTree />
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 