/**
 * Authentic project photos supplied by the site owner in Nov 2026.
 * No AI photos, fake dates, unverified city claims, or fake ratings.
 */
export type PhotoStage = "before" | "progress" | "after";
export type ProjectPhoto = { src: string; alt: string; caption?: string; stage: PhotoStage };
export type Project = {
  id: string;
  title: string;
  category: string;
  serviceSlug: string;
  summary: string;
  cover: string;
  photos: ProjectPhoto[];
  featured: boolean;
  detailPage: boolean;
};

export const projects: Project[] = [
  {
    "id": "wood-deck-build",
    "title": "New Wood Deck with Steps and Railings",
    "category": "Decks & Pergolas",
    "serviceSlug": "deck-repair",
    "summary": "A new pressure-treated wood deck with entrance steps and decorative black railing panels. The photo sequence shows the early framing, deck boards, and completed platform.",
    "featured": true,
    "cover": "/projects/wood-deck-build-card.webp",
    "photos": [
      {
        "src": "/projects/wood-deck-build-after.webp",
        "alt": "Finished wood deck with stairs and black metal railing inserts",
        "caption": "Finished wood deck with stairs and black metal railing inserts",
        "stage": "after"
      },
      {
        "src": "/projects/wood-deck-build-progress.webp",
        "alt": "Ground-level frame and prepared site before deck boards",
        "caption": "Ground-level frame and prepared site before deck boards",
        "stage": "progress"
      },
      {
        "src": "/projects/wood-deck-build-progress-3.webp",
        "alt": "Deck boards installed while the railing was still being built",
        "caption": "Deck boards installed while the railing was still being built",
        "stage": "progress"
      }
    ],
    "detailPage": true
  },
  {
    "id": "gray-deck-repair",
    "title": "Deck Surface and Frame Repair",
    "category": "Decks & Pergolas",
    "serviceSlug": "deck-repair",
    "summary": "An outdoor deck repair involving the exposed underlying framing, replacement boards and an updated gray deck surface. See the damaged section and installation stages.",
    "featured": true,
    "cover": "/projects/gray-deck-repair-card.webp",
    "photos": [
      {
        "src": "/projects/gray-deck-repair-after.webp",
        "alt": "Gray outdoor deck with repaired plank surface",
        "caption": "Gray outdoor deck with repaired plank surface",
        "stage": "after"
      },
      {
        "src": "/projects/gray-deck-repair-before.webp",
        "alt": "Damaged deck boards and exposed framing before repairs",
        "caption": "Damaged deck boards and exposed framing before repairs",
        "stage": "before"
      },
      {
        "src": "/projects/gray-deck-repair-progress.webp",
        "alt": "Deck repair with replacement framing and boards underway",
        "caption": "Deck repair with replacement framing and boards underway",
        "stage": "progress"
      }
    ],
    "detailPage": true
  },
  {
    "id": "painted-patio-deck",
    "title": "Freshly Finished Backyard Deck",
    "category": "Decks & Pergolas",
    "serviceSlug": "deck-repair",
    "summary": "A low wood platform beside a backyard structure, shown during installation and after a warm red exterior finish was applied.",
    "featured": true,
    "cover": "/projects/painted-patio-deck-card.webp",
    "photos": [
      {
        "src": "/projects/painted-patio-deck-after.webp",
        "alt": "Freshly finished red-stained backyard wood platform",
        "caption": "Freshly finished red-stained backyard wood platform",
        "stage": "after"
      },
      {
        "src": "/projects/painted-patio-deck-before.webp",
        "alt": "Unfinished wood deck platform before painting or staining",
        "caption": "Unfinished wood deck platform before painting or staining",
        "stage": "before"
      },
      {
        "src": "/projects/painted-patio-deck-progress.webp",
        "alt": "Yard surface next to shed before the deck surface was completed",
        "caption": "Yard surface next to shed before the deck surface was completed",
        "stage": "progress"
      }
    ],
    "detailPage": true
  },
  {
    "id": "wood-pergola-lakeside",
    "title": "Lakeside Wood Pergola",
    "category": "Decks & Pergolas",
    "serviceSlug": "general-handyman-services",
    "summary": "A finished freestanding wood pergola with an overhead slat roof and decorative diagonal braces beside a screened lanai.",
    "featured": true,
    "cover": "/projects/wood-pergola-lakeside-card.webp",
    "photos": [
      {
        "src": "/projects/wood-pergola-lakeside-after.webp",
        "alt": "Finished timber pergola with lattice roof beside a house",
        "caption": "Finished timber pergola with lattice roof beside a house",
        "stage": "after"
      }
    ],
    "detailPage": false
  },
  {
    "id": "modern-backyard-pergola",
    "title": "Modern Pergola over a Patio",
    "category": "Decks & Pergolas",
    "serviceSlug": "general-handyman-services",
    "summary": "A completed pergola with dark posts and a closely spaced slat roof over a backyard patio.",
    "featured": true,
    "cover": "/projects/modern-backyard-pergola-card.webp",
    "photos": [
      {
        "src": "/projects/modern-backyard-pergola-after.webp",
        "alt": "Modern dark wood pergola installed over a concrete patio",
        "caption": "Modern dark wood pergola installed over a concrete patio",
        "stage": "after"
      }
    ],
    "detailPage": false
  },
  {
    "id": "kitchen-cabinet-painting",
    "title": "Kitchen Cabinet Painting",
    "category": "Painting & Flooring",
    "serviceSlug": "interior-painting",
    "summary": "Painted the existing wood kitchen cabinets white. The before and after photos show the cabinet color change while other work in the kitchen was still underway.",
    "featured": true,
    "cover": "/projects/kitchen-cabinet-painting-card.webp",
    "photos": [
      {
        "src": "/projects/kitchen-cabinet-painting-after.webp",
        "alt": "White painted kitchen cabinet fronts during kitchen refinishing",
        "caption": "White painted kitchen cabinet fronts during kitchen refinishing",
        "stage": "after"
      },
      {
        "src": "/projects/kitchen-cabinet-painting-before.webp",
        "alt": "Natural wood kitchen cabinet finish before painting",
        "caption": "Natural wood kitchen cabinet finish before painting",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "lvp-hallway-floor",
    "title": "Vinyl Plank Flooring in a Hallway",
    "category": "Painting & Flooring",
    "serviceSlug": "flooring-installation",
    "summary": "Light wood-look luxury vinyl planks installed through a hallway and into adjacent doorways, showing the installation layout and finished floor.",
    "featured": false,
    "cover": "/projects/lvp-hallway-floor-card.webp",
    "photos": [
      {
        "src": "/projects/lvp-hallway-floor-after.webp",
        "alt": "New light oak-look vinyl plank flooring in hallway",
        "caption": "New light oak-look vinyl plank flooring in hallway",
        "stage": "after"
      },
      {
        "src": "/projects/lvp-hallway-floor-progress.webp",
        "alt": "Hallway vinyl plank flooring being installed",
        "caption": "Hallway vinyl plank flooring being installed",
        "stage": "progress"
      }
    ],
    "detailPage": true
  },
  {
    "id": "bedroom-lvp-floor",
    "title": "Bedroom Plank Flooring Installation",
    "category": "Painting & Flooring",
    "serviceSlug": "flooring-installation",
    "summary": "A bedroom floor transformed from an exposed subfloor to finished wood-look plank flooring. The progress photos capture preparation and finished installation.",
    "featured": true,
    "cover": "/projects/bedroom-lvp-floor-card.webp",
    "photos": [
      {
        "src": "/projects/bedroom-lvp-floor-after.webp",
        "alt": "Bedroom finished with new wood-look vinyl plank floor",
        "caption": "Bedroom finished with new wood-look vinyl plank floor",
        "stage": "after"
      },
      {
        "src": "/projects/bedroom-lvp-floor-before.webp",
        "alt": "Bedroom subfloor exposed before vinyl plank installation",
        "caption": "Bedroom subfloor exposed before vinyl plank installation",
        "stage": "before"
      },
      {
        "src": "/projects/bedroom-lvp-floor-progress.webp",
        "alt": "Bedroom with flooring removed and work supplies in place",
        "caption": "Bedroom with flooring removed and work supplies in place",
        "stage": "progress"
      }
    ],
    "detailPage": true
  },
  {
    "id": "neutral-bedroom-finish",
    "title": "Finished Bedroom Flooring and Paint",
    "category": "Painting & Flooring",
    "serviceSlug": "flooring-installation",
    "summary": "A clean bedroom with a neutral wall finish, white baseboards and new wood-look floor.",
    "featured": false,
    "cover": "/projects/neutral-bedroom-finish-card.webp",
    "photos": [
      {
        "src": "/projects/neutral-bedroom-finish-after.webp",
        "alt": "Neutral bedroom with completed plank flooring and white baseboards",
        "caption": "Neutral bedroom with completed plank flooring and white baseboards",
        "stage": "after"
      }
    ],
    "detailPage": false
  },
  {
    "id": "bathtub-surface-refresh",
    "title": "Bathtub and Tile Surface Transformation",
    "category": "Bathrooms & Drywall",
    "serviceSlug": "general-handyman-services",
    "summary": "A bathtub surround with worn finishes shown before and after a bright white surface transformation.",
    "featured": true,
    "cover": "/projects/bathtub-surface-refresh-card.webp",
    "photos": [
      {
        "src": "/projects/bathtub-surface-refresh-after.webp",
        "alt": "White bathtub and tile surround following surface refinishing",
        "caption": "White bathtub and tile surround following surface refinishing",
        "stage": "after"
      },
      {
        "src": "/projects/bathtub-surface-refresh-before.webp",
        "alt": "Worn bathtub and tile surface before refinishing",
        "caption": "Worn bathtub and tile surface before refinishing",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "bathroom-finish-update",
    "title": "Bathroom Wall and Fixture Refresh",
    "category": "Bathrooms & Drywall",
    "serviceSlug": "interior-painting",
    "summary": "A small bathroom shown before and after a refreshed wall finish, mirror, vanity area and dark shower hardware.",
    "featured": false,
    "cover": "/projects/bathroom-finish-update-card.webp",
    "photos": [
      {
        "src": "/projects/bathroom-finish-update-after.webp",
        "alt": "Refreshed bathroom with blue-gray wall and black fixtures",
        "caption": "Refreshed bathroom with blue-gray wall and black fixtures",
        "stage": "after"
      },
      {
        "src": "/projects/bathroom-finish-update-before.webp",
        "alt": "Bathroom wall with old finish and removed fixtures during work",
        "caption": "Bathroom wall with old finish and removed fixtures during work",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "bathroom-ceiling-finishing",
    "title": "Bathroom Drywall Ceiling Finishing",
    "category": "Bathrooms & Drywall",
    "serviceSlug": "drywall-repair",
    "summary": "Drywall seams and fastener patches prepared on a bathroom ceiling, followed by a smooth white painted finish.",
    "featured": false,
    "cover": "/projects/bathroom-ceiling-finishing-card.webp",
    "photos": [
      {
        "src": "/projects/bathroom-ceiling-finishing-after.webp",
        "alt": "Finished white drywall ceiling above a bathroom tub",
        "caption": "Finished white drywall ceiling above a bathroom tub",
        "stage": "after"
      },
      {
        "src": "/projects/bathroom-ceiling-finishing-progress.webp",
        "alt": "Bathroom drywall ceiling seams and patches before final paint",
        "caption": "Bathroom drywall ceiling seams and patches before final paint",
        "stage": "progress"
      }
    ],
    "detailPage": true
  },
  {
    "id": "tv-wood-slat-feature-wall",
    "title": "TV Accent Wall with Decorative Wood Slats",
    "category": "TV & Interior Installations",
    "serviceSlug": "tv-mounting",
    "summary": "A decorative wood-slat accent installed behind a large wall-mounted television, with a view of the wall before and after the detail was added.",
    "featured": true,
    "cover": "/projects/tv-wood-slat-feature-wall-card.webp",
    "photos": [
      {
        "src": "/projects/tv-wood-slat-feature-wall-after.webp",
        "alt": "Wall mounted TV with tall decorative brown wood slat panel",
        "caption": "Wall mounted TV with tall decorative brown wood slat panel",
        "stage": "after"
      },
      {
        "src": "/projects/tv-wood-slat-feature-wall-before.webp",
        "alt": "Wall mounted TV before wood slat accent was installed",
        "caption": "Wall mounted TV before wood slat accent was installed",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "tv-fireplace-feature-wall",
    "title": "TV and Linear Fireplace Feature Wall",
    "category": "TV & Interior Installations",
    "serviceSlug": "tv-mounting",
    "summary": "A built-in style feature wall combining a wall-mounted television and a long electric fireplace.",
    "featured": false,
    "cover": "/projects/tv-fireplace-feature-wall-card.webp",
    "photos": [
      {
        "src": "/projects/tv-fireplace-feature-wall-after.webp",
        "alt": "Feature wall with television and linear electric fireplace",
        "caption": "Feature wall with television and linear electric fireplace",
        "stage": "after"
      }
    ],
    "detailPage": false
  },
  {
    "id": "residential-tv-mount",
    "title": "Living Room TV Wall Mounting",
    "category": "TV & Interior Installations",
    "serviceSlug": "tv-mounting",
    "summary": "A large television mounted above a low media console in a bright living room.",
    "featured": false,
    "cover": "/projects/residential-tv-mount-card.webp",
    "photos": [
      {
        "src": "/projects/residential-tv-mount-after.webp",
        "alt": "Large television mounted above a media console",
        "caption": "Large television mounted above a media console",
        "stage": "after"
      }
    ],
    "detailPage": false
  },
  {
    "id": "office-tv-installation",
    "title": "Office TV Mounting",
    "category": "TV & Interior Installations",
    "serviceSlug": "tv-mounting",
    "summary": "Television mounted above a work desk in a small office.",
    "featured": false,
    "cover": "/projects/office-tv-installation-card.webp",
    "photos": [
      {
        "src": "/projects/office-tv-installation-after.webp",
        "alt": "Television mounted on wall above an office desk",
        "caption": "Television mounted on wall above an office desk",
        "stage": "after"
      }
    ],
    "detailPage": false
  },
  {
    "id": "barn-door-installation",
    "title": "Sliding Barn Door Installation",
    "category": "TV & Interior Installations",
    "serviceSlug": "door-repair",
    "summary": "White sliding barn door installed with a black track and contrasting door handle.",
    "featured": false,
    "cover": "/projects/barn-door-installation-card.webp",
    "photos": [
      {
        "src": "/projects/barn-door-installation-after.webp",
        "alt": "White interior sliding barn door and black steel track",
        "caption": "White interior sliding barn door and black steel track",
        "stage": "after"
      }
    ],
    "detailPage": false
  },
  {
    "id": "wood-privacy-fence",
    "title": "Wood Privacy Fence Installation",
    "category": "Fences & Exterior",
    "serviceSlug": "fence-repair",
    "summary": "A long run of newly installed wood privacy fence beside a residential home.",
    "featured": false,
    "cover": "/projects/wood-privacy-fence-card.webp",
    "photos": [
      {
        "src": "/projects/wood-privacy-fence-after.webp",
        "alt": "Fresh wood privacy fence along the side of a house",
        "caption": "Fresh wood privacy fence along the side of a house",
        "stage": "after"
      }
    ],
    "detailPage": false
  },
  {
    "id": "driveway-gate-fence-repair",
    "title": "Wood Fence Section beside a Driveway Gate",
    "category": "Fences & Exterior",
    "serviceSlug": "fence-repair",
    "summary": "Weathered fence pickets beside a black driveway gate were replaced with new wood boards and framing.",
    "featured": true,
    "cover": "/projects/driveway-gate-fence-repair-card.webp",
    "photos": [
      {
        "src": "/projects/driveway-gate-fence-repair-after.webp",
        "alt": "New wood fence section beside black metal driveway gate",
        "caption": "New wood fence section beside black metal driveway gate",
        "stage": "after"
      },
      {
        "src": "/projects/driveway-gate-fence-repair-before.webp",
        "alt": "Old weathered wood fence section by the driveway gate",
        "caption": "Old weathered wood fence section by the driveway gate",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "mailbox-post-replacement",
    "title": "Residential Mailbox Replacement",
    "category": "Fences & Exterior",
    "serviceSlug": "general-handyman-services",
    "summary": "A street-side mailbox changed from a weathered gray post and box to a new black unit.",
    "featured": false,
    "cover": "/projects/mailbox-post-replacement-card.webp",
    "photos": [
      {
        "src": "/projects/mailbox-post-replacement-after.webp",
        "alt": "Installed black street-side mailbox and post",
        "caption": "Installed black street-side mailbox and post",
        "stage": "after"
      },
      {
        "src": "/projects/mailbox-post-replacement-before.webp",
        "alt": "Old gray street-side mailbox and post before replacement",
        "caption": "Old gray street-side mailbox and post before replacement",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "decorative-mailbox",
    "title": "Decorative Mailbox Installation",
    "category": "Fences & Exterior",
    "serviceSlug": "general-handyman-services",
    "summary": "A decorative white roadside mailbox on a detailed post.",
    "featured": false,
    "cover": "/projects/decorative-mailbox-card.webp",
    "photos": [
      {
        "src": "/projects/decorative-mailbox-after.webp",
        "alt": "White decorative roadside mailbox and post",
        "caption": "White decorative roadside mailbox and post",
        "stage": "after"
      }
    ],
    "detailPage": false
  },
  {
    "id": "garden-shed-exterior",
    "title": "Garden Shed Exterior Restoration",
    "category": "Fences & Exterior",
    "serviceSlug": "exterior-painting",
    "summary": "A garden shed shown before repairs, with fresh wood trim during the work and a unified white exterior finish afterward.",
    "featured": true,
    "cover": "/projects/garden-shed-exterior-card.webp",
    "photos": [
      {
        "src": "/projects/garden-shed-exterior-after.webp",
        "alt": "Finished white garden shed with fresh exterior trim",
        "caption": "Finished white garden shed with fresh exterior trim",
        "stage": "after"
      },
      {
        "src": "/projects/garden-shed-exterior-before.webp",
        "alt": "Garden shed with worn white siding and purple trim before restoration",
        "caption": "Garden shed with worn white siding and purple trim before restoration",
        "stage": "before"
      },
      {
        "src": "/projects/garden-shed-exterior-progress.webp",
        "alt": "Fresh wood trim installed around shed exterior prior to painting",
        "caption": "Fresh wood trim installed around shed exterior prior to painting",
        "stage": "progress"
      }
    ],
    "detailPage": true
  },
  {
    "id": "screened-patio-turf",
    "title": "Artificial Turf on a Screened Patio",
    "category": "Fences & Exterior",
    "serviceSlug": "general-handyman-services",
    "summary": "An outdoor screened patio shown with its original tile floor and then covered with a neatly fitted artificial grass surface.",
    "featured": false,
    "cover": "/projects/screened-patio-turf-card.webp",
    "photos": [
      {
        "src": "/projects/screened-patio-turf-after.webp",
        "alt": "Artificial green turf installed over screened patio floor",
        "caption": "Artificial green turf installed over screened patio floor",
        "stage": "after"
      },
      {
        "src": "/projects/screened-patio-turf-before.webp",
        "alt": "Screened patio tiled floor before artificial turf",
        "caption": "Screened patio tiled floor before artificial turf",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "suspended-ceiling-tiles",
    "title": "Commercial Drop-Ceiling Panel Installation",
    "category": "Ceilings & Repairs",
    "serviceSlug": "general-handyman-services",
    "summary": "Suspended ceiling panels placed into an existing office grid after sections had been removed. Images show the open ceiling and restored tile layout.",
    "featured": true,
    "cover": "/projects/suspended-ceiling-tiles-card.webp",
    "photos": [
      {
        "src": "/projects/suspended-ceiling-tiles-after.webp",
        "alt": "Completed suspended ceiling grid with gray acoustic tiles",
        "caption": "Completed suspended ceiling grid with gray acoustic tiles",
        "stage": "after"
      },
      {
        "src": "/projects/suspended-ceiling-tiles-before.webp",
        "alt": "Suspended ceiling grid with several tiles removed",
        "caption": "Suspended ceiling grid with several tiles removed",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "balcony-ceiling-fan",
    "title": "Outdoor Balcony Ceiling Fan Installation",
    "category": "Ceilings & Repairs",
    "serviceSlug": "general-handyman-services",
    "summary": "A white ceiling fan installed on a covered balcony where a ceiling fixture location was previously open.",
    "featured": false,
    "cover": "/projects/balcony-ceiling-fan-card.webp",
    "photos": [
      {
        "src": "/projects/balcony-ceiling-fan-after.webp",
        "alt": "White ceiling fan installed on a covered waterfront balcony",
        "caption": "White ceiling fan installed on a covered waterfront balcony",
        "stage": "after"
      },
      {
        "src": "/projects/balcony-ceiling-fan-before.webp",
        "alt": "Balcony ceiling with open fixture box before fan installation",
        "caption": "Balcony ceiling with open fixture box before fan installation",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "porch-soffit-panel",
    "title": "Porch Soffit Panel Repair",
    "category": "Ceilings & Repairs",
    "serviceSlug": "general-handyman-services",
    "summary": "Soffit area under a covered porch shown with a missing panel and afterward with a uniform vented panel finish.",
    "featured": false,
    "cover": "/projects/porch-soffit-panel-card.webp",
    "photos": [
      {
        "src": "/projects/porch-soffit-panel-after.webp",
        "alt": "Repaired white vented soffit panels above covered porch",
        "caption": "Repaired white vented soffit panels above covered porch",
        "stage": "after"
      },
      {
        "src": "/projects/porch-soffit-panel-before.webp",
        "alt": "Opening in porch soffit with framing exposed before repair",
        "caption": "Opening in porch soffit with framing exposed before repair",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "garage-soffit-repair",
    "title": "Garage Roofline Soffit Repair",
    "category": "Ceilings & Repairs",
    "serviceSlug": "general-handyman-services",
    "summary": "Damaged soffit panels under a garage roof edge shown during replacement and after white vented panels were fitted.",
    "featured": false,
    "cover": "/projects/garage-soffit-repair-card.webp",
    "photos": [
      {
        "src": "/projects/garage-soffit-repair-after.webp",
        "alt": "Completed white perforated soffit along garage roof edge",
        "caption": "Completed white perforated soffit along garage roof edge",
        "stage": "after"
      },
      {
        "src": "/projects/garage-soffit-repair-before.webp",
        "alt": "Missing soffit panels along a garage roof edge",
        "caption": "Missing soffit panels along a garage roof edge",
        "stage": "before"
      },
      {
        "src": "/projects/garage-soffit-repair-progress.webp",
        "alt": "Installing soffit panels along the eave with a ladder",
        "caption": "Installing soffit panels along the eave with a ladder",
        "stage": "progress"
      }
    ],
    "detailPage": true
  },
  {
    "id": "dining-ceiling-patch",
    "title": "Ceiling Repair around a Pendant Light",
    "category": "Ceilings & Repairs",
    "serviceSlug": "drywall-repair",
    "summary": "A damaged ceiling opening next to a hanging fixture was patched and refinished to blend with the surrounding ceiling texture.",
    "featured": false,
    "cover": "/projects/dining-ceiling-patch-card.webp",
    "photos": [
      {
        "src": "/projects/dining-ceiling-patch-after.webp",
        "alt": "Finished ceiling around pendant light mounting plate",
        "caption": "Finished ceiling around pendant light mounting plate",
        "stage": "after"
      },
      {
        "src": "/projects/dining-ceiling-patch-before.webp",
        "alt": "Ceiling hole and damaged paint next to dining light",
        "caption": "Ceiling hole and damaged paint next to dining light",
        "stage": "before"
      }
    ],
    "detailPage": true
  },
  {
    "id": "bedroom-ceiling-drywall-repair",
    "title": "Bedroom Ceiling Drywall Hole Repair",
    "category": "Ceilings & Repairs",
    "serviceSlug": "drywall-repair",
    "summary": "Repaired an opening in a bedroom drywall ceiling, applied a matching ceiling texture, and painted the repaired surface. Photos show the opening and the finished ceiling.",
    "featured": false,
    "cover": "/projects/bedroom-ceiling-drywall-repair-card.webp",
    "photos": [
      {
        "src": "/projects/bedroom-ceiling-drywall-repair-before.webp",
        "alt": "Opening in a bedroom drywall ceiling before patching",
        "caption": "Opening in a bedroom drywall ceiling before patching",
        "stage": "before"
      },
      {
        "src": "/projects/bedroom-ceiling-drywall-repair-after.webp",
        "alt": "Bedroom ceiling repaired, textured, and painted",
        "caption": "Bedroom ceiling repaired, textured, and painted",
        "stage": "after"
      }
    ],
    "detailPage": true
  },
  {
    "id": "house-exterior-repainting",
    "title": "Residential Exterior House Repainting",
    "category": "Fences & Exterior",
    "serviceSlug": "exterior-painting",
    "summary": "Before-and-after photos show the same house from different angles, changing from a green exterior to a light finish with red accents.",
    "featured": false,
    "cover": "/projects/house-exterior-repainting-card.webp",
    "photos": [
      {
        "src": "/projects/house-exterior-repainting-before.webp",
        "alt": "Green exterior of house before repainting",
        "caption": "Green exterior of house before repainting",
        "stage": "before"
      },
      {
        "src": "/projects/house-exterior-repainting-after.webp",
        "alt": "House exterior after repainting white with red accents",
        "caption": "House exterior after repainting white with red accents",
        "stage": "after"
      }
    ],
    "detailPage": true
  },
  {
    "id": "gable-end-siding-replacement",
    "title": "Gable-End Wood Siding Replacement and Painting",
    "category": "Fences & Exterior",
    "serviceSlug": "general-handyman-services",
    "summary": "Replaced wood cladding on the upper gable-end exterior wall beneath the roofline and painted the finished surface. Photos show the exposed wall area, new siding, and painted result.",
    "featured": false,
    "cover": "/projects/gable-end-siding-replacement-card.webp",
    "photos": [
      {
        "src": "/projects/gable-end-siding-replacement-before.webp",
        "alt": "Exposed upper gable wall after old siding removal",
        "caption": "Exposed upper gable wall after old siding removal",
        "stage": "before"
      },
      {
        "src": "/projects/gable-end-siding-replacement-progress.webp",
        "alt": "Replacement wood siding installed on upper gable-end wall",
        "caption": "Replacement wood siding installed on upper gable-end wall",
        "stage": "progress"
      },
      {
        "src": "/projects/gable-end-siding-replacement-after.webp",
        "alt": "Finished painted wood siding on upper gable-end wall",
        "caption": "Finished painted wood siding on upper gable-end wall",
        "stage": "after"
      }
    ],
    "detailPage": true
  },
  {
    "id": "kitchen-light-panel",
    "title": "Kitchen Ceiling Light Panel Conversion",
    "category": "Ceilings & Repairs",
    "serviceSlug": "general-handyman-services",
    "summary": "Removed the old ceiling fan from a recessed kitchen ceiling opening and finished the overhead lighting area with frosted translucent plastic diffuser panels for a bright, clean appearance.",
    "featured": false,
    "cover": "/projects/kitchen-light-panel-card.webp",
    "photos": [
      {
        "src": "/projects/kitchen-light-panel-before.webp",
        "alt": "Recessed ceiling opening with older ceiling fan before modification",
        "caption": "Recessed ceiling opening with older ceiling fan before modification",
        "stage": "before"
      },
      {
        "src": "/projects/kitchen-light-panel-after.webp",
        "alt": "Finished kitchen light panel using frosted translucent plastic diffusers",
        "caption": "Finished kitchen light panel using frosted translucent plastic diffusers",
        "stage": "after"
      }
    ],
    "detailPage": true
  },
  {
    "id": "outdoor-tv-mounting",
    "title": "TV Mounted on a Covered Patio",
    "category": "TV & Interior Installations",
    "serviceSlug": "tv-mounting",
    "summary": "A wall-mounted TV beneath a covered outdoor patio ceiling.",
    "featured": false,
    "cover": "/projects/outdoor-tv-mounting-card.webp",
    "photos": [
      {
        "src": "/projects/outdoor-tv-mounting-after.webp",
        "alt": "TV mounted under a covered outdoor patio",
        "caption": "TV mounted under a covered outdoor patio",
        "stage": "after"
      }
    ],
    "detailPage": false
  }
] as Project[];

export const projectCategories = Array.from(new Set(projects.map((project) => project.category)));
export const detailProjects = projects.filter((project) => project.detailPage);
