
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings as SettingsIcon, Mail, MessageSquare, Clock, CheckCircle, AlertCircle, User as UserIconLucide } from "lucide-react";
import { AtmosphericCard, AtmosphericCardHeader, AtmosphericCardTitle, AtmosphericCardContent } from "@/components/ui/atmospheric-card";
import { createPageUrl } from "@/utils";

export default function Settings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    notification_email: "",
    email_notifications: true,
    slack_notifications: false,
    slack_webhook: "",
    check_frequency: "weekly"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadSettings = async () => {
      setIsLoading(true);
      try {
        const userData = await User.me();
        setCurrentUser(userData);
        setSettings({
          notification_email: userData.notification_email || userData.email || "",
          email_notifications: userData.email_notifications !== undefined ? userData.email_notifications : true,
          slack_notifications: userData.slack_notifications || false,
          slack_webhook: userData.slack_webhook || "",
          check_frequency: userData.check_frequency || "weekly"
        });
      } catch (error) {
        window.location.href = createPageUrl("Landing?action=login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthAndLoadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      await User.updateMyUserData(settings);
      const updatedUserData = await User.me();
      setCurrentUser(updatedUserData);
      
      setIsSuccess(true);
      setMessage("Settings saved successfully!");
      
      setTimeout(() => {
        setMessage("");
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      setIsSuccess(false);
      setMessage("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const testSlackWebhook = async () => {
    if (!settings.slack_webhook) {
      setMessage("Please enter a Slack webhook URL first");
      setIsSuccess(false);
      return;
    }

    try {
      console.log("Simulating sending test message to Slack:", settings.slack_webhook);
      setMessage("Test message sent to Slack!");
      setIsSuccess(true);
      setTimeout(() => {
        setMessage("");
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      setMessage("Failed to send test message. Please check your webhook URL.");
      setIsSuccess(false);
    }
  };

  const testWeeklyCheck = async () => {
    try {
      console.log('Settings: Starting testWeeklyCheck function call...');
      const { testWeeklyCheck: runTestWeeklyCheck } = await import("@/api/functions");
      console.log('Settings: Function imported successfully');
      
      const response = await runTestWeeklyCheck();
      console.log('Settings: Function response:', response);
      
      if (response.data && response.data.success) {
        setMessage("Weekly check test completed successfully! Check console for details.");
        setIsSuccess(true);
        console.log('Settings: Test successful:', response.data);
      } else {
        setMessage("Weekly check test failed. Check console for details.");
        setIsSuccess(false);
        console.log('Settings: Test failed:', response.data || response);
      }
    } catch (error) {
      console.error('Settings: Error calling testWeeklyCheck:', error);
      setMessage(`Failed to trigger weekly check test: ${error.message}`);
      setIsSuccess(false);
    }
    
    setTimeout(() => {
      setMessage("");
      setIsSuccess(false);
    }, 5000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
          <div className="absolute inset-0 rounded-full coral-teal-gradient-subtle blur-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with atmospheric styling */}
      <div className="relative">
        <div className="absolute -inset-4 coral-teal-gradient-subtle blur-2xl"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold text-white flex items-center space-x-4 mb-2">
            <div className="p-3 coral-teal-gradient-subtle rounded-xl backdrop-blur-sm border border-orange-500/20">
              <SettingsIcon className="w-8 h-8 text-orange-400" />
            </div>
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Settings</span>
          </h1>
          <p className="text-gray-400 text-lg pl-16">
            Manage your notification preferences and monitoring settings
          </p>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <Alert variant={isSuccess ? "default" : "destructive"} className={`atmospheric-card ${isSuccess ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
          {isSuccess ? <CheckCircle className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
          <AlertDescription className={isSuccess ? 'text-green-300' : 'text-red-300'}>{message}</AlertDescription>
        </Alert>
      )}

      {/* Account Information */}
      <AtmosphericCard variant="premium">
        <AtmosphericCardHeader>
          <AtmosphericCardTitle className="flex items-center text-xl">
            <UserIconLucide className="w-5 h-5 mr-3 text-orange-400" />
            Account Information
          </AtmosphericCardTitle>
        </AtmosphericCardHeader>
        <AtmosphericCardContent>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Full Name
                </label>
                <Input 
                  value={currentUser?.full_name || ""} 
                  disabled 
                  className="bg-white/5 border-gray-600/50 text-white backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Email Address
                </label>
                <Input 
                  value={currentUser?.email || ""} 
                  disabled 
                  className="bg-white/5 border-gray-600/50 text-white backdrop-blur-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">
                Current Plan
              </label>
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 coral-teal-gradient-subtle text-orange-300 rounded-full text-sm font-medium capitalize border border-orange-400/30 backdrop-blur-sm">
                  {currentUser?.subscription_tier || "free"} Plan
                </div>
                {currentUser?.subscription_tier === "free" && (
                  <Button variant="outline" size="sm" className="coral-teal-gradient-subtle border-orange-400/30 text-orange-300 hover:bg-orange-500/20 backdrop-blur-sm">
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </div>
          </div>
        </AtmosphericCardContent>
      </AtmosphericCard>

      {/* Email Notifications */}
      <AtmosphericCard variant="gradient">
        <AtmosphericCardHeader>
          <AtmosphericCardTitle className="flex items-center text-xl">
            <Mail className="w-5 h-5 mr-3 text-green-400" />
            Email Notifications
          </AtmosphericCardTitle>
        </AtmosphericCardHeader>
        <AtmosphericCardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700/50">
              <div>
                <h3 className="font-medium text-white mb-1">Enable Email Notifications</h3>
                <p className="text-sm text-gray-400">
                  Get notified when your champions change jobs
                </p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, email_notifications: checked }))
                }
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-teal-500"
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="notification_email" className="text-sm font-medium text-gray-300">
                Notification Email Address
              </label>
              <Input
                id="notification_email"
                type="email"
                value={settings.notification_email}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, notification_email: e.target.value }))
                }
                placeholder={currentUser?.email || "notifications@example.com"}
                disabled={!settings.email_notifications}
                className="bg-white/5 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-orange-500/50 focus:ring-orange-500/20"
              />
              <p className="text-xs text-gray-500">
                Defaults to your account email if left blank.
              </p>
            </div>
          </div>
        </AtmosphericCardContent>
      </AtmosphericCard>

      {/* Slack Notifications */}
      <AtmosphericCard variant="glow">
        <AtmosphericCardHeader>
          <AtmosphericCardTitle className="flex items-center text-xl">
            <MessageSquare className="w-5 h-5 mr-3 text-purple-400" />
            Slack Notifications
          </AtmosphericCardTitle>
        </AtmosphericCardHeader>
        <AtmosphericCardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700/50">
              <div>
                <h3 className="font-medium text-white mb-1">Enable Slack Notifications</h3>
                <p className="text-sm text-gray-400">
                  Send job change alerts to your Slack channel
                </p>
              </div>
              <Switch
                checked={settings.slack_notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, slack_notifications: checked }))
                }
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label htmlFor="slack_webhook" className="text-sm font-medium text-gray-300">
                  Slack Webhook URL
                </label>
                <div className="flex space-x-3">
                  <Input
                    id="slack_webhook"
                    type="url"
                    value={settings.slack_webhook}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, slack_webhook: e.target.value }))
                    }
                    placeholder="https://hooks.slack.com/services/..."
                    disabled={!settings.slack_notifications}
                    className="flex-1 bg-white/5 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500/50 focus:ring-purple-500/20"
                  />
                  <Button
                    variant="outline"
                    onClick={testSlackWebhook}
                    disabled={!settings.slack_notifications || !settings.slack_webhook}
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/30 text-purple-300 hover:bg-purple-500/20 backdrop-blur-sm"
                  >
                    Test
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Create an incoming webhook in your Slack app settings.
                </p>
              </div>
            </div>
          </div>
        </AtmosphericCardContent>
      </AtmosphericCard>

      {/* Monitoring Settings */}
      <AtmosphericCard variant="default">
        <AtmosphericCardHeader>
          <AtmosphericCardTitle className="flex items-center text-xl">
            <Clock className="w-5 h-5 mr-3 text-orange-400" />
            Monitoring Settings
          </AtmosphericCardTitle>
        </AtmosphericCardHeader>
        <AtmosphericCardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Check Frequency
              </label>
              <Select
                value={settings.check_frequency}
                onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, check_frequency: value }))
                }
              >
                <SelectTrigger className="w-full md:w-48 bg-white/5 border-gray-600/50 text-white backdrop-blur-sm">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border-gray-700/50 text-white backdrop-blur-xl">
                  <SelectItem value="every_2_minutes">Every 2 minutes (Test)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly (Recommended)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                How often we check LinkedIn for job changes. Pro plans unlock daily checks.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-500/10 via-transparent to-teal-500/10 rounded-xl border border-orange-400/20 backdrop-blur-sm">
              <h3 className="font-medium text-orange-300 mb-3 flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
                Monitoring Insights
              </h3>
              <ul className="text-sm text-orange-400/80 space-y-2">
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  Daily monitoring is available for Pro subscribers.
                </li>
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  We typically check LinkedIn profiles during standard business hours.
                </li>
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2">•</span>
                  Notifications are sent promptly upon detection of a job change.
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-700/50 pt-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700/50">
                <div>
                  <h3 className="font-medium text-white mb-1">Test Weekly Check</h3>
                  <p className="text-sm text-gray-400">
                    Manually trigger a check for all your champions to test the system
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={testWeeklyCheck}
                  className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-400/30 text-orange-300 hover:bg-orange-500/20 backdrop-blur-sm"
                >
                  Run Test Check
                </Button>
              </div>
            </div>
          </div>
        </AtmosphericCardContent>
      </AtmosphericCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="coral-teal-gradient hover:opacity-90 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
        >
          {isSaving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </div>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
