/*
# Seed Data: Categories, Locations, and Sample Items

## Overview
Populates the database with:
1. **Categories** - 8 common campus item categories
2. **Locations** - 10 common campus locations
3. **Sample Items** - A few example lost/found items for demo purposes

## Notes
- Uses ON CONFLICT DO NOTHING for idempotency
- Sample items reference the seeded categories and locations
*/

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, icon, description, sort_order) VALUES
  ('Electronics', 'Smartphone', 'Phones, laptops, tablets, chargers, headphones', 1),
  ('Clothing & Accessories', 'Shirt', 'Jackets, bags, jewelry, watches, umbrellas', 2),
  ('Books & Stationery', 'BookOpen', 'Textbooks, notebooks, pens, calculators', 3),
  ('Keys & Cards', 'Key', 'Keycards, keys, ID cards, access badges', 4),
  ('Wallets & Purses', 'Wallet', 'Wallets, purses, coin pouches', 5),
  ('Bags & Backpacks', 'Briefcase', 'Backpacks, tote bags, luggage', 6),
  ('Sports Equipment', 'Dumbbell', 'Gym gear, sports balls, equipment', 7),
  ('Other', 'Package', 'Miscellaneous items', 8)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- LOCATIONS
-- ============================================================
INSERT INTO locations (name, building, floor, description, sort_order) VALUES
  ('Main Library', 'Library Building', '1st Floor', 'Central campus library study area', 1),
  ('Science Building', 'Science Block', 'Various', 'Lecture halls and labs', 2),
  ('Student Cafeteria', 'Student Center', 'Ground Floor', 'Main dining hall', 3),
  ('Gymnasium', 'Sports Complex', '1st Floor', 'Indoor sports and fitness center', 4),
  ('Lecture Hall A', 'Academic Block A', '2nd Floor', 'Large lecture theater', 5),
  ('Computer Lab', 'IT Building', '3rd Floor', 'Open access computer lab', 6),
  ('Campus Bus Stop', 'Outside', 'Ground', 'Main campus bus terminal', 7),
  ('Student Lounge', 'Student Center', '2nd Floor', 'Relaxation and study lounge', 8),
  ('Auditorium', 'Arts Building', 'Ground Floor', 'Main event auditorium', 9),
  ('Parking Lot B', 'Outside', 'Ground', 'Student parking area', 10)
ON CONFLICT (name) DO NOTHING;