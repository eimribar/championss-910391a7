import React, { useEffect, useState } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Construction } from "lucide-react";

export default function IntegrationsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        window.location.href = createPageUrl('Landing?reason=auth_required');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
          <Briefcase className="w-8 h-8 text-blue-600" />
          <span>Integrations</span>
        </h1>
        <p className="text-slate-600 mt-2">
          Connect ChampionTracker with your favorite tools.
        </p>
      </div>

      <Card className="text-center py-12">
        <CardHeader>
          <Construction className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <CardTitle className="text-2xl font-semibold text-slate-800">
            Coming Soon!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 max-w-md mx-auto">
            We're working hard to bring you powerful integrations with CRM systems, sales engagement platforms, and more. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}