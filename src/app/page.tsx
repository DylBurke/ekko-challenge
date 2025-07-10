import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
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
                <p className="text-sm text-muted-foreground">Organisational Management</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Button variant="default" size="sm">Home</Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/hierarchy">Hierarchy</Link>
              </Button>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Gekko
          </h2>
          <p className="text-lg text-muted-foreground">
            Manage your organisational hierarchy and user permissions.
          </p>
        </div>

        <div className="max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/hierarchy">
                  View Organisational Tree
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Manage Permissions
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
