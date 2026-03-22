import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-sm font-medium">
              {profile?.full_name || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <Badge variant="secondary" className="capitalize">
              {profile?.subscription_status ?? "free"}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Member since</p>
            <p className="text-sm font-medium">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
