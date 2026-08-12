-- GDX Earth Intelligence — core schema
-- Run against a PostgreSQL database with the PostGIS extension enabled.

CREATE EXTENSION IF NOT EXISTS postgis;

-- An area of interest a user has drawn/saved on the map.
CREATE TABLE IF NOT EXISTS areas_of_interest (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    geom         GEOMETRY(Polygon, 4326) NOT NULL,
    area_km2     DOUBLE PRECISION NOT NULL,
    created_by   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS areas_of_interest_geom_idx
    ON areas_of_interest USING GIST (geom);

-- One row per analysis run against an AOI (mock or real).
CREATE TABLE IF NOT EXISTS analyses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aoi_id              UUID NOT NULL REFERENCES areas_of_interest (id) ON DELETE CASCADE,
    image_date          DATE NOT NULL,
    cloud_cover_pct     DOUBLE PRECISION,
    ndvi                DOUBLE PRECISION,
    ndwi                DOUBLE PRECISION,
    flood_extent_pct    DOUBLE PRECISION,
    built_up_pct        DOUBLE PRECISION,
    change_since_last_pct DOUBLE PRECISION,
    source              TEXT NOT NULL DEFAULT 'mock', -- 'mock' | 'sentinel-2' | 'sentinel-1' | 'landsat'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analyses_aoi_id_idx ON analyses (aoi_id);
CREATE INDEX IF NOT EXISTS analyses_image_date_idx ON analyses (image_date);

-- Metadata for satellite scenes retrieved from CDSE, so repeat requests
-- for the same AOI/date don't re-query or re-download unnecessarily.
CREATE TABLE IF NOT EXISTS imagery_metadata (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider       TEXT NOT NULL, -- 'sentinel-2' | 'sentinel-1' | 'landsat'
    scene_id       TEXT NOT NULL,
    footprint      GEOMETRY(Polygon, 4326) NOT NULL,
    acquired_at    TIMESTAMPTZ NOT NULL,
    cloud_cover_pct DOUBLE PRECISION,
    bands_fetched  TEXT[],
    storage_uri    TEXT, -- where cached bands/derived products live
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, scene_id)
);

CREATE INDEX IF NOT EXISTS imagery_metadata_footprint_idx
    ON imagery_metadata USING GIST (footprint);
CREATE INDEX IF NOT EXISTS imagery_metadata_acquired_at_idx
    ON imagery_metadata (acquired_at);
