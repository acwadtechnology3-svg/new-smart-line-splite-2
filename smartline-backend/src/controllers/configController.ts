import { Request, Response } from 'express';

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
