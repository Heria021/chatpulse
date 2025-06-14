"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { MoreVertical, Flag, Shield, Loader2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import { getSessionToken } from "@/lib/utils/auth";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

// Helper function to generate avatar initials
function getAvatarInitials(username: string): string {
  return username
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface UserOptionsMenuProps {
  userId: Id<"users">;
  username: string;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
  onUserBlocked?: () => void;
  onUserReported?: () => void;
}

export function UserOptionsMenu({ 
  userId, 
  username, 
  triggerClassName = "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
  align = "end",
  onUserBlocked,
  onUserReported
}: UserOptionsMenuProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [reportReason, setReportReason] = useState<"spam" | "harassment" | "inappropriate_content" | "fake_profile" | "underage" | "other" | "">("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportStep, setReportStep] = useState<"reason" | "details" | "confirm">("reason");

  // Get session token for API calls
  const sessionToken = getSessionToken();

  // Report and block mutations
  const reportUserMutation = useMutation(api.users.reportUser);
  const blockUserMutation = useMutation(api.users.blockUser);

  const handleReportUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReportStep("reason");
    setReportReason("");
    setReportDescription("");
    setReportDialogOpen(true);
  };

  const handleBlockUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBlockConfirmOpen(true);
  };

  const resetReportDialog = () => {
    setReportDialogOpen(false);
    setReportReason("");
    setReportDescription("");
    setReportStep("reason");
  };

  const handleNextStep = () => {
    if (reportStep === "reason" && reportReason) {
      setReportStep("details");
    } else if (reportStep === "details") {
      setReportStep("confirm");
    }
  };

  const handlePrevStep = () => {
    if (reportStep === "details") {
      setReportStep("reason");
    } else if (reportStep === "confirm") {
      setReportStep("details");
    }
  };

  const handleSubmitReport = async () => {
    if (!sessionToken || !reportReason.trim()) return;

    try {
      setIsSubmitting(true);
      await reportUserMutation({
        sessionToken,
        reportedUserId: userId,
        reason: reportReason as "spam" | "harassment" | "inappropriate_content" | "fake_profile" | "underage" | "other",
        description: reportDescription
      });
      toast.success(`Thank you for your report. ${username} has been reported and blocked.`);
      resetReportDialog();
      onUserReported?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to report user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmBlockUser = async () => {
    if (!sessionToken) return;

    try {
      setIsSubmitting(true);
      await blockUserMutation({
        sessionToken,
        blockedUserId: userId,
        reason: "Blocked by user"
      });
      toast.success(`${username} has been blocked`);
      setBlockConfirmOpen(false);
      onUserBlocked?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to block user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={triggerClassName}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          <DropdownMenuItem
            onClick={handleReportUser}
            className="text-orange-600 focus:text-orange-600"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleBlockUser}
            className="text-red-600 focus:text-red-600"
            disabled={isSubmitting}
          >
            <Shield className="h-4 w-4 mr-2" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Enhanced Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={resetReportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Flag className="h-5 w-5 text-orange-600" />
                </div>
                Report User
              </DialogTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className={`w-2 h-2 rounded-full ${reportStep === "reason" ? "bg-orange-500" : "bg-gray-300"}`} />
                <span className={`w-2 h-2 rounded-full ${reportStep === "details" ? "bg-orange-500" : "bg-gray-300"}`} />
                <span className={`w-2 h-2 rounded-full ${reportStep === "confirm" ? "bg-orange-500" : "bg-gray-300"}`} />
              </div>
            </div>
            <DialogDescription className="text-base">
              {reportStep === "reason" && "Why are you reporting this user?"}
              {reportStep === "details" && "Please provide additional details"}
              {reportStep === "confirm" && "Review your report"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Info Card */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-orange-200 text-orange-800">
                      {getAvatarInitials(username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-orange-900">{username}</p>
                    <p className="text-sm text-orange-700">This user will be blocked after reporting</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Reason Selection */}
            {reportStep === "reason" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Select a reason for reporting</Label>
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {[
                      { value: "spam", label: "Spam or unwanted messages", icon: "📧" },
                      { value: "harassment", label: "Harassment or bullying", icon: "⚠️" },
                      { value: "inappropriate_content", label: "Inappropriate content", icon: "🚫" },
                      { value: "fake_profile", label: "Fake or impersonation account", icon: "🎭" },
                      { value: "underage", label: "Underage user", icon: "👶" },
                      { value: "other", label: "Other violation", icon: "❓" }
                    ].map((reason) => (
                      <button
                        key={reason.value}
                        onClick={() => setReportReason(reason.value as typeof reportReason)}
                        className={`p-3 text-left border rounded-lg transition-all hover:border-orange-300 ${
                          reportReason === reason.value
                            ? "border-orange-500 bg-orange-50 text-orange-900"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{reason.icon}</span>
                          <span className="font-medium">{reason.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Additional Details */}
            {reportStep === "details" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-base font-medium">
                    Additional details (optional)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    Help us understand the situation better. This information will be reviewed by our moderation team.
                  </p>
                  <Textarea
                    id="description"
                    placeholder="Describe what happened, when it occurred, or any other relevant details..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {reportDescription.length}/500 characters
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {reportStep === "confirm" && (
              <div className="space-y-4">
                <Alert className="border-orange-200 bg-orange-50">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Before you submit:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• {username} will be immediately blocked</li>
                      <li>• Our moderation team will review this report</li>
                      <li>• False reports may result in account restrictions</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Reason:</span>
                    <span className="capitalize">{reportReason.replace("_", " ")}</span>
                  </div>
                  {reportDescription && (
                    <div>
                      <span className="font-medium">Details:</span>
                      <p className="text-sm text-gray-600 mt-1">{reportDescription}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {reportStep !== "reason" && (
                <Button variant="outline" onClick={handlePrevStep} disabled={isSubmitting}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetReportDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              {reportStep === "confirm" ? (
                <Button
                  onClick={handleSubmitReport}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Flag className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNextStep}
                  disabled={reportStep === "reason" && !reportReason}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Continue
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <Dialog open={blockConfirmOpen} onOpenChange={setBlockConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-full">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              Block User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to block {username}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <Info className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>This will:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Hide this user from your chat lists</li>
                  <li>• Prevent them from sending you messages</li>
                  <li>• Remove them from your active conversations</li>
                  <li>• You can unblock them later in settings</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-red-200 text-red-800">
                  {getAvatarInitials(username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{username}</p>
                <p className="text-sm text-muted-foreground">User will be blocked</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBlockConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBlockUser}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Blocking...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Block User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
