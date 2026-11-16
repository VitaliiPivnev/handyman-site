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
    localIntro: "Westchase is close to the center of our regular service area. Common requests include drywall patches, door adjustments, mounting, painting touch-ups and grouped home-repair lists.",
    estimateAdvice: "For a useful first review, send the Westchase project location, a wide photo, close-ups of the repair area and any product link or measurements you already have.",
    serviceFocus: ["Drywall and ceiling patches", "Door, trim and hardware adjustments", "Interior finishing, mounting and household punch lists"],
  },
  {
    slug: "citrus-park", name: "Citrus Park",
    metaDescription: "Handyman services in Citrus Park, FL for drywall, doors, painting, TV mounting and household repairs near northwest Tampa. Request a project estimate.",
    description: "Handyman help for home repairs, mounting, drywall and finish work in Citrus Park and nearby northwest Tampa communities.",
    localIntro: "For projects in Citrus Park, photos and a clear task list are usually the best place to start. This works well for single repairs as well as several small jobs that can be reviewed together.",
    estimateAdvice: "Include the Citrus Park project location, photos of the full work area and a short list of tasks. Related small repairs can be reviewed together as one punch-list request.",
    serviceFocus: ["Drywall, wall and ceiling repairs", "Door hardware and interior finish work", "TV mounting and suitable household installations"],
  },
  {
    slug: "town-n-country", name: "Town 'n' Country",
    metaDescription: "Handyman services in Town 'n' Country, Tampa for drywall, doors, painting, mounting and home repair punch lists. Send project details and photos.",
    description: "Home repair and installation services in Town 'n' Country, close to Westchase and northwest Tampa.",
    localIntro: "In Town 'n' Country, we review the actual repair or installation before discussing the next step. A few useful photos help clarify wall type, access, existing damage and the finish you expect.",
    estimateAdvice: "Send the Town 'n' Country project location, clear photos and approximate dimensions. If several small tasks are involved, number them so the complete scope can be reviewed together.",
    serviceFocus: ["General home repair punch lists", "Drywall, painting and trim", "Mounting, assembly and suitable fixture replacements"],
  },
  {
    slug: "oldsmar", name: "Oldsmar",
    metaDescription: "Handyman services in Oldsmar, FL for home repairs, drywall, doors, painting, mounting and small installations near Westchase. Request an estimate.",
    description: "Handyman painting, small repairs and home maintenance projects in Oldsmar, near the Westchase service area.",
    localIntro: "Oldsmar is within our regular northwest Tampa service area. We take on clearly defined home repairs, finish work and installations that fall within appropriate handyman scope.",
    estimateAdvice: "Share the Oldsmar location, project photos and product information before scheduling. The details help identify the likely scope and any permit or licensed-trade considerations.",
    serviceFocus: ["Interior repairs and drywall patches", "Doors, trim and hardware", "Painting, mounting and maintenance lists"],
  },
  {
    slug: "odessa", name: "Odessa",
    metaDescription: "Handyman services in Odessa, FL for drywall, doors, painting, mounting and household repair projects near northwest Tampa. Send photos for an estimate.",
    description: "Home repairs, small installation work and painting services in Odessa, with project-based estimates from photos and scope details.",
    localIntro: "For Odessa projects, the exact task, access, materials and finish matter more than a generic service label. Photos and measurements help determine whether the work is a good fit before scheduling.",
    estimateAdvice: "Because travel and project scope both matter, include the Odessa project location along with wide and close-up photos, measurements and any customer-supplied product link.",
    serviceFocus: ["Drywall and interior surface repairs", "Door and trim adjustments", "Painting, mounting and household installations"],
  },
  {
    slug: "clearwater", name: "Clearwater",
    metaDescription: "Handyman services in Clearwater, FL for drywall, doors, painting, flooring, mounting and household repairs. View real projects and request an estimate.",
    description: "Household repairs, painting and installation services for homeowners in Clearwater and nearby areas.",
    localIntro: "Clearwater homeowners can send one request for a single repair or a grouped punch list. Describe what is damaged, what you want installed and whether materials have already been purchased.",
    estimateAdvice: "Send the Clearwater project location, photos of the surrounding area and close-ups of damage or mounting points. For supplied products, include the model or store link.",
    serviceFocus: ["Drywall and interior painting", "Door and hardware repairs", "Flooring, mounting and suitable exterior maintenance"],
  },
  {
    slug: "largo", name: "Largo",
    metaDescription: "Handyman services in Largo, FL for drywall, painting, doors, flooring, mounting and home repair projects. Send photos for a project estimate.",
    description: "Home repairs and handyman installations for households in Largo and surrounding communities.",
    localIntro: "Largo projects may involve one repair or several smaller tasks around the home. A numbered list and clear photos make it easier to review the complete scope together.",
    estimateAdvice: "Include the Largo project location, overall and detail photos, approximate dimensions and a numbered list when several repairs need attention.",
    serviceFocus: ["Wall and ceiling repair", "Painting, trim and doors", "Flooring, mounting and home maintenance"],
  },
  {
    slug: "safety-harbor", name: "Safety Harbor",
    metaDescription: "Handyman services in Safety Harbor, FL for doors, trim, drywall, painting, mounting and household repairs. Request a clear project estimate.",
    description: "Handyman services including door, trim, drywall and mounting projects in Safety Harbor.",
    localIntro: "For Safety Harbor homes, each repair or installation is reviewed by its actual scope. Existing condition, access, materials and finish expectations all affect the plan.",
    estimateAdvice: "Share the Safety Harbor location and photos that show both the full area and the specific damage, hardware or installation point.",
    serviceFocus: ["Door, trim and hardware work", "Drywall and painting preparation", "Mounting and grouped maintenance tasks"],
  },
  {
    slug: "palm-harbor", name: "Palm Harbor",
    metaDescription: "Handyman services in Palm Harbor, FL for drywall, doors, mounting, painting and minor home improvements. Send photos and request an estimate.",
    description: "Handyman repairs, mounting and minor home improvement projects in Palm Harbor.",
    localIntro: "Palm Harbor project requests are easiest to review when they include a clear task description, useful photos and details about any materials or products already on hand.",
    estimateAdvice: "Provide the Palm Harbor project location, wide and close-up photos, measurements and any product specifications that affect installation.",
    serviceFocus: ["Drywall, paint preparation and trim", "Door adjustments and hardware", "TV mounting and household installations"],
  },
  {
    slug: "dunedin", name: "Dunedin",
    metaDescription: "Handyman services in Dunedin, FL for home repairs, drywall, painting, doors, mounting and installations. View service details and request an estimate.",
    description: "Home repair, interior painting and installation services in Dunedin.",
    localIntro: "Dunedin homeowners can start by sharing the actual repair or installation details. Photos of the work area and surrounding finish help avoid assumptions about the scope.",
    estimateAdvice: "Include the Dunedin location, photos of access and surrounding finishes, and close-ups of the repair or installation area.",
    serviceFocus: ["Drywall and interior finishing", "Doors, trim and hardware", "Mounting and home repair punch lists"],
  },
  { slug: "st-petersburg", name: "St. Petersburg", metaDescription: "Handyman services in St. Petersburg, FL for drywall, doors, painting, flooring, mounting and household repairs. View real work and request an estimate.", description: "Handyman home repair and improvement services in St. Petersburg, Gulfport and surrounding neighborhoods.", localIntro: "St. Petersburg requests can range from one repair to a grouped home-maintenance list. The existing condition, access and finish you want help define the work before scheduling.", estimateAdvice: "Send the St. Petersburg project location, clear photos, measurements and product links so access, materials and finish details can be reviewed.", serviceFocus: ["Drywall, painting and interior finish work", "Doors, flooring and mounting", "Suitable exterior and household maintenance"] },
  {
    slug: "seminole", name: "Seminole",
    metaDescription: "Handyman services in Seminole, FL for drywall, doors, painting, mounting and household repair projects. Send project photos for an estimate.",
    description: "Handyman repairs, finish work and suitable home installations for homeowners in Seminole, Florida.",
    localIntro: "For projects in Seminole, start with the specific repair or installation rather than a broad description. Photos, dimensions and product details help clarify what the job involves.",
    estimateAdvice: "Share the Seminole project location, a wide photo, useful close-ups and a short scope description. Include model numbers for items that need assembly or mounting.",
    serviceFocus: ["Drywall and interior repairs", "Doors, trim and painting", "Mounting and household project lists"],
  },
  { slug: "tampa", name: "Tampa", metaDescription: "Handyman services in Tampa, FL for drywall, doors, painting, flooring, mounting and practical home repairs. Send project details and photos for an estimate.", description: "Handyman repairs and installations for Tampa homeowners, from drywall and doors to mounting and grouped punch lists.", localIntro: "Tampa project requests vary widely, so the first step is to describe the specific repair or installation. Photos help show access, existing conditions and nearby finishes before the scope is discussed.", estimateAdvice: "Include the Tampa project location, one wide photo, useful close-ups, and measurements or product links when they affect the work.", serviceFocus: ["Drywall, doors and interior repairs", "Painting, flooring and finish work", "Mounting and grouped home-repair lists"] },
  { slug: "carrollwood", name: "Carrollwood", metaDescription: "Handyman services in Carrollwood, Tampa for drywall, doors, trim, painting, mounting and household repairs. Request a project estimate.", description: "Door adjustments, drywall patching, painting and other household projects in Carrollwood.", localIntro: "Carrollwood requests often involve interior repairs, finish details or several small tasks. A numbered list makes it easier to review everything without overlooking part of the project.", estimateAdvice: "Send the Carrollwood location, photos of each task, measurements and any model numbers for products that need installation.", serviceFocus: ["Door, trim and hardware adjustments", "Drywall and paint preparation", "Mounting and maintenance punch lists"] },
  { slug: "lutz", name: "Lutz", metaDescription: "Handyman services in Lutz, FL for drywall, doors, trim, painting, mounting and home-repair projects. Send photos for an estimate.", description: "Handyman painting, trim, door and mounting services for homes in Lutz.", localIntro: "For work in Lutz, clear photos and location details help determine whether a repair or installation fits the available service route and handyman scope.", estimateAdvice: "Include the Lutz project location, full-area and close-up photos, dimensions and a link to any product that needs to be installed.", serviceFocus: ["Doors, hardware and trim", "Drywall and interior painting", "TV mounting and suitable installations"] },
  { slug: "wesley-chapel", name: "Wesley Chapel", metaDescription: "Handyman services in Wesley Chapel, FL for drywall, doors, painting, mounting and practical home projects. Request an estimate with photos.", description: "Drywall, painting, door hardware and other home repair projects in Wesley Chapel.", localIntro: "Wesley Chapel is farther from the Westchase-centered service route, so project scope and scheduling need to be reviewed together. A complete request helps avoid unnecessary back-and-forth.", estimateAdvice: "Send the Wesley Chapel location, project photos, dimensions and a complete task list so availability can be checked with the scope.", serviceFocus: ["Drywall and painting projects", "Door and hardware adjustments", "Mounting and grouped repair lists"] },
  { slug: "riverview", name: "Riverview", metaDescription: "Handyman services in Riverview, FL for home repairs, drywall, doors, painting, mounting and small installations. Send photos for an estimate.", description: "Home maintenance and small installation projects for properties in Riverview and nearby communities.", localIntro: "Riverview remains within the broader Tampa Bay service area. Because it is farther from Westchase, complete project details are especially useful when reviewing scope and scheduling.", estimateAdvice: "Include the Riverview location, photos, measurements and all requested tasks in one message so the project can be reviewed as a whole.", serviceFocus: ["Interior repairs and drywall", "Doors, trim and painting", "Mounting and suitable installations"] },
  { slug: "brandon", name: "Brandon", metaDescription: "Handyman services in Brandon, FL for drywall, doors, painting, mounting and household repair projects. Send project details for an estimate.", description: "Interior repairs, door adjustments, painting and other household projects in Brandon.", localIntro: "Brandon requests are reviewed based on both the project and the travel involved. Grouped repairs may be a better fit than a single very small task, depending on scope and schedule.", estimateAdvice: "Send the Brandon location, a numbered task list, photos and product details so the complete request can be considered before scheduling.", serviceFocus: ["Drywall and interior repairs", "Doors, painting and trim", "Grouped maintenance and installation tasks"] },
  { slug: "tarpon-springs", name: "Tarpon Springs", metaDescription: "Handyman services in Tarpon Springs, FL for household repairs, drywall, doors, painting and mounting. Request an estimate with project photos.", description: "Household maintenance and suitable non-permit handyman repairs in Tarpon Springs.", localIntro: "Tarpon Springs projects are reviewed from the actual task and location. Photos help clarify the requested repair, existing condition and any permit or licensed-trade considerations before next steps are discussed.", estimateAdvice: "Share the Tarpon Springs location, clear photos, dimensions and any known material or product information.", serviceFocus: ["Interior repair and finish work", "Doors, trim and hardware", "Mounting and household maintenance"] },
  { slug: "pinellas-park", name: "Pinellas Park", metaDescription: "Handyman services in Pinellas Park, FL for drywall, doors, painting, mounting and practical home repairs. Send photos for an estimate.", description: "Residential handyman repairs and installations in Pinellas Park.", localIntro: "Pinellas Park homeowners can send one detailed request for a single project or several related repairs. The existing condition and access help determine the appropriate next step.", estimateAdvice: "Include the Pinellas Park location, wide and close-up photos, measurements and product links when relevant.", serviceFocus: ["Drywall and painting preparation", "Door and trim repairs", "Mounting and grouped punch lists"] },
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
  { title: "Deck Repair & Maintenance", slug: "deck-repair", image: "/projects/gray-deck-repair-after.webp", description: "Deck board replacement, surface improvements and small non-structural repairs, reviewed from project photos.", includes: ["Replace suitable deck boards", "Surface and trim repairs", "Deck cleaning and finishing", "Review visible damage and repair scope"] },
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
