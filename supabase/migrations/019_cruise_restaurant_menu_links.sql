-- Migration: 019_cruise_restaurant_menu_links.sql
-- Adds menu_links JSONB column to cruise_restaurants and populates
-- Virgin Voyages Resilient Lady menus sourced from vvinsider.com.
-- Format: [{label: string, url: string}]

ALTER TABLE cruise_restaurants
  ADD COLUMN IF NOT EXISTS menu_links jsonb DEFAULT NULL;

-- The Wake
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Brunch Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=VV-Insider-The-Wake-Brunch-food-Menu.pdf&nocache=1&ezdev=1"},
  {"label": "View Brunch Drinks (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Bottomless-Brunch-The-Wake-Drinks-Menu.pdf"},
  {"label": "View Dinner Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=the-wake-follow-vvinsider.pdf&nocache=1&ezdev=1"},
  {"label": "View Dinner Drinks (PDF)", "url": "https://vvinsider.com/file-viewer/?file=The-Wake-Drink-Menu-visit-vvinsider.pdf&nocache=1&ezdev=1"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000001';

-- Extra Virgin
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Dinner Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Extra+Virgin+-+Dinner+Menu+-+Resilient+Lady.pdf"},
  {"label": "View Drinks Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Extra+Virgin+-+Drinks+Menu.pdf"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000002';

-- Pink Agave
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Dinner Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Pink+Agave+-+Dinner+Menu.pdf"},
  {"label": "View Drinks Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Pink+Agave+-+Drinks+Menu.pdf"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000003';

-- Gunbae
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Dinner Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Gunbae+-+Dinner+Menu.pdf"},
  {"label": "View Drinks Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Gunbae+-+Drinks+Menu.pdf"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000004';

-- Razzle Dazzle
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Brunch Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=razzle-dazzle-brunch-food-follow-vvinsider.pdf&nocache=1&ezdev=1"},
  {"label": "View Brunch Drinks (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Bottomless-Brunch-Razzle-Dazzle-Drinks-Menu.pdf"},
  {"label": "View Dinner Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Razzle-Dazzle-by-Night-Dinner-Menu.pdf"},
  {"label": "View Dessert Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Razzle-Dazzle-by-Night-Dessert-Menu.pdf"},
  {"label": "View Dinner Drinks (PDF)", "url": "https://vvinsider.com/file-viewer/?file=Razzle-Dazzle-After-Dark-Drinks-Menu-visit-vvinsider.pdf&nocache=1&ezdev=1"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000005';

-- The Test Kitchen (rotating menus A/B/C)
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Menu A (PDF)", "url": "https://vvinsider.com/file-viewer/?file=The+Test+Kitchen+-+Dinner+Menu+A.pdf"},
  {"label": "View Menu B (PDF)", "url": "https://vvinsider.com/file-viewer/?file=The+Test+Kitchen+-+Dinner+Menu+B.pdf"},
  {"label": "View Menu C (PDF)", "url": "https://vvinsider.com/file-viewer/?file=The+Test+Kitchen+-+Dinner+Menu+C.pdf"},
  {"label": "View Drinks Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=The+Test+Kitchen+-+Drinks+Menu.pdf"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000006';

-- The Galley
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Breakfast Menu (PDF)", "url": "https://eatsleepcruise.com/wp-content/uploads/2025/05/VV_The-Galley_Breakfast.pdf"},
  {"label": "View Lunch Menu (PDF)", "url": "https://eatsleepcruise.com/wp-content/uploads/2025/05/VV_The-Galley_Lunch-Updated.pdf"},
  {"label": "View Dinner Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=The+Galley+-+Dinner.pdf"},
  {"label": "View Drinks Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=The-Galley-Drinks-Menu.pdf"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000007';

-- The Pizza Place
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Menu (PDF)", "url": "https://eatsleepcruise.com/wp-content/uploads/2025/05/VV_The_Pizza_Place.pdf"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000008';

-- The Dock House
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Food Menu (PDF)", "url": "https://eatsleepcruise.com/wp-content/uploads/2025/05/VV_The-Dock_Food_Menu.pdf"},
  {"label": "View Drinks Menu (PDF)", "url": "https://vvinsider.com/file-viewer/?file=The+Dock+-+Drinks+Menu.pdf"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000009';

-- Sun Club Café
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Menu (PDF)", "url": "https://eatsleepcruise.com/wp-content/uploads/2025/05/VV_Sun-Club-Cafe-Menu.pdf"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000010';

-- Lick Me Till Ice Cream
UPDATE cruise_restaurants SET menu_links = '[
  {"label": "View Menu (PDF)", "url": "https://eatsleepcruise.com/wp-content/uploads/2021/10/Ice-Cream-Shop-Food-Menu.pdf"}
]'
WHERE id = 'c2b3d4e5-0001-4000-a000-000000000011';
