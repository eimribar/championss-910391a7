import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Settings, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Champion",
      description: "Track a new contact",
      icon: Plus,
      url: createPageUrl("AddChampion"),
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Bulk Upload",
      description: "Upload CSV file",
      icon: Upload,
      url: createPageUrl("BulkUpload"),
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "View Analytics",
      description: "See insights",
      icon: BarChart3,
      url: createPageUrl("Analytics"),
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Settings",
      description: "Manage preferences",
      icon: Settings,
      url: createPageUrl("Settings"),
      color: "bg-slate-600 hover:bg-slate-700"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link key={action.title} to={action.url}>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-slate-50 transition-colors w-full"
              >
                <action.icon className="w-6 h-6 text-slate-600" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-slate-500">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}