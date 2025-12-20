-- =====================================================
-- Trimurti Real Estate - Buildings Seed Data
-- =====================================================
-- Run this in Supabase SQL Editor to populate initial buildings
--
-- This includes:
-- - MHADA 7-Storey Buildings (Sectors 1-8)
-- - MHADA Towers
-- - Popular Private Buildings
-- =====================================================

-- Clear existing buildings (optional - remove if you want to keep existing data)
-- DELETE FROM buildings;

-- =====================================================
-- MHADA 7-STOREY BUILDINGS
-- =====================================================
-- These are the 53 seven-storied buildings in the MHADA complex
-- Organized by sectors, each sector has 6-7 buildings

-- Sector 1 Buildings
INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('Building 1', 'mhada_7_storey', 'Sector 1, MHADA Complex, Kandivali West', 7, 1985, 19.2095, 72.8347),
('Building 2', 'mhada_7_storey', 'Sector 1, MHADA Complex, Kandivali West', 7, 1985, 19.2097, 72.8349),
('Building 3', 'mhada_7_storey', 'Sector 1, MHADA Complex, Kandivali West', 7, 1985, 19.2099, 72.8351),
('Building 4', 'mhada_7_storey', 'Sector 1, MHADA Complex, Kandivali West', 7, 1985, 19.2101, 72.8353),
('Building 5', 'mhada_7_storey', 'Sector 1, MHADA Complex, Kandivali West', 7, 1985, 19.2103, 72.8355),
('Building 6', 'mhada_7_storey', 'Sector 1, MHADA Complex, Kandivali West', 7, 1985, 19.2105, 72.8357),
('Building 7', 'mhada_7_storey', 'Sector 1, MHADA Complex, Kandivali West', 7, 1986, 19.2107, 72.8359);

-- Sector 2 Buildings
INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('Building 8', 'mhada_7_storey', 'Sector 2, MHADA Complex, Kandivali West', 7, 1986, 19.2080, 72.8340),
('Building 9', 'mhada_7_storey', 'Sector 2, MHADA Complex, Kandivali West', 7, 1986, 19.2082, 72.8342),
('Building 10', 'mhada_7_storey', 'Sector 2, MHADA Complex, Kandivali West', 7, 1986, 19.2084, 72.8344),
('Building 11', 'mhada_7_storey', 'Sector 2, MHADA Complex, Kandivali West', 7, 1986, 19.2086, 72.8346),
('Building 12', 'mhada_7_storey', 'Sector 2, MHADA Complex, Kandivali West', 7, 1986, 19.2088, 72.8348),
('Building 13', 'mhada_7_storey', 'Sector 2, MHADA Complex, Kandivali West', 7, 1986, 19.2090, 72.8350),
('Building 14', 'mhada_7_storey', 'Sector 2, MHADA Complex, Kandivali West', 7, 1987, 19.2092, 72.8352);

-- Sector 3 Buildings
INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('Building 15', 'mhada_7_storey', 'Sector 3, MHADA Complex, Kandivali West', 7, 1987, 19.2110, 72.8335),
('Building 16', 'mhada_7_storey', 'Sector 3, MHADA Complex, Kandivali West', 7, 1987, 19.2112, 72.8337),
('Building 17', 'mhada_7_storey', 'Sector 3, MHADA Complex, Kandivali West', 7, 1987, 19.2114, 72.8339),
('Building 18', 'mhada_7_storey', 'Sector 3, MHADA Complex, Kandivali West', 7, 1987, 19.2116, 72.8341),
('Building 19', 'mhada_7_storey', 'Sector 3, MHADA Complex, Kandivali West', 7, 1987, 19.2118, 72.8343),
('Building 20', 'mhada_7_storey', 'Sector 3, MHADA Complex, Kandivali West', 7, 1988, 19.2120, 72.8345);

-- Sector 4 Buildings
INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('Building 21', 'mhada_7_storey', 'Sector 4, MHADA Complex, Kandivali West', 7, 1988, 19.2070, 72.8360),
('Building 22', 'mhada_7_storey', 'Sector 4, MHADA Complex, Kandivali West', 7, 1988, 19.2072, 72.8362),
('Building 23', 'mhada_7_storey', 'Sector 4, MHADA Complex, Kandivali West', 7, 1988, 19.2074, 72.8364),
('Building 24', 'mhada_7_storey', 'Sector 4, MHADA Complex, Kandivali West', 7, 1988, 19.2076, 72.8366),
('Building 25', 'mhada_7_storey', 'Sector 4, MHADA Complex, Kandivali West', 7, 1988, 19.2078, 72.8368),
('Building 26', 'mhada_7_storey', 'Sector 4, MHADA Complex, Kandivali West', 7, 1989, 19.2080, 72.8370),
('Building 27', 'mhada_7_storey', 'Sector 4, MHADA Complex, Kandivali West', 7, 1989, 19.2082, 72.8372);

-- Sector 5 Buildings
INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('Building 28', 'mhada_7_storey', 'Sector 5, MHADA Complex, Kandivali West', 7, 1989, 19.2125, 72.8320),
('Building 29', 'mhada_7_storey', 'Sector 5, MHADA Complex, Kandivali West', 7, 1989, 19.2127, 72.8322),
('Building 30', 'mhada_7_storey', 'Sector 5, MHADA Complex, Kandivali West', 7, 1989, 19.2129, 72.8324),
('Building 31', 'mhada_7_storey', 'Sector 5, MHADA Complex, Kandivali West', 7, 1990, 19.2131, 72.8326),
('Building 32', 'mhada_7_storey', 'Sector 5, MHADA Complex, Kandivali West', 7, 1990, 19.2133, 72.8328),
('Building 33', 'mhada_7_storey', 'Sector 5, MHADA Complex, Kandivali West', 7, 1990, 19.2135, 72.8330);

