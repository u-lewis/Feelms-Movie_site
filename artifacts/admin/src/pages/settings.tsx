import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Settings, Save, Loader2, Shield, Globe, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface SiteSettings {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  vipMonthlyPrice: number;
  vipYearlyPrice: number;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Feelms",
  siteUrl: "https://feelms.test",
  adminEmail: "admin@feelms.tv",
  maintenanceMode: false,
  allowRegistration: true,
  vipMonthlyPrice: 5000,
  vipYearlyPrice: 50000,
};

export default function SettingsPage() {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setSettings(data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key: keyof SiteSettings, value: any) => setSettings((s) => ({ ...s, [key]: value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="bg-card border border-white/5 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Configure your Feelms platform settings</p>
        </div>
        <button onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium disabled:opacity-60 transition-colors">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <Section title="General" icon={Globe}>
        <Field label="Site Name" desc="The name displayed throughout the platform">
          <input value={settings.siteName} onChange={(e) => set("siteName", e.target.value)}
            className="w-56 px-3 h-9 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </Field>
        <Field label="Site URL" desc="Public-facing URL of the main site">
          <input value={settings.siteUrl} onChange={(e) => set("siteUrl", e.target.value)}
            className="w-56 px-3 h-9 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </Field>
        <Field label="Admin Email" desc="Contact email for admin notifications">
          <input value={settings.adminEmail} onChange={(e) => set("adminEmail", e.target.value)}
            className="w-56 px-3 h-9 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </Field>
      </Section>

      <Section title="Security & Access" icon={Shield}>
        <Field label="Maintenance Mode" desc="Temporarily disable public access to the site">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => set("maintenanceMode", e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </Field>
        <Field label="Allow Registration" desc="Allow new users to create accounts">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.allowRegistration} onChange={(e) => set("allowRegistration", e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </label>
        </Field>
      </Section>

      <Section title="VIP Pricing (RWF)" icon={CreditCard}>
        <Field label="Monthly VIP Price" desc="Price in Rwandan Francs for monthly subscription">
          <input type="number" value={settings.vipMonthlyPrice} onChange={(e) => set("vipMonthlyPrice", Number(e.target.value))}
            className="w-40 px-3 h-9 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </Field>
        <Field label="Yearly VIP Price" desc="Price in Rwandan Francs for yearly subscription">
          <input type="number" value={settings.vipYearlyPrice} onChange={(e) => set("vipYearlyPrice", Number(e.target.value))}
            className="w-40 px-3 h-9 rounded-lg bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </Field>
      </Section>
    </div>
  );
}
