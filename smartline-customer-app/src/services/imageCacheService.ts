import AsyncStorage from '@react-native-async-storage/async-storage';
import { PromoBanner } from './bannerService';

const BANNER_CACHE_KEY = 'banner_images_cache';
const BANNER_METADATA_KEY = 'banner_metadata_cache';

interface CachedBannerMetadata {
  id: string;
  image_url: string;
  updated_at: string;
  cached_at: number;
}

export async function getCachedBanners(): Promise<PromoBanner[] | null> {
  try {
    const cached = await AsyncStorage.getItem(BANNER_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.log('Error reading cached banners:', error);
    return null;
  }
}

export async function getBannerMetadata(): Promise<CachedBannerMetadata[]> {
  try {
    const metadata = await AsyncStorage.getItem(BANNER_METADATA_KEY);
    return metadata ? JSON.parse(metadata) : [];
  } catch (error) {
    console.log('Error reading banner metadata:', error);
    return [];
  }
}

export async function cacheBanners(banners: PromoBanner[]): Promise<void> {
  try {
    await AsyncStorage.setItem(BANNER_CACHE_KEY, JSON.stringify(banners));
    
    const metadata: CachedBannerMetadata[] = banners.map(banner => ({
      id: banner.id,
      image_url: banner.image_url || '',
      updated_at: banner.updated_at,
      cached_at: Date.now()
    }));
    
    await AsyncStorage.setItem(BANNER_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.log('Error caching banners:', error);
  }
}

export async function isBannerCacheValid(newBanners: PromoBanner[]): Promise<boolean> {
  try {
    const metadata = await getBannerMetadata();
    
    if (metadata.length === 0) return false;
    if (metadata.length !== newBanners.length) return false;
    
    for (const newBanner of newBanners) {
      const cachedMeta = metadata.find(m => m.id === newBanner.id);
      if (!cachedMeta || cachedMeta.updated_at !== newBanner.updated_at) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log('Error validating banner cache:', error);
    return false;
  }
}

export async function clearBannerCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([BANNER_CACHE_KEY, BANNER_METADATA_KEY]);
  } catch (error) {
    console.log('Error clearing banner cache:', error);
  }
}
