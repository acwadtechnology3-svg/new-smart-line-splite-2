import { useQuery } from '@tanstack/react-query';
import { honeycombService, SurgeZone } from '../services/honeycombService';

export const useHoneycomb = () => {
    // 1. Fetch Feature Toggle Configuration
    const { data: config, isLoading: isConfigLoading } = useQuery({
        queryKey: ['honeycombConfig'],
        queryFn: honeycombService.fetchFeatureConfig,
        staleTime: 1000 * 60 * 15, // Cache for 15 minutes as per requirements
        retry: 2,
    });

    const isEnabled = config?.honeycomb_enabled ?? false;

    // 2. Fetch Zones (Only if Enabled)
    const { data: zones, isLoading: isZonesLoading, error, refetch } = useQuery({
        queryKey: ['honeycombZones'],
        queryFn: honeycombService.fetchActiveZones,
        enabled: isEnabled, // Dependent Query
        refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
        staleTime: 1000 * 60 * 1, // 1 minute
    });

    return {
        isEnabled,
        zones: zones || [],
        isLoading: isConfigLoading || (isEnabled && isZonesLoading),
        error,
        refetch
    };
};
