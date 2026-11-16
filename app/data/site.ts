/** Site pages and business area. Do not imply a street address or fake project city. */
export const baseUrl = "https://handymantampa.net";

export const cities = [
  { slug: "tampa", name: "Tampa", description: "Handyman repairs and installations for homeowners in Tampa, including Westchase, Downtown and nearby neighborhoods." },
  { slug: "clearwater", name: "Clearwater", description: "Household repairs, painting and installation services for homeowners in Clearwater and nearby areas." },
  { slug: "st-petersburg", name: "St. Petersburg", description: "Handyman home repair and improvement services in St. Petersburg, Gulfport and surrounding neighborhoods." },
  { slug: "brandon", name: "Brandon", description: "Interior repairs, door adjustments, painting and other handyman jobs in Brandon and neighboring communities." },
  { slug: "riverview", name: "Riverview", description: "Home maintenance and small installation projects for properties in Riverview and nearby communities." },
  { slug: "wesley-chapel", name: "Wesley Chapel", description: "Drywall, painting, door hardware and other home repair projects in Wesley Chapel." },
  { slug: "largo", name: "Largo", description: "Home repairs and handyman installations for households in Largo and surrounding communities." },
  { slug: "lutz", name: "Lutz", description: "Handyman painting, trim, door and mounting services for homes in Lutz." },
  { slug: "carrollwood", name: "Carrollwood", description: "Door adjustments, drywall patching, painting and other handyman services in Carrollwood." },
  { slug: "westchase", name: "Westchase", description: "Handyman home repair and finishing projects in Westchase and nearby Tampa neighborhoods." },
  { slug: "tarpon-springs", name: "Tarpon Springs", description: "Household maintenance and non-permit handyman repairs in Tarpon Springs." },
  { slug: "palm-harbor", name: "Palm Harbor", description: "Handyman repairs, mounting and minor home improvement projects in Palm Harbor." },
  { slug: "oldsmar", name: "Oldsmar", description: "Handyman painting, small repairs and home maintenance projects in Oldsmar." },
  { slug: "dunedin", name: "Dunedin", description: "Home repair, interior painting and installation services in Dunedin." },
  { slug: "safety-harbor", name: "Safety Harbor", description: "Handyman services including door, trim, drywall and mounting projects in Safety Harbor." },
  { slug: "pinellas-park", name: "Pinellas Park", description: "Residential handyman repairs and installations in Pinellas Park." },
  { slug: "odessa", name: "Odessa", description: "Home repairs, small installation work and painting services in Odessa." },
];

export const services = [
  { title: "Door Repair & Installation", slug: "door-repair", image: "/projects/barn-door-installation-after.webp", description: "Interior door installation, repair, adjustments, hardware and trim.", includes: ["Interior door installation", "Door repair and adjustment", "Locks, handles, and hinges", "Trim and molding around doors"] },
  { title: "Drywall Repair", slug: "drywall-repair", image: "/projects/dining-ceiling-patch-after.webp", description: "Drywall patching, cracks, holes and texture matching.", includes: ["Small and medium drywall patches", "Hole and crack repair", "Texture matching", "Wall repair before painting"] },
  { title: "Interior Painting", slug: "interior-painting", image: "/projects/kitchen-cabinet-painting-after.webp", description: "Paint preparation and finishing for rooms, ceilings, trim and cabinets.", includes: ["Room painting", "Accent walls", "Cabinet finishing", "Trim and baseboard painting"] },
  { title: "Flooring Installation", slug: "flooring-installation", image: "/projects/bedroom-lvp-floor-after.webp", description: "Luxury vinyl plank, laminate, transitions and small repairs.", includes: ["Luxury vinyl plank installation", "Laminate flooring", "Floor trim and transitions", "Small flooring repairs"] },
  { title: "TV Mounting", slug: "tv-mounting", image: "/projects/tv-wood-slat-feature-wall-after.webp", description: "Secure TV mounting, brackets, soundbars and tidy cable covers.", includes: ["TV wall mounting", "Bracket installation", "External wire covers", "Soundbar and accessory setup"] },
  { title: "Furniture Assembly", slug: "furniture-assembly", image: "/services/furniture.png", description: "Beds, desks, cabinets, storage furniture and shelving assemblies.", includes: ["Beds, desks, and dressers", "Cabinets and shelves", "Patio furniture", "IKEA and Amazon furniture"] },
  { title: "Plumbing Fixture Replacements", slug: "plumbing-repairs", image: "/services/plumbing.png", description: "Suitable non-permit faucets, showerheads and bathroom accessories.", includes: ["Fixture replacements where allowed", "Bathroom accessories", "Showerheads", "Non-regulated adjustments"] },
  { title: "Fence & Gate Repair", slug: "fence-repair", image: "/projects/driveway-gate-fence-repair-after.webp", description: "Non-structural fence repairs, gates, hinges and privacy panels.", includes: ["Fence panel repair", "Gate repair", "Gate hardware", "Minor wood fence maintenance"] },
  { title: "Deck Repair & Maintenance", slug: "deck-repair", image: "/projects/gray-deck-repair-after.webp", description: "Deck board replacement, surface improvements and small non-structural repairs; permit work referred out.", includes: ["Replace suitable deck boards", "Surface and trim repairs", "Deck cleaning and finishing", "Assess repair scope and licensing needs"] },
  { title: "Exterior Painting & Trim", slug: "exterior-painting", image: "/projects/garden-shed-exterior-after.webp", description: "Exterior paint, preparation and suitable non-structural wood trim repairs.", includes: ["Exterior preparation", "Siding and trim painting", "Small non-structural trim repairs", "Storage shed finish work"] },
  { title: "General Handyman Services", slug: "general-handyman-services", image: "/services/general.png", description: "Small home repairs, fixtures, mounting and household punch lists.", includes: ["Small home repairs", "Installations", "Maintenance tasks", "Punch list projects"] },
];

export const cityNames = Object.fromEntries(cities.map((city) => [city.slug, city.name])) as Record<string, string>;
export const serviceNames = Object.fromEntries(services.map((service) => [service.slug, service.title])) as Record<string, string>;
export function formatSlugName(slug: string) {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
export function getCityName(slug: string) { return cityNames[slug] || formatSlugName(slug); }
export function getServiceName(slug: string) { return serviceNames[slug] || formatSlugName(slug); }
export function getService(slug: string) { return services.find((service) => service.slug === slug); }
