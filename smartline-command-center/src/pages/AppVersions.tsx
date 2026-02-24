import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { RefreshCcw, Save } from 'lucide-react';

interface VersionPolicy {
  id: string;
  platform: 'android' | 'ios';
  app: 'customer' | 'driver';
  min_supported_version: string;
  recommended_version: string;
  force_message: string | null;
  optional_message: string | null;
  store_url: string | null;
  is_active: boolean;
  updated_at: string;
}

const DEFAULT_FORCE_MESSAGE = 'This version is no longer supported. Please update to continue.';
const DEFAULT_OPTIONAL_MESSAGE = 'A new version is available with improvements and bug fixes.';

const POLICY_MATRIX: { platform: 'android' | 'ios'; app: 'customer' | 'driver' }[] = [
  { platform: 'android', app: 'customer' },
  { platform: 'ios', app: 'customer' },
  { platform: 'android', app: 'driver' },
  { platform: 'ios', app: 'driver' },
];

export default function AppVersions() {
  const [policies, setPolicies] = useState<VersionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_version_policy')
        .select('*')
        .order('app', { ascending: true })
        .order('platform', { ascending: true });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('[AppVersions] fetch error', error);
      toast.error('Failed to load version policies');
    } finally {
      setLoading(false);
    }
  };

  const groupedPolicies = useMemo(() => {
    return policies.reduce<Record<'customer' | 'driver', VersionPolicy[]>>(
      (acc, policy) => {
        acc[policy.app] = [...acc[policy.app], policy];
        return acc;
      },
      { customer: [], driver: [] }
    );
  }, [policies]);

  const missingPolicies = useMemo(() => {
    const existingKeys = new Set(policies.map((policy) => `${policy.app}-${policy.platform}`));
    return POLICY_MATRIX.filter((combo) => !existingKeys.has(`${combo.app}-${combo.platform}`));
  }, [policies]);

  const seedMissingPolicies = async () => {
    if (missingPolicies.length === 0) {
      toast.info('All policies already exist');
      return;
    }

    try {
      const rows = missingPolicies.map((combo) => ({
        ...combo,
        min_supported_version: '1.0.0',
        recommended_version: '1.0.0',
        force_message: DEFAULT_FORCE_MESSAGE,
        optional_message: DEFAULT_OPTIONAL_MESSAGE,
        store_url: '',
        is_active: true,
      }));

      const { error } = await supabase.from('app_version_policy').insert(rows);
      if (error) throw error;

      toast.success('Default policies created');
      fetchPolicies();
    } catch (error) {
      console.error('[AppVersions] seed error', error);
      toast.error('Failed to create default policies');
    }
  };

  const handleChange = (id: string, field: keyof VersionPolicy, value: string | boolean) => {
    setPolicies((prev) => prev.map((policy) => (policy.id === id ? { ...policy, [field]: value } : policy)));
  };

  const handleSave = async (policy: VersionPolicy) => {
    setSaving(policy.id);
    try {
      const { error } = await supabase
        .from('app_version_policy')
        .update({
          min_supported_version: policy.min_supported_version,
          recommended_version: policy.recommended_version,
          force_message: policy.force_message || DEFAULT_FORCE_MESSAGE,
          optional_message: policy.optional_message || DEFAULT_OPTIONAL_MESSAGE,
          store_url: policy.store_url,
          is_active: policy.is_active,
        })
        .eq('id', policy.id);

      if (error) throw error;
      toast.success(`${policy.app} (${policy.platform}) policy saved`);
    } catch (error) {
      console.error('[AppVersions] save error', error);
      toast.error('Failed to save policy');
    } finally {
      setSaving(null);
    }
  };

  const renderPolicyCard = (policy: VersionPolicy) => (
    <Card key={policy.id} className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold capitalize">
            {policy.platform} · {policy.app}
          </CardTitle>
          <p className="text-sm text-muted-foreground">Last updated {new Date(policy.updated_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Active</Label>
          <Switch
            checked={policy.is_active}
            onCheckedChange={(value) => handleChange(policy.id, 'is_active', value)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Minimum Supported Version</Label>
            <Input
              value={policy.min_supported_version}
              onChange={(e) => handleChange(policy.id, 'min_supported_version', e.target.value)}
              placeholder="e.g. 1.0.0"
            />
          </div>
          <div className="space-y-2">
            <Label>Recommended Version</Label>
            <Input
              value={policy.recommended_version}
              onChange={(e) => handleChange(policy.id, 'recommended_version', e.target.value)}
              placeholder="e.g. 1.0.0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Force Update Message</Label>
          <Input
            value={policy.force_message || ''}
            onChange={(e) => handleChange(policy.id, 'force_message', e.target.value)}
            placeholder={DEFAULT_FORCE_MESSAGE}
          />
        </div>

        <div className="space-y-2">
          <Label>Optional Update Message</Label>
          <Input
            value={policy.optional_message || ''}
            onChange={(e) => handleChange(policy.id, 'optional_message', e.target.value)}
            placeholder={DEFAULT_OPTIONAL_MESSAGE}
          />
        </div>

        <div className="space-y-2">
          <Label>Store URL</Label>
          <Input
            value={policy.store_url || ''}
            onChange={(e) => handleChange(policy.id, 'store_url', e.target.value)}
            placeholder="https://play.google.com/..."
          />
          <p className="text-xs text-muted-foreground">Used for both force and optional update buttons.</p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={fetchPolicies} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => handleSave(policy)} disabled={saving === policy.id}>
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="App Version Control" description="Manage force-update and recommended version policies for both mobile apps.">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">
              Policies are evaluated by the mobile apps on every launch. Force updates block access completely,
              while recommended updates show a dismissible banner.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPolicies} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reload policies
          </Button>
          <Button size="sm" onClick={seedMissingPolicies} disabled={missingPolicies.length === 0}>
            Create default policies
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Loading version policies...</CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="customer" className="w-full">
            <TabsList>
              <TabsTrigger value="customer">Customer App</TabsTrigger>
              <TabsTrigger value="driver">Driver App</TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="space-y-4">
              {groupedPolicies.customer.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground space-y-2">
                    <p>No policies found for customer app.</p>
                    <p className="text-sm">Use "Create default policies" to add the baseline rows.</p>
                  </CardContent>
                </Card>
              )}
              {groupedPolicies.customer.map(renderPolicyCard)}
            </TabsContent>

            <TabsContent value="driver" className="space-y-4">
              {groupedPolicies.driver.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground space-y-2">
                    <p>No policies found for driver app.</p>
                    <p className="text-sm">Use "Create default policies" to add the baseline rows.</p>
                  </CardContent>
                </Card>
              )}
              {groupedPolicies.driver.map(renderPolicyCard)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
