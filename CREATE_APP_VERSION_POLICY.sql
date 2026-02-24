CREATE TABLE IF NOT EXISTS app_version_policy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
    app TEXT NOT NULL CHECK (app IN ('customer', 'driver')),
    min_supported_version TEXT NOT NULL DEFAULT '1.0.0',
    recommended_version TEXT NOT NULL DEFAULT '1.0.0',
    force_message TEXT DEFAULT 'This version is no longer supported. Please update to continue.',
    optional_message TEXT DEFAULT 'A new version is available with improvements and bug fixes.',
    store_url TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(platform, app)
);

INSERT INTO app_version_policy (platform, app, min_supported_version, recommended_version)
VALUES
    ('android', 'customer', '1.0.0', '1.0.0'),
    ('ios', 'customer', '1.0.0', '1.0.0'),
    ('android', 'driver', '1.0.0', '1.0.0'),
    ('ios', 'driver', '1.0.0', '1.0.0')
ON CONFLICT (platform, app) DO NOTHING;
