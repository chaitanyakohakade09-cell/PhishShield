import { Settings as SettingsIcon, Volume2, VolumeX, Gauge, MousePointerClick, Trash2, Info } from 'lucide-react';
import { usePhishShield } from '@/context/PhishShieldContext';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings, clearHistory, totalScans } = usePhishShield();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-5 h-5 text-primary" />
        <h1 className="font-mono text-lg font-bold text-foreground">SETTINGS</h1>
      </div>

      <div className="space-y-3">
        {/* Auto-scan */}
        <div className="rounded-xl border border-border bg-card/50 glass p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MousePointerClick className="w-4 h-4 text-accent" />
            <div>
              <p className="font-mono text-sm text-foreground font-medium">Auto-scan on link click</p>
              <p className="font-mono text-[10px] text-muted-foreground">Intercept and analyze links before navigating</p>
            </div>
          </div>
          <Switch checked={settings.autoScan} onCheckedChange={v => updateSetting('autoScan', v)} />
        </div>

        {/* Notification sounds */}
        <div className="rounded-xl border border-border bg-card/50 glass p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.notificationSounds ? <Volume2 className="w-4 h-4 text-accent" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
            <div>
              <p className="font-mono text-sm text-foreground font-medium">Notification sounds</p>
              <p className="font-mono text-[10px] text-muted-foreground">Play sounds on scan results</p>
            </div>
          </div>
          <Switch checked={settings.notificationSounds} onCheckedChange={v => updateSetting('notificationSounds', v)} />
        </div>

        {/* Sensitivity */}
        <div className="rounded-xl border border-border bg-card/50 glass p-5">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-4 h-4 text-accent" />
            <div>
              <p className="font-mono text-sm text-foreground font-medium">Sensitivity</p>
              <p className="font-mono text-[10px] text-muted-foreground">Adjust scoring threshold multiplier</p>
            </div>
            <span className="ml-auto font-mono text-sm text-primary font-bold">{settings.sensitivity.toFixed(1)}x</span>
          </div>
          <Slider
            value={[settings.sensitivity]}
            onValueChange={([v]) => updateSetting('sensitivity', v)}
            min={0.5}
            max={2.0}
            step={0.1}
          />
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-muted-foreground">Lenient</span>
            <span className="font-mono text-[9px] text-muted-foreground">Strict</span>
          </div>
        </div>

        {/* Clear history */}
        <div className="rounded-xl border border-border bg-card/50 glass p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trash2 className="w-4 h-4 text-destructive" />
            <div>
              <p className="font-mono text-sm text-foreground font-medium">Clear all history</p>
              <p className="font-mono text-[10px] text-muted-foreground">{totalScans} scans stored</p>
            </div>
          </div>
          <button
            onClick={clearHistory}
            className="font-mono text-xs px-3 py-1.5 rounded-md border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Reset settings */}
        <button
          onClick={resetSettings}
          className="w-full font-mono text-xs py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          Reset All Settings to Default
        </button>
      </div>

      {/* About */}
      <div className="rounded-xl border border-border bg-card/50 glass p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-accent" />
          <h2 className="font-mono text-xs font-bold text-foreground">ABOUT</h2>
        </div>
        <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
          <p>PhishShield AI v2.0</p>
          <p>Client-side URL threat detection</p>
          <p>No data sent to external servers</p>
          <p>All analysis performed locally in your browser</p>
        </div>
      </div>
    </div>
  );
}
