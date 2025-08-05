import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Clock, Crown } from "lucide-react";

export default function StatsOverview({ totalChampions, recentChanges, changesThisWeek, subscriptionTier }) {
  const getChampionLimit = () => {
    switch (subscriptionTier) {
      case "pro": return 100;
      case "enterprise": return "Unlimited";
      default: return 10;
    }
  };

  const limit = getChampionLimit();
  const usage = limit === "Unlimited" ? 0 : (totalChampions / limit) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Champions */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 bg-blue-500 rounded-full opacity-10" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {totalChampions}/{limit}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {totalChampions}
          </div>
          <p className="text-sm text-slate-600">Champions tracked</p>
          {usage > 0 && (
            <div className="mt-2">
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${usage > 80 ? 'bg-red-500' : usage > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(usage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Changes */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 bg-green-500 rounded-full opacity-10" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            {recentChanges > 0 && (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                New!
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {recentChanges}
          </div>
          <p className="text-sm text-slate-600">Recent job changes</p>
        </CardContent>
      </Card>

      {/* This Week */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 bg-purple-500 rounded-full opacity-10" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {changesThisWeek}
          </div>
          <p className="text-sm text-slate-600">Changes this week</p>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-6 -translate-y-6 bg-orange-500 rounded-full opacity-10" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Crown className="w-5 h-5 text-orange-600" />
            </div>
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 capitalize">
              {subscriptionTier}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {subscriptionTier === "free" ? "Free" : subscriptionTier === "pro" ? "$29" : "Custom"}
          </div>
          <p className="text-sm text-slate-600">
            {subscriptionTier === "free" ? "Current plan" : "per month"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}