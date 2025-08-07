
import React, { useState, useEffect } from "react";
import { Champion } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, Target, Calendar } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { User } from "@/api/entities"; 
import { createPageUrl } from "@/utils"; 

export default function Analytics() {
  const [champions, setChampions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkAuthAndLoadAnalytics = async () => {
      setIsLoading(true);
      try {
        const userData = await User.me(); 
        setCurrentUser(userData);

        // Filter champions by the currently logged-in user
        const data = await Champion.filter({ created_by: userData.email }, "-updated_date"); 
        setChampions(data);
      } catch (error) {
        console.error("Authentication failed or error loading champions:", error);
        window.location.href = createPageUrl("Landing?action=login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthAndLoadAnalytics();
  }, []);

  const getAnalytics = () => {
    const now = new Date();
    const last30Days = subDays(now, 30);
    const thisMonthStart = startOfMonth(now);
    // const thisMonthEnd = endOfMonth(now); // Not used in current calculations

    const totalChampions = champions.length;
    const activeChampions = champions.filter(c => c.status === "monitoring").length;
    // 'recentChanges' here means total changes detected ever, not just recent ones by date.
    // This might need clarification or renaming based on desired metric.
    const totalChangesDetected = champions.filter(c => c.status === "changed").length;

    const changesLast30Days = champions.filter(c =>
      c.change_detected_at && new Date(c.change_detected_at) >= last30Days
    ).length;

    const changesThisMonth = champions.filter(c =>
      c.change_detected_at &&
      new Date(c.change_detected_at) >= thisMonthStart &&
      new Date(c.change_detected_at) <= now // Use 'now' as end for "this month so far"
    ).length;

    // Company analysis
    const companyChanges = {};
    champions.forEach(c => {
      if (c.status === "changed" && c.previous_company && c.current_company && c.previous_company !== c.current_company) {
        const key = `${c.previous_company} → ${c.current_company}`;
        companyChanges[key] = (companyChanges[key] || 0) + 1;
      }
    });

    const topCompanyChanges = Object.entries(companyChanges)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalChampions,
      activeChampions,
      totalChangesDetected, // Renamed for clarity
      changesLast30Days,
      changesThisMonth,
      topCompanyChanges
    };
  };

  if (isLoading) {
    return (
       <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const analytics = getAnalytics();


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center space-x-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <span>Analytics</span>
        </h1>
        <p className="text-slate-600 mt-2">
          Insights into your champion tracking and job change patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          {/* ... Total Champions Card ... */}
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-blue-500 rounded-full opacity-10" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {analytics.totalChampions}
            </div>
            <p className="text-sm text-slate-600">Champions tracked</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          {/* ... Active Monitoring Card ... */}
           <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-green-500 rounded-full opacity-10" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {analytics.activeChampions}
            </div>
            <p className="text-sm text-slate-600">Currently monitoring</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          {/* ... Total Changes Detected Card, using analytics.totalChangesDetected ... */}
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-orange-500 rounded-full opacity-10" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                Changes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {analytics.totalChangesDetected}
            </div>
            <p className="text-sm text-slate-600">Total job changes detected</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          {/* ... Changes Last 30 Days Card ... */}
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-purple-500 rounded-full opacity-10" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                30 Days
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {analytics.changesLast30Days}
            </div>
            <p className="text-sm text-slate-600">Changes last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {champions
              .filter(c => c.status === "changed" && c.change_detected_at) // Ensure status is 'changed'
              .sort((a, b) => new Date(b.change_detected_at) - new Date(a.change_detected_at))
              .slice(0, 5)
              .map((champion) => (
                <div key={champion.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{champion.name}</p>
                    <p className="text-sm text-slate-600 truncate" title={`${champion.previous_title} at ${champion.previous_company} → ${champion.current_title} at ${champion.current_company}`}>
                      Moved from <span className="font-semibold">{champion.previous_company}</span> to <span className="font-semibold">{champion.current_company}</span>
                    </p>
                     <p className="text-xs text-slate-500 truncate">
                      {champion.previous_title} → {champion.current_title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(champion.change_detected_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              ))}

            {champions.filter(c => c.status === "changed" && c.change_detected_at).length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No job changes detected yet</p>
                <p className="text-sm text-slate-400">
                  We'll start monitoring your champions for changes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Company Changes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>Company Migration Patterns</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topCompanyChanges.length > 0 ? (
              analytics.topCompanyChanges.map(([change, count], index) => (
                <div key={change} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-pink-100'][index % 5] // Cycle colors
                    }`}>
                      <span className={`text-sm font-medium ${
                        ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-pink-600'][index % 5]
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate" title={change}>{change}</p>
                      <p className="text-sm text-slate-500">
                        {count} champion{count > 1 ? 's' : ''} moved
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">{count}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No company migration patterns yet</p>
                <p className="text-sm text-slate-400">
                  Patterns will appear as champions change jobs.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pro Tip */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip: Act Fast!</h3>
              <p className="text-blue-800 mb-3">
                The optimal window to reach out is within <strong>48 hours</strong> of a job change.
                Champions are often most receptive to new connections and solutions during their initial transition period at a new company.
              </p>
              <div className="text-sm text-blue-700">
                Industry data suggests that contacts made within this timeframe can have significantly higher engagement rates.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
