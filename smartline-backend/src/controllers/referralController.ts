
import { Request, Response } from 'express';
import { ReferralService } from '../services/referralService';
import { supabase } from '../config/supabase';

export const getMyCode = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const code = await ReferralService.getUserReferralCode(userId);
        res.json({ code, link: `https://smartline.app.link/r/${code}` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const enterCode = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { code, channel } = req.body;

        if (!code) return res.status(400).json({ error: 'Code is required' });

        const referral = await ReferralService.applyReferral(userId, code, channel);
        res.json({ success: true, referral });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const stats = await ReferralService.getReferralStats(userId);
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Admin Controllers ---

export const createProgram = async (req: Request, res: Response) => {
    try {
        const { name, user_type, rewards_config, rules_config, start_date, end_date } = req.body;

        const { data, error } = await supabase
            .from('referral_programs')
            .insert({
                name,
                user_type,
                rewards_config,
                rules_config,
                start_date,
                end_date
            })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const getPrograms = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('referral_programs').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
