export const baseUrl = "https://handymantampa.net";

export const cities = [
  {
    slug: "tampa",
    name: "Tampa",
    description:
      "We provide professional handyman services in Tampa, FL including Downtown, Ybor City, Westchase, and Channelside. Fast, reliable, and affordable home repairs for any project.",
  },
  {
    slug: "clearwater",
    name: "Clearwater",
    description:
      "Our handyman services in Clearwater cover residential homes, condos, and beach properties including Clearwater Beach and Countryside. Quick response and quality work guaranteed.",
  },
  {
    slug: "st-petersburg",
    name: "St. Petersburg",
    description:
      "Reliable handyman services in St. Petersburg, FL including Downtown St Pete, Gulfport, and surrounding neighborhoods. We handle repairs, installations, and home improvements.",
  },
  {
    slug: "brandon",
    name: "Brandon",
    description:
      "We offer handyman services in Brandon, FL for homeowners and rental properties. Serving Valrico, Bloomingdale, and nearby areas with fast and affordable repairs.",
  },
  {
    slug: "riverview",
    name: "Riverview",
    description:
      "Professional handyman services in Riverview, FL including Apollo Beach and Gibsonton. We provide fast home repairs, installations, and maintenance services.",
  },
  {
    slug: "wesley-chapel",
    name: "Wesley Chapel",
    description:
      "Handyman services in Wesley Chapel, FL for new homes and residential communities. We handle drywall repair, painting, mounting, and more with quick turnaround.",
  },
  {
    slug: "largo",
    name: "Largo",
    description:
      "Affordable handyman services in Largo, FL including Belleair and surrounding areas. We provide reliable home repairs, installations, and maintenance.",
  },
  {
    slug: "lutz",
    name: "Lutz",
    description:
      "Trusted handyman services in Lutz, FL including Cheval and nearby neighborhoods. We offer fast response and professional home repair solutions.",
  },
  {
    slug: "carrollwood",
    name: "Carrollwood",
    description:
      "Professional handyman services in Carrollwood, FL including Northdale and surrounding communities. Reliable home repairs, installations, and maintenance.",
  },
  {
    slug: "westchase",
    name: "Westchase",
    description:
      "Local handyman services in Westchase, Tampa, FL. We provide fast, high-quality home repairs and installations in one of Tampa’s most popular neighborhoods.",
  },
  {
    slug: "tarpon-springs",
    name: "Tarpon Springs",
    description:
      "Handyman services in Tarpon Springs, FL including residential and coastal homes. Reliable repairs, installations, and maintenance services.",
  },
  {
    slug: "palm-harbor",
    name: "Palm Harbor",
    description:
      "Professional handyman services in Palm Harbor, FL including Crystal Beach and surrounding areas. Fast and affordable home improvement solutions.",
  },
  {
    slug: "oldsmar",
    name: "Oldsmar",
    description:
      "Reliable handyman services in Oldsmar, FL for residential homes and properties. We provide efficient repairs and installation services.",
  },
  {
    slug: "dunedin",
    name: "Dunedin",
    description:
      "Handyman services in Dunedin, FL including coastal homes and residential areas. We handle repairs, installations, and maintenance with care.",
  },
  {
    slug: "safety-harbor",
    name: "Safety Harbor",
    description:
      "Professional handyman services in Safety Harbor, FL. We provide reliable home repairs, painting, mounting, and general maintenance.",
  },
  {
    slug: "pinellas-park",
    name: "Pinellas Park",
    description:
      "Affordable handyman services in Pinellas Park, FL. We offer quick and professional repairs, installations, and home improvements.",
  },
  {
    slug: "odessa",
    name: "Odessa",
    description:
      "Handyman services in Odessa, FL for residential homes and new developments. Reliable, fast, and high-quality home repair services.",
  },
];

export const services = [
  {
    title: "Door Repair & Installation",
    slug: "door-repair",
    image: "/services/door-repair.png",
    description: "Door repair and installation for interior and exterior doors.",
    includes: ["Interior door installation", "Door repair and adjustment", "Locks, handles, and hinges", "Trim and molding around doors"],
  },
  {
    title: "Drywall Repair",
    slug: "drywall-repair",
    image: "/services/drywall.png",
    description: "Drywall repair, patching, cracks, holes, and texture matching.",
    includes: ["Small and medium drywall patches", "Hole and crack repair", "Texture matching", "Wall repair before painting"],
  },
  {
    title: "Interior Painting",
    slug: "interior-painting",
    image: "/services/painting.png",
    description: "Interior painting for walls, ceilings, trim, and touch-ups.",
    includes: ["Room painting", "Accent walls", "Trim and baseboard painting", "Wall prep and touch-ups"],
  },
  {
    title: "Flooring Installation",
    slug: "flooring-installation",
    image: "/services/flooring.png",
    description: "Laminate, vinyl plank, and flooring installation services.",
    includes: ["Luxury vinyl plank installation", "Laminate flooring", "Floor trim and transitions", "Small flooring repairs"],
  },
  {
    title: "TV Mounting",
    slug: "tv-mounting",
    image: "/services/tv-mounting.png",
    description: "Secure TV mounting with clean setup and wire management.",
    includes: ["TV wall mounting", "Bracket installation", "Wire management", "Soundbar and accessory setup"],
  },
  {
    title: "Furniture Assembly",
    slug: "furniture-assembly",
    image: "/services/furniture.png",
    description: "Furniture assembly for IKEA, Amazon, cabinets, beds, and more.",
    includes: ["Beds, desks, and dressers", "Cabinets and shelves", "Patio furniture", "IKEA and Amazon furniture"],
  },
  {
    title: "Plumbing Repairs",
    slug: "plumbing-repairs",
    image: "/services/plumbing.png",
    description: "Small plumbing repairs, faucets, leaks, toilets, and drains.",
    includes: ["Faucet replacement", "Toilet repair", "Small leak repairs", "Garbage disposal replacement"],
  },
  {
    title: "Fence Repair",
    slug: "fence-repair",
    image: "/services/fence.png",
    description: "Fence repair, wood panels, posts, gates, and small installs.",
    includes: ["Fence panel repair", "Gate repair", "Post replacement", "Small wood fence projects"],
  },
  {
    title: "General Handyman Services",
    slug: "general-handyman-services",
    image: "/services/general.png",
    description: "General handyman services for small repairs and home projects.",
    includes: ["Small home repairs", "Installations", "Maintenance tasks", "Punch list projects"],
  },
];

export const cityNames = Object.fromEntries(
  cities.map((city) => [city.slug, city.name])
) as Record<string, string>;

export const serviceNames = Object.fromEntries(
  services.map((service) => [service.slug, service.title])
) as Record<string, string>;

export function formatSlugName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getCityName(slug: string) {
  return cityNames[slug] || formatSlugName(slug);
}

export function getServiceName(slug: string) {
  return serviceNames[slug] || formatSlugName(slug);
}

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
