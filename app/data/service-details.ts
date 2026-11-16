type Faq = { question: string; answer: string };
export type ServiceDetail = {
  intro: string;
  planning: string;
  whatWeDo: string[];
  estimateTip: string;
  faqs: Faq[];
  scopeDetails?: { title: string; text: string }[];
};

export const serviceDetails: Record<string, ServiceDetail> = {
  "door-repair": {
    intro: "Doors that stick, rub, sag, or won't latch can make everyday life frustrating. We work on common interior door repairs, hardware adjustments, trim, and suitable non-permit installation projects in the Tampa Bay area.",
    planning: "The right repair depends on where the door rubs, how the latch meets the strike plate, the condition of the hinges and whether the frame has shifted. Photos of the full door and problem area help narrow it down.",
    whatWeDo: ["Adjust and align interior doors", "Replace hinges, knobs, and handles", "Fix loose trim and minor finish damage", "Install suitable interior doors and hardware"],
    estimateTip: "Send a photo of the entire door, the hinges, and the gap or latch that is giving you trouble.",
    faqs: [
      { question: "Why is my door sticking or difficult to close?", answer: "Humidity, loose hinges, settling, or paint buildup can all contribute. The right fix depends on where the door rubs and whether the opening has changed." },
      { question: "Can you repair a door that no longer latches?", answer: "Often, yes. Adjustment of hinges, the strike plate, or hardware may help. Photos make an initial assessment easier." },
      { question: "Do you replace exterior doors?", answer: "Exterior replacements that require a permit or a licensed contractor are referred to an appropriately licensed professional." },
    ],
  },
  "drywall-repair": {
    intro: "Drywall damage can come from removed fixtures, access openings, impacts, moisture after the source is resolved, or everyday wear. We handle suitable wall and ceiling patches, surface preparation and texture blending across Tampa Bay.",
    planning: "A useful repair plan starts with the size and location of the damage, the nearby texture, and what caused the opening. Any active leak or moisture problem needs to be resolved before the surface is closed and finished.",
    whatWeDo: ["Patch small-to-medium wall and ceiling holes", "Repair suitable cracks and damaged drywall edges", "Prepare repaired surfaces for primer and paint", "Blend common wall and ceiling textures where feasible"],
    estimateTip: "Include one close-up photo and one wider photo showing the damaged wall and nearby texture.",
    scopeDetails: [
      { title: "Wall and ceiling openings", text: "Photos should show the opening, nearby framing or fixtures, surrounding texture and approximate dimensions." },
      { title: "Texture and paint finish", text: "A close texture match may be possible, but lighting, existing coatings and previous repairs affect the final appearance." },
      { title: "Water-related damage", text: "The leak or moisture source must be resolved before cosmetic drywall repair. Mold remediation requires the appropriate specialist." },
    ],
    faqs: [
      { question: "Can patched drywall match the old texture?", answer: "We can often get a close match. Exact results depend on the original material, texture, lighting, and paint sheen." },
      { question: "Can you fix drywall after a TV mount is removed?", answer: "Yes, many small wall patches and finish repairs are suitable handyman projects." },
      { question: "Do you handle mold damage?", answer: "Mold remediation and unresolved water-damage conditions require the appropriate specialist before cosmetic repairs." },
      { question: "Can you patch a ceiling opening after plumbing or fixture access?", answer: "Many suitable access openings can be patched after the underlying licensed work and any moisture issue are complete. Send a wide photo, close-up and dimensions for review." },
    ],
  },
  "interior-painting": {
    intro: "Refresh rooms, trim, and walls without turning your home upside down. We focus on careful preparation, protection of surfaces, and clean edges.",
    planning: "Room dimensions, wall condition, color changes, sheen and the amount of preparation all affect the scope. Photos in normal lighting help show existing damage and the surfaces to be painted.",
    whatWeDo: ["Paint individual rooms and interior walls", "Prepare minor surface defects", "Paint trim and baseboards", "Handle touch-ups and accent walls"],
    estimateTip: "Share room dimensions, a few wall photos, and whether you're changing the current color.",
    faqs: [
      { question: "Do you include paint in the estimate?", answer: "Labor can be quoted separately from paint and materials. Any supplied materials are discussed before the job." },
      { question: "Can small holes be patched first?", answer: "Yes, minor prep work can often be included in the painting scope." },
      { question: "How do you price a room?", answer: "Pricing is based on the surfaces, preparation, number of coats, access, and other project details rather than a simple hourly rate." },
    ],
  },
  "flooring-installation": {
    intro: "Luxury vinyl plank and laminate floors can transform a space. We focus on clean layouts, transitions, trim, and finish details for appropriate residential flooring projects.",
    planning: "Before installation, it helps to confirm the product, square footage, room layout, transitions and condition of the existing floor. Significant subfloor problems may require work outside a typical installation scope.",
    whatWeDo: ["Install LVP and laminate flooring", "Add transitions and shoe molding", "Replace small sections of suitable flooring", "Review subfloor readiness and layout"],
    estimateTip: "Send your approximate square footage, photos of the current floor, and the product you plan to install.",
    faqs: [
      { question: "Can you install flooring supplied by the homeowner?", answer: "Yes, installation can be quoted for suitable customer-supplied LVP or laminate products." },
      { question: "What if the floor is uneven?", answer: "Floor preparation requirements are checked before installation; significant structural or specialty work may need a qualified contractor." },
      { question: "Are transitions and baseboards included?", answer: "They can be included in the written scope after the details are reviewed." },
    ],
  },
  "tv-mounting": {
    intro: "Get a securely mounted TV with a clean, practical setup. We check wall type, mount compatibility, TV size, and installation height before work begins.",
    planning: "TV size and weight, bracket type, wall construction, mounting height and cable plan should all be confirmed before installation. New in-wall electrical work must be handled by a licensed electrician.",
    whatWeDo: ["Mount compatible TVs on suitable walls", "Install brackets and soundbars", "Use external cord covers for tidy cables", "Help select appropriate mounting hardware"],
    estimateTip: "Share your TV size, bracket model, wall type, and a photo of the intended location.",
    faqs: [
      { question: "Can you conceal TV wires inside the wall?", answer: "Any work requiring new in-wall electrical wiring or a receptacle must be performed by a licensed electrician. Surface cable covers may be an option." },
      { question: "Can you mount a large TV?", answer: "It depends on the size, weight, wall construction, and suitable mounting hardware. Very large or unusually heavy TVs may require extra help or fall outside the available scope." },
      { question: "Do I need to buy a bracket first?", answer: "You can send the TV model and wall photo so we can discuss an appropriate mount." },
    ],
  },
  "furniture-assembly": {
    intro: "Beds, storage units, desks, and wardrobes all have their own assembly requirements. We review the model and instructions to provide a realistic fixed project estimate.",
    planning: "The model number or product link is the best way to estimate assembly work. Large wardrobes, wall beds and items that require anchoring need more review than a basic desk or bed frame.",
    whatWeDo: ["Assemble beds and bed frames", "Assemble cabinets and storage furniture", "Build desks and shelving units", "Set up suitable patio furniture"],
    estimateTip: "Include the product link or model number and the assembly manual if you have it.",
    faqs: [
      { question: "Can you assemble furniture bought online?", answer: "Yes. Product links and assembly instructions are useful for assessing the complexity." },
      { question: "Is a Murphy bed priced like a standard bed?", answer: "Not necessarily. Built-in and complicated mechanisms can take substantially more work, so we review the instructions before quoting." },
      { question: "Do you anchor furniture?", answer: "Furniture anchoring can be discussed based on the model, wall construction, and appropriate hardware." },
    ],
  },
  "plumbing-repairs": {
    intro: "Some household fixture replacements and minor adjustments are suitable handyman projects. We focus on clearly defined, non-permit work and refer regulated plumbing tasks to licensed professionals.",
    planning: "Straightforward fixture replacement may fit handyman scope when the existing connections are in usable condition and no pipes need to be moved. Active leaks, concealed plumbing and regulated work need a licensed plumber.",
    whatWeDo: ["Replace suitable faucets and showerheads", "Install bathroom accessories", "Replace fixtures where allowed without pipe alterations", "Assist with minor non-regulated adjustments"],
    estimateTip: "Send a picture of the fixture, the existing connections, and the replacement product.",
    faqs: [
      { question: "Do you relocate water lines?", answer: "No. In-wall plumbing, line relocations, and permit-required work should be completed by a licensed plumber." },
      { question: "Can you install a new faucet?", answer: "Many straightforward fixture replacements may be possible, subject to the local licensing requirements and condition of the existing connections." },
      { question: "What about an active leak inside the wall?", answer: "Contact a licensed plumber promptly to diagnose and repair a concealed leak." },
    ],
  },
  "fence-repair": {
    intro: "Weather and regular use can loosen fence pickets, panels and gate hardware. We handle clearly scoped, non-structural fence and gate repairs across Tampa Bay when the work does not require permitted construction.",
    planning: "Fence repairs are evaluated from the condition of the pickets, rails, gate frame, posts and hardware. A loose hinge is a different project from a damaged post or a new permitted fence installation.",
    whatWeDo: ["Adjust suitable sagging gates and latches", "Repair or replace damaged pickets and fence sections", "Replace suitable hinges, fasteners and gate hardware", "Review minor wood fence maintenance and finish repairs"],
    estimateTip: "Share wide and close-up photos, approximate panel dimensions, and whether the post itself is damaged.",
    scopeDetails: [
      { title: "Fence sections and pickets", text: "Wide photos help show how much of the fence is affected; close-ups show rot, splits, fasteners and framing condition." },
      { title: "Gate alignment and hardware", text: "Include the hinges, latch, gate frame and the point where the gate drags or no longer closes correctly." },
      { title: "Scope and permitting", text: "New fence construction, structural work and projects requiring permits must be handled under the appropriate local requirements." },
    ],
    faqs: [
      { question: "Can a sagging gate be repaired?", answer: "Sometimes hinges, bracing, or latch adjustments are sufficient. A damaged post or frame may change the repair plan." },
      { question: "Do you repair wood fences?", answer: "Yes, suitable repairs to wood panels and gates can be quoted from photos and measurements." },
      { question: "Do you handle permitted fence construction?", answer: "Projects requiring permits or a licensed contractor are outside our handyman scope." },
      { question: "What photos are needed for a fence repair estimate?", answer: "Send the full fence or gate, both sides where accessible, close-ups of damaged wood or hardware, approximate dimensions and photos of any affected post." },
    ],
  },
  "general-handyman-services": {
    intro: "A practical solution for a collection of small home repairs and installations. Send your punch list and photos so each task can be scoped and priced clearly.",
    planning: "A numbered punch list with one or two photos per task makes it easier to review several small jobs together. Include product links for anything that needs to be installed or assembled.",
    whatWeDo: ["Install blinds and curtain rods", "Adjust doors and replace hardware", "Hang suitable shelves and accessories", "Handle small home maintenance punch lists"],
    estimateTip: "A numbered task list with one or two photos per item helps us prepare a clear project quote.",
    faqs: [
      { question: "Can you combine several repairs in one visit?", answer: "Often yes. A consolidated task list makes quoting and scheduling more efficient." },
      { question: "Do you charge by the hour?", answer: "We generally use project-based estimates so the scope and price are agreed in advance." },
      { question: "What work do you not offer?", answer: "Licensed electrical, structural, roofing, gas, HVAC, and permit-required work must be handled by appropriately licensed contractors." },
    ],
  },
  "deck-repair": {
    intro: "Deck boards and outdoor finishes weather quickly in Florida. We handle clearly defined, suitable non-structural repairs, surface maintenance and finishing, with permit-required or structural work referred to licensed professionals.",
    planning: "Photos of the whole deck, damaged boards, stairs and visible supports help distinguish a surface repair from structural work. Structural changes and permit-required construction need the appropriate contractor.",
    whatWeDo: ["Replace suitable damaged deck boards", "Restore outdoor deck finishes", "Repair minor surface trim", "Assess whether the project needs a permit or specialist"],
    estimateTip: "Send several photos of the damaged area, the whole deck, approximate dimensions and close-ups of its supports.",
    faqs: [
      { question: "Can you replace a few damaged deck boards?", answer: "Yes, where the work is non-structural and suitable for a handyman. We'll review the existing deck before quoting." },
      { question: "Do you build new decks?", answer: "New construction can involve structural design and permitting. Work requiring a licensed contractor must be handled by a properly licensed professional." },
      { question: "Can you paint or stain an outdoor deck?", answer: "Suitable surface preparation and finishing can be included after inspecting the existing coating and wood condition." },
    ],
  },
  "exterior-painting": {
    intro: "Florida sun and moisture can be hard on exterior paint and trim. We help with surface preparation, exterior painting and suitable non-structural finish repairs.",
    planning: "Exterior scope depends on the condition of the coating, access, surface material and preparation required. Wide photos and close-ups of peeling paint or damaged trim are both useful.",
    whatWeDo: ["Paint exterior siding and suitable trim", "Prepare peeling and weathered surfaces", "Refresh storage sheds and exterior details", "Handle minor non-structural finish repairs"],
    estimateTip: "Send wide photos of each wall, detail shots of peeling paint and the building's approximate dimensions.",
    faqs: [
      { question: "Can you paint a shed or exterior trim?", answer: "Yes, suitable painting and cosmetic preparation can be estimated after photos and site details are reviewed." },
      { question: "Do you replace structural siding or roof components?", answer: "No. Structural, roofing and permit-required work needs an appropriately licensed contractor." },
      { question: "Do materials come with the price?", answer: "Paint, primer and other materials can be quoted separately and supplied with receipts where applicable." },
    ],
  },
};
