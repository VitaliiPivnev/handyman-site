import { business } from "../data/business";

export default function BusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: business.name,
    url: "https://handymantampa.net/",
    telephone: business.phone,
    areaServed: ["Westchase", "Citrus Park", "Town 'n' Country", "Oldsmar", "Odessa", "Tampa", "Clearwater", "Largo", "St. Petersburg"].map(
      (name) => ({ "@type": "Place", name: `${name}, FL, USA` })
    ),
    sameAs: ["https://www.thumbtack.com/fl/tampa/handyman/vitalii-handypro/service/528569101242605578"],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
