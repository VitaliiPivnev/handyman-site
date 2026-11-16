/** Site pages and business area. Do not imply a street address or fake project city. */
export const baseUrl = "https://handymantampa.net";

export type City = {
  slug: string;
  name: string;
  description: string;
  seoTitle?: string;
  metaDescription?: string;
  localIntro?: string;
  estimateAdvice?: string;
  serviceFocus?: string[];
};

export const cities: City[] = [
  {
    slug: "westchase", name: "Westchase",
    seoTitle: "Handyman in Westchase, Tampa, FL | Home Repairs",
    metaDescription: "Handyman services near Westchase and ZIP 33626 for drywall, doors, painting, mounting, fence repairs and household projects. Send photos for an estimate.",
    description: "Handyman repairs and installations near Westchase and ZIP 33626, with convenient service for northwest Tampa homeowners.",
    localIntro: "Westchase is the closest service priority to our northwest Tampa focus. We help homeowners organize practical repair, installation and finishing projects without sending them through a separate page for every service.",
    estimateAdvice: "For a useful first review, send the Westchase project location, a wide photo, close-ups of the repair area and any product link or measurements you already have.",
    serviceFocus: ["Drywall and ceiling patches", "Door, trim and hardware adjustments", "Interior finishing, mounting and household punch lists"],
  },
  {
    slug: "citrus-park", name: "Citrus Park",
    metaDescription: "Handyman services in Citrus Park, FL for drywall, doors, painting, TV mounting and household repairs near northwest Tampa. Request a project estimate.",
    description: "Handyman help for home repairs, mounting, drywall and finish work in Citrus Park and nearby northwest Tampa communities.",
    localIntro: "Citrus Park is a priority service area near Westchase. This page brings the main repair and installation options together so homeowners can choose the right service and share one clear project request.",
    estimateAdvice: "Include the Citrus Park project location, photos of the full work area and a short list of tasks. Related small repairs can be reviewed together as one punch-list request.",
    serviceFocus: ["Drywall, wall and ceiling repairs", "Door hardware and interior finish work", "TV mounting and suitable household installations"],
  },
  {
    slug: "town-n-country", name: "Town 'n' Country",
    metaDescription: "Handyman services in Town 'n' Country, Tampa for drywall, doors, painting, mounting and home repair punch lists. Send project details and photos.",
    description: "Home repair and installation services in Town 'n' Country, close to Westchase and northwest Tampa.",
    localIntro: "Town 'n' Country is part of the northwest Tampa service focus. Homeowners can use this city hub to compare the primary handyman services without relying on thin city-and-service landing pages.",
    estimateAdvice: "Send the Town 'n' Country project location, clear photos and approximate dimensions. If several small tasks are involved, number them so the complete scope can be reviewed together.",
    serviceFocus: ["General home repair punch lists", "Drywall, painting and trim", "Mounting, assembly and suitable fixture replacements"],
  },
  {
    slug: "oldsmar", name: "Oldsmar",
    metaDescription: "Handyman services in Oldsmar, FL for home repairs, drywall, doors, painting, mounting and small installations near Westchase. Request an estimate.",
    description: "Handyman painting, small repairs and home maintenance projects in Oldsmar, near the Westchase service area.",
    localIntro: "Oldsmar is a priority service area between northwest Tampa and upper Tampa Bay. We focus on clearly scoped repairs, finish work and installations that fit appropriate handyman work.",
    estimateAdvice: "Share the Oldsmar location, project photos and product information before scheduling. Photos help identify whether the work fits handyman scope or needs a licensed trade.",
    serviceFocus: ["Interior repairs and drywall patches", "Doors, trim and hardware", "Painting, mounting and maintenance lists"],
  },
  {
    slug: "odessa", name: "Odessa",
    metaDescription: "Handyman services in Odessa, FL for drywall, doors, painting, mounting and household repair projects near northwest Tampa. Send photos for an estimate.",
    description: "Home repairs, small installation work and painting services in Odessa, with project-based estimates from photos and scope details.",
    localIntro: "Odessa is part of the priority area north of Westchase. We review small-to-medium repair and improvement projects based on the exact task, access, materials and finish required.",
    estimateAdvice: "Because travel and project scope both matter, include the Odessa project location along with wide and close-up photos, measurements and any customer-supplied product link.",
    serviceFocus: ["Drywall and interior surface repairs", "Door and trim adjustments", "Painting, mounting and household installations"],
  },
  {
    slug: "clearwater", name: "Clearwater",
    metaDescription: "Handyman services in Clearwater, FL for drywall, doors, painting, flooring, mounting and household repairs. View real projects and request an estimate.",
    description: "Household repairs, painting and installation services for homeowners in Clearwater and nearby areas.",
    localIntro: "Clearwater homeowners can start with one project request for a repair, installation or grouped punch list. The service pages below explain the scope and show real project examples where available.",
    estimateAdvice: "Send the Clearwater project location, photos of the surrounding area and close-ups of damage or mounting points. For supplied products, include the model or store link.",
    serviceFocus: ["Drywall and interior painting", "Door and hardware repairs", "Flooring, mounting and suitable exterior maintenance"],
  },
  {
    slug: "largo", name: "Largo",
    metaDescription: "Handyman services in Largo, FL for drywall, painting, doors, flooring, mounting and home repair projects. Send photos for a project estimate.",
    description: "Home repairs and handyman installations for households in Largo and surrounding communities.",
    localIntro: "The Largo service page connects homeowners to the main Tampa Bay repair categories and real work examples instead of producing a separate thin page for every service combination.",
    estimateAdvice: "Include the Largo project location, overall and detail photos, approximate dimensions and a numbered list when several repairs need attention.",
    serviceFocus: ["Wall and ceiling repair", "Painting, trim and doors", "Flooring, mounting and home maintenance"],
  },
  {
    slug: "safety-harbor", name: "Safety Harbor",
    metaDescription: "Handyman services in Safety Harbor, FL for doors, trim, drywall, painting, mounting and household repairs. Request a clear project estimate.",
    description: "Handyman services including door, trim, drywall and mounting projects in Safety Harbor.",
    localIntro: "Safety Harbor is served through the main Tampa Bay handyman service pages. We review each repair or installation by its actual scope rather than promising a one-size-fits-all service.",
    estimateAdvice: "Share the Safety Harbor location and photos that show both the full area and the specific damage, hardware or installation point.",
    serviceFocus: ["Door, trim and hardware work", "Drywall and painting preparation", "Mounting and grouped maintenance tasks"],
  },
  {
    slug: "palm-harbor", name: "Palm Harbor",
    metaDescription: "Handyman services in Palm Harbor, FL for drywall, doors, mounting, painting and minor home improvements. Send photos and request an estimate.",
    description: "Handyman repairs, mounting and minor home improvement projects in Palm Harbor.",
    localIntro: "Palm Harbor projects are reviewed from photos and a clear task description so the appropriate handyman service, materials and next step can be identified before scheduling.",
    estimateAdvice: "Provide the Palm Harbor project location, wide and close-up photos, measurements and any product specifications that affect installation.",
    serviceFocus: ["Drywall, paint preparation and trim", "Door adjustments and hardware", "TV mounting and household installations"],
  },
  {
    slug: "dunedin", name: "Dunedin",
    metaDescription: "Handyman services in Dunedin, FL for home repairs, drywall, painting, doors, mounting and installations. View service details and request an estimate.",
    description: "Home repair, interior painting and installation services in Dunedin.",
    localIntro: "Dunedin homeowners can use this hub to review the primary repair and installation services, then send one request with the actual project details and photos.",
    estimateAdvice: "Include the Dunedin location, photos of access and surrounding finishes, and close-ups of the repair or installation area.",
    serviceFocus: ["Drywall and interior finishing", "Doors, trim and hardware", "Mounting and home repair punch lists"],
  },
  { slug: "st-petersburg", name: "St. Petersburg", metaDescription: "Handyman services in St. Petersburg, FL for drywall, doors, painting, flooring, mounting and household repairs. View real work and request an estimate.", description: "Handyman home repair and improvement services in St. Petersburg, Gulfport and surrounding neighborhoods.", localIntro: "St. Petersburg projects can range from a single repair to a grouped home-maintenance list. We review the actual scope, existing condition and finish expectations before providing the next estimate step.", estimateAdvice: "Send the St. Petersburg project location, clear photos, measurements and product links so access, materials and finish details can be reviewed.", serviceFocus: ["Drywall, painting and interior finish work", "Doors, flooring and mounting", "Suitable exterior and household maintenance"] },
  {
    slug: "seminole", name: "Seminole",
    metaDescription: "Handyman services in Seminole, FL for drywall, doors, painting, mounting and household repair projects. Send project photos for an estimate.",
    description: "Handyman repairs, finish work and suitable home installations for homeowners in Seminole, Florida.",
    localIntro: "Seminole is a priority Pinellas service area. This page directs homeowners to the main service information and real portfolio rather than creating duplicate pages for every city-service pairing.",
    estimateAdvice: "Share the Seminole project location, a wide photo, useful close-ups and a short scope description. Include model numbers for items that need assembly or mounting.",
    serviceFocus: ["Drywall and interior repairs", "Doors, trim and painting", "Mounting and household project lists"],
  },
  { slug: "tampa", name: "Tampa", description: "Handyman repairs and installations for homeowners in Tampa, including Westchase, Downtown and nearby neighborhoods." },
  { slug: "carrollwood", name: "Carrollwood", description: "Door adjustments, drywall patching, painting and other handyman services in Carrollwood." },
  { slug: "lutz", name: "Lutz", description: "Handyman painting, trim, door and mounting services for homes in Lutz." },
  { slug: "wesley-chapel", name: "Wesley Chapel", description: "Drywall, painting, door hardware and other home repair projects in Wesley Chapel." },
  { slug: "riverview", name: "Riverview", description: "Home maintenance and small installation projects for properties in Riverview and nearby communities." },
  { slug: "brandon", name: "Brandon", description: "Interior repairs, door adjustments, painting and other handyman jobs in Brandon and neighboring communities." },
  { slug: "tarpon-springs", name: "Tarpon Springs", description: "Household maintenance and non-permit handyman repairs in Tarpon Springs." },
  { slug: "pinellas-park", name: "Pinellas Park", description: "Residential handyman repairs and installations in Pinellas Park." },
];

const legacyCityServiceSlugs = new Set([
  "tampa", "clearwater", "st-petersburg", "brandon", "riverview", "wesley-chapel", "largo", "lutz",
  "carrollwood", "westchase", "tarpon-springs", "palm-harbor", "oldsmar", "dunedin", "safety-harbor",
  "pinellas-park", "odessa",
]);

/** Preserve the original 187 noindex city-service routes without creating new combinations. */
export const cityServiceCities = cities.filter((city) => legacyCityServiceSlugs.has(city.slug));

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
