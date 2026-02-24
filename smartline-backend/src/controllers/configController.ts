import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { compareVersions } from '../utils/semver';

export const getFeatures = async (req: Request, res: Response) => {
    try {
        // Simple feature toggle using environment variables + defaults
        const features = {
            honeycomb_enabled: process.env.HONEYCOMB_ENABLED === 'true',
            // Add other features here if needed
        };

        res.json(features);
    } catch (error: any) {
        console.error('Error fetching feature flags:', error);
        // Fail-safe: OFF if error
        res.status(500).json({ honeycomb_enabled: false });
    }
};

export const checkAppVersion = async (req: Request, res: Response) => {
    try {
        const platform = (req.query.platform as string)?.toLowerCase();
        const app = (req.query.app as string)?.toLowerCase();
        const version = req.query.version as string;

        if (!platform || !['android', 'ios'].includes(platform)) {
            return res.status(400).json({ error: 'platform must be android or ios' });
        }
        if (!app || !['customer', 'driver'].includes(app)) {
            return res.status(400).json({ error: 'app must be customer or driver' });
        }
        if (!version) {
            return res.status(400).json({ error: 'version query param is required' });
        }

        const { data, error } = await supabase
            .from('app_version_policy')
            .select('*')
            .eq('platform', platform)
            .eq('app', app)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('[VersionCheck] Supabase error', error);
            return res.status(500).json({ error: 'Failed to fetch version policy' });
        }

        if (!data) {
            // No policy configured; allow app to proceed
            return res.json({ action: 'ok' });
        }

        const forceComparison = compareVersions(version, data.min_supported_version);
        if (forceComparison < 0) {
            return res.json({
                action: 'force_update',
                message: data.force_message,
                store_url: data.store_url,
            });
        }

        const recommendComparison = compareVersions(version, data.recommended_version);
        if (recommendComparison < 0) {
            return res.json({
                action: 'recommend_update',
                message: data.optional_message,
                store_url: data.store_url,
            });
        }

        return res.json({ action: 'ok' });
    } catch (error) {
        console.error('[VersionCheck] Unexpected error', error);
        return res.status(500).json({ action: 'ok' });
    }
};