-- Sector 6 Buildings
INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('Building 34', 'mhada_7_storey', 'Sector 6, MHADA Complex, Kandivali West', 7, 1990, 19.2060, 72.8315),
('Building 35', 'mhada_7_storey', 'Sector 6, MHADA Complex, Kandivali West', 7, 1990, 19.2062, 72.8317),
('Building 36', 'mhada_7_storey', 'Sector 6, MHADA Complex, Kandivali West', 7, 1990, 19.2064, 72.8319),
('Building 37', 'mhada_7_storey', 'Sector 6, MHADA Complex, Kandivali West', 7, 1991, 19.2066, 72.8321),
('Building 38', 'mhada_7_storey', 'Sector 6, MHADA Complex, Kandivali West', 7, 1991, 19.2068, 72.8323),
('Building 39', 'mhada_7_storey', 'Sector 6, MHADA Complex, Kandivali West', 7, 1991, 19.2070, 72.8325),
('Building 40', 'mhada_7_storey', 'Sector 6, MHADA Complex, Kandivali West', 7, 1991, 19.2072, 72.8327);

-- Sector 7 Buildings
INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('Building 41', 'mhada_7_storey', 'Sector 7, MHADA Complex, Kandivali West', 7, 1991, 19.2140, 72.8310),
('Building 42', 'mhada_7_storey', 'Sector 7, MHADA Complex, Kandivali West', 7, 1992, 19.2142, 72.8312),
('Building 43', 'mhada_7_storey', 'Sector 7, MHADA Complex, Kandivali West', 7, 1992, 19.2144, 72.8314),
('Building 44', 'mhada_7_storey', 'Sector 7, MHADA Complex, Kandivali West', 7, 1992, 19.2146, 72.8316),
('Building 45', 'mhada_7_storey', 'Sector 7, MHADA Complex, Kandivali West', 7, 1992, 19.2148, 72.8318),
('Building 46', 'mhada_7_storey', 'Sector 7, MHADA Complex, Kandivali West', 7, 1992, 19.2150, 72.8320);

-- Sector 8 Buildings
INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('Building 47', 'mhada_7_storey', 'Sector 8, MHADA Complex, Kandivali West', 7, 1993, 19.2050, 72.8375),
('Building 48', 'mhada_7_storey', 'Sector 8, MHADA Complex, Kandivali West', 7, 1993, 19.2052, 72.8377),
('Building 49', 'mhada_7_storey', 'Sector 8, MHADA Complex, Kandivali West', 7, 1993, 19.2054, 72.8379),
('Building 50', 'mhada_7_storey', 'Sector 8, MHADA Complex, Kandivali West', 7, 1993, 19.2056, 72.8381),
('Building 51', 'mhada_7_storey', 'Sector 8, MHADA Complex, Kandivali West', 7, 1994, 19.2058, 72.8383),
('Building 52', 'mhada_7_storey', 'Sector 8, MHADA Complex, Kandivali West', 7, 1994, 19.2060, 72.8385),
('Building 53', 'mhada_7_storey', 'Sector 8, MHADA Complex, Kandivali West', 7, 1994, 19.2062, 72.8387);

-- =====================================================
-- MHADA TOWERS (24-storey buildings)
-- =====================================================

INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('Tower A', 'mhada_tower', 'MHADA Colony, Kandivali West', 24, 2005, 19.2088, 72.8340),
('Tower B', 'mhada_tower', 'MHADA Colony, Kandivali West', 24, 2005, 19.2090, 72.8342),
('Tower C', 'mhada_tower', 'MHADA Colony, Kandivali West', 24, 2006, 19.2092, 72.8344),
('Tower D', 'mhada_tower', 'MHADA Colony, Kandivali West', 24, 2006, 19.2094, 72.8346),
('Tower E', 'mhada_tower', 'MHADA Colony, Kandivali West', 24, 2007, 19.2096, 72.8348),
('Tower F', 'mhada_tower', 'MHADA Colony, Kandivali West', 24, 2007, 19.2098, 72.8350);

-- =====================================================
-- PRIVATE BUILDINGS
-- =====================================================

INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('Bhoomi Park', 'private', 'Bhoomi Park Complex, Mahavir Nagar, Kandivali West', 15, 2010, 19.2070, 72.8330),
('Marina Enclave', 'private', 'Marina Enclave, Near Charkop, Kandivali West', 12, 2008, 19.2065, 72.8325),
('Dotam Complex', 'private', 'Dotam Building, Mahavir Nagar, Kandivali West', 10, 2012, 19.2060, 72.8320),
('Horizon Heights', 'private', 'Horizon Heights, S.V. Road, Kandivali West', 18, 2015, 19.2055, 72.8315),
('Skyline Towers', 'private', 'Skyline Towers, Near Station, Kandivali West', 20, 2018, 19.2045, 72.8305),
('Green Valley', 'private', 'Green Valley Complex, Mahavir Nagar, Kandivali West', 14, 2014, 19.2040, 72.8300),
('Royal Residency', 'private', 'Royal Residency, Charkop, Kandivali West', 16, 2016, 19.2035, 72.8295),
('Palm Springs', 'private', 'Palm Springs, Near MHADA, Kandivali West', 12, 2011, 19.2030, 72.8290);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify the seed was successful:
-- SELECT type, COUNT(*) as count FROM buildings GROUP BY type ORDER BY type;

-- Expected output:
-- mhada_7_storey | 53
-- mhada_tower    | 6
-- private        | 8
-- Total: 67 buildings
