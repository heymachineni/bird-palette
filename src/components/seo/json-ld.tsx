import { DEFAULT_DESCRIPTION, HOME_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";

export function JsonLd() {
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: ["birdpalette", "Bird Palette App"],
      description: DEFAULT_DESCRIPTION,
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      description: DEFAULT_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "10,000+ bird plumage color palettes",
        "Search by bird name or hex color",
        "Proportional color bars and copy-ready swatches",
        "Bird sound recordings",
        "Related palette discovery",
      ],
    },
    {
      "@type": "CreativeWork",
      "@id": `${SITE_URL}/#catalog`,
      name: HOME_TITLE,
      description:
        "A searchable catalog of bird plumage colors and natural color combinations extracted from species photographs.",
      url: SITE_URL,
      about: [
        { "@type": "Thing", name: "Bird plumage" },
        { "@type": "Thing", name: "Color palette" },
        { "@type": "Thing", name: "Ornithology" },
      ],
      keywords:
        "bird palette, bird plumage colors, colors of birds, color combination of birds",
    },
  ];

  const json = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
