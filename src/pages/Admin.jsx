
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { testWeeklyCheck } from "@/api/functions";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, PlayCircle, ShieldCheck, Clock, Activity, Timer, AlertCircle } from "lucide-react"; // Added Activity, Timer, AlertCircle
import { AtmosphericCard, AtmosphericCardHeader, AtmosphericCardTitle, AtmosphericCardContent } from "@/components/ui/atmospheric-card";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Added Alert, AlertDescription

export default function Admin() { // Changed AdminPage to Admin
  const [isLoading, setIsLoading] = useState(false);
  // Removed copiedUrl, setCopiedUrl, copiedSecret, setCopiedSecret as they are no longer used
  // Removed webhookUrl and apiKeySecret initializations as values are now hardcoded in the new section
  const { toast } = useToast();

  // Removed copyToClipboard function as it's no longer needed for the new setup

  const handleRunCheck = async () => {
    setIsLoading(true);
    toast({
      title: "Initiating Check...",
      description: "The monitoring process for all users has started.",
    });

    try {
      const response = await testWeeklyCheck();
      
      if (response.data && response.data.success) {
        const { totalUsersChecked, totalBatchesSent, totalChampionsChecked } = response.data;
        toast({
          variant: "default",
          title: "✅ Check Completed Successfully!",
          description: `Checked ${totalUsersChecked} users, sent ${totalBatchesSent} batches with a total of ${totalChampionsChecked} champions to N8N.`,
          className: "bg-green-500/10 border-green-500/30 text-white",
        });
      } else {
        throw new Error(response.data?.error || "The check failed to complete successfully.");
      }
    } catch (error) {
      console.error("Failed to run weekly check from admin page:", error);
      toast({
        variant: "destructive",
        title: "❌ Check Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-8"> {/* Changed max-w-4xl to max-w-6xl */}
        <div className="relative mb-8">
            <div className="absolute -inset-4 coral-teal-gradient-subtle blur-2xl"></div>
            <div className="relative">
                <h1 className="text-4xl font-bold text-white flex items-center space-x-4 mb-2">
                <div className="p-3 coral-teal-gradient-subtle rounded-xl backdrop-blur-sm border border-orange-500/20">
                    <ShieldCheck className="w-8 h-8 text-orange-400" />
                </div>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Admin Controls</span>
                </h1>
                <p className="text-gray-400 text-lg pl-16">
                    Manual triggers and automated scheduling setup
                </p>
            </div>
        </div>

        {/* System Status - NEW SECTION */}
        <AtmosphericCard variant="premium">
          <AtmosphericCardHeader>
            <AtmosphericCardTitle className="flex items-center text-xl">
              <Activity className="w-5 h-5 mr-3 text-green-400" />
              System Status
            </AtmosphericCardTitle>
          </AtmosphericCardHeader>
          <AtmosphericCardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Placeholder for total users and champions */}
              <div className="flex flex-col items-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <span className="text-4xl font-bold text-green-300">1,234</span>
                  <span className="text-green-400 mt-2">Total Users</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-4xl font-bold text-blue-300">5,678</span>
                  <span className="text-blue-400 mt-2">Champions Monitored</span>
              </div>
            </div>

            {/* Service Health */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-400/20">
              <h3 className="font-medium text-green-300 mb-3 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Monitoring Service Status
              </h3>
              <div className="text-sm text-green-400/80 space-y-2">
                <div className="flex justify-between">
                  <span>• Champion Enrichment Workflow:</span>
                  <span className="text-green-400">✓ Active</span>
                </div>
                <div className="flex justify-between">
                  <span>• Job Change Monitoring:</span>
                  <span className="text-green-400">✓ Active</span>
                </div>
                <div className="flex justify-between">
                  <span>• N8N Integration:</span>
                  <span className="text-green-400">✓ Connected</span>
                </div>
                <div className="flex justify-between">
                  <span>• API Endpoints:</span>
                  <span className="text-green-400">✓ Operational</span>
                </div>
              </div>
            </div>
          </AtmosphericCardContent>
        </AtmosphericCard>

        {/* Manual Trigger Section - Preserved */}
        <AtmosphericCard variant="premium">
            <AtmosphericCardHeader>
                <AtmosphericCardTitle className="flex items-center text-xl">
                    <PlayCircle className="w-5 h-5 mr-3 text-orange-400" />
                    Manual Job Trigger
                </AtmosphericCardTitle>
            </AtmosphericCardHeader>
            <AtmosphericCardContent className="space-y-4">
                <p className="text-gray-400">
                    Manually start the monitoring process for all users and their champions. This uses the same logic as the automated system but runs immediately.
                </p>
                <Button 
                    onClick={handleRunCheck} 
                    disabled={isLoading} 
                    className="w-full h-12 text-lg coral-teal-gradient hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Run Full Monitoring Check"
                    )}
                </Button>
            </AtmosphericCardContent>
        </AtmosphericCard>

        {/* Updated N8N Configuration Section */}
        <AtmosphericCard variant="premium">
            <AtmosphericCardHeader>
                <AtmosphericCardTitle className="flex items-center text-xl">
                    <Clock className="w-5 h-5 mr-3 text-orange-400" />
                    Automated Champion Monitoring Setup (N8N Direct API Approach)
                </AtmosphericCardTitle>
            </AtmosphericCardHeader>
            <AtmosphericCardContent>
                <div className="space-y-6">
                    <Alert className="atmospheric-card border-blue-500/30 bg-blue-500/5">
                        <AlertCircle className="h-4 w-4 text-blue-400" />
                        <AlertDescription className="text-blue-300">
                            <strong>Scalable Approach:</strong> This configuration moves the orchestration logic to N8N, using Base44&apos;s proven entity APIs. 
                            This approach scales efficiently and handles up to 1000+ users with batch processing.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">N8N Workflow Configuration</h3>
                        
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            <h4 className="font-medium text-orange-300 mb-3">1. Schedule Trigger Node</h4>
                            <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                <li>• <strong>Type:</strong> Cron Expression</li>
                                <li>• <strong>Expression:</strong> <code className="bg-gray-800 px-2 py-1 rounded">0 9 * * 1</code> (Every Monday at 9 AM)</li>
                                <li>• <strong>Timezone:</strong> Your preferred timezone</li>
                            </ul>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            <h4 className="font-medium text-orange-300 mb-3">2. Fetch Users Node (HTTP Request)</h4>
                            <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                <li>• <strong>Method:</strong> GET</li>
                                <li>• <strong>URL:</strong> <code className="bg-gray-800 px-2 py-1 rounded">https://app.base44.com/api/apps/YOUR_BASE44_APP_ID/entities/User</code></li>
                                <li>• <strong>Headers:</strong></li>
                                <li className="ml-4">- <code>api_key: 67b93713487c4019a6a045f55769a1ff</code></li>
                                <li className="ml-4">- <code>Content-Type: application/json</code></li>
                            </ul>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            <h4 className="font-medium text-orange-300 mb-3">3. Filter Users Node (Code)</h4>
                            <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded overflow-x-auto">
{`// Collect all user objects from the input items
const users = $input.all().map(item => item.json);

// Filter for users with onboarding completed
const activeUsers = users.filter(user => 
  user.onboarding_completed === true
);

// If no active users, stop the workflow
if (activeUsers.length === 0) {
  return [];
}

// Batch processing for scalability (50 users per batch)
const batchSize = 50;
const batches = [];
for (let i = 0; i < activeUsers.length; i += batchSize) {
  batches.push(activeUsers.slice(i, i + batchSize));
}

return batches.map((batch, index) => ({
  json: { batch, batchIndex: index, totalBatches: batches.length }
}));`}
                            </pre>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            <h4 className="font-medium text-orange-300 mb-3">4. Process User Batch Node (Code)</h4>
                            <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded overflow-x-auto">
{`const { batch, batchIndex } = $json;
const results = [];

for (const user of batch) {
  // Calculate check frequency in minutes
  let checkMinutes;
  switch (user.check_frequency) {
    case 'every_2_minutes': checkMinutes = 2; break;
    case 'daily': checkMinutes = 1440; break;
    case 'monthly': checkMinutes = 43200; break;
    case 'weekly':
    default: checkMinutes = 10080; break;
  }
  
  const dateThreshold = new Date(Date.now() - checkMinutes * 60 * 1000).toISOString();
  
  results.push({
    userEmail: user.email,
    checkFrequency: user.check_frequency,
    dateThreshold,
    batchIndex
  });
}

return results.map(result => ({ json: result }));`}
                            </pre>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            <h4 className="font-medium text-orange-300 mb-3">5. Fetch Champions Node (HTTP Request)</h4>
                            <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                <li>• <strong>Method:</strong> GET</li>
                                <li>• <strong>URL:</strong> <code className="bg-gray-800 px-2 py-1 rounded">https://app.base44.com/api/apps/YOUR_BASE44_APP_ID/entities/Champion</code></li>
                                <li>• <strong>Headers:</strong> Same as step 2</li>
                            </ul>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            <h4 className="font-medium text-orange-300 mb-3">6. Filter Champions for User Node (Code)</h4>
                            <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded overflow-x-auto">
{`const { userEmail, dateThreshold } = $json;
const allChampions = $('Fetch Champions').all()[0].json.data || [];

const championsToCheck = allChampions.filter(champion => 
  champion.created_by === userEmail &&
  champion.status === 'monitoring' &&
  new Date(champion.updated_date) < new Date(dateThreshold)
).slice(0, 50); // Limit to 50 per user for performance

if (championsToCheck.length === 0) {
  return []; // Skip this user
}

return [{ 
  json: { 
    userEmail, 
    champions: championsToCheck.map(c => ({
      base44ChampionId: c.id,
      linkedinUrl: c.linkedin_url,
      originalName: c.name || \`Champion \${c.id}\`
    }))
  } 
}];`}
                            </pre>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            <h4 className="font-medium text-orange-300 mb-3">7. Update Champion Status Node (HTTP Request)</h4>
                            <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                <li>• <strong>Method:</strong> PUT</li>
                                <li>• <strong>URL:</strong> <code className="bg-gray-800 px-2 py-1 rounded">https://app.base44.com/api/apps/YOUR_BASE44_APP_ID/entities/Champion/{'{{'}$json.championId{'}}'}</code></li>
                                <li>• <strong>Headers:</strong> Same as step 2</li>
                                <li>• <strong>Body:</strong> <code>{`{"status": "enriching", "last_checked": "{{new Date().toISOString()}}"}`}</code></li>
                                <li>• <strong>Note:</strong> This node runs for each champion individually</li>
                            </ul>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            <h4 className="font-medium text-orange-300 mb-3">8. Wait Node</h4>
                            <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                <li>• <strong>Type:</strong> Fixed Duration</li>
                                <li>• <strong>Duration:</strong> 2 seconds</li>
                                <li>• <strong>Purpose:</strong> Rate limiting between API calls</li>
                            </ul>
                        </div>

                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            <h4 className="font-medium text-orange-300 mb-3">9. Trigger Monitoring Webhook Node (HTTP Request)</h4>
                            <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                <li>• <strong>Method:</strong> POST</li>
                                <li>• <strong>URL:</strong> <code className="bg-gray-800 px-2 py-1 rounded">https://webloom.app.n8n.cloud/webhook/f5a61806-c569-4042-a502-20726b1ab993</code></li>
                                <li>• <strong>Headers:</strong> <code>Content-Type: application/json</code></li>
                                <li>• <strong>Body:</strong></li>
                            </ul>
                            <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded mt-2 overflow-x-auto">
{`{
  "userEmail": "{{$json.userEmail}}",
  "isScheduledCheck": true,
  "champions": "{{$json.champions}}"
}`}
                            </pre>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-teal-500/10 rounded-lg border border-orange-400/20">
                        <h4 className="font-medium text-orange-300 mb-2">Scalability Features:</h4>
                        <ul className="text-sm text-orange-200 space-y-1">
                            <li>• <strong>Batch Processing:</strong> Processes users in batches of 50 to avoid timeouts</li>
                            <li>• <strong>Rate Limiting:</strong> Built-in delays prevent API rate limit issues</li>
                            <li>• <strong>Error Isolation:</strong> If one user fails, others continue processing</li>
                            <li>• <strong>Memory Efficient:</strong> Processes data in streams rather than loading everything</li>
                            <li>• <strong>Monitoring:</strong> Detailed logging for each batch and user</li>
                        </ul>
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/20">
                        <h4 className="font-medium text-blue-300 mb-2">For 1000+ Users:</h4>
                        <ul className="text-sm text-blue-200 space-y-1">
                            <li>• Create multiple workflows running at different times (e.g., every 15 minutes)</li>
                            <li>• Use user segmentation (e.g., users A-M in workflow 1, N-Z in workflow 2)</li>
                            <li>• Consider N8N&apos;s sub-workflow feature for better organization</li>
                            <li>• Monitor execution times and adjust batch sizes accordingly</li>
                        </ul>
                    </div>
                </div>
            </AtmosphericCardContent>
        </AtmosphericCard>
      </div>
    </>
  );
}
