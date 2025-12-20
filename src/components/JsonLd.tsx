// JSON-LD Structured Data for SEO
export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Inkora',
    url: 'https://inkora.spacely.tech',
    description:
      'Read manga and manhwa online for free. Discover thousands of titles updated daily.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://inkora.spacely.tech/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Inkora',
    url: 'https://inkora.spacely.tech',
    logo: 'https://inkora.spacely.tech/icon-512.png',
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface ManhwaJsonLdProps {
  title: string;
  description: string;
  image: string;
  url: string;
  genres?: string[];
  rating?: number;
  author?: string;
}

export function ManhwaJsonLd({
  title,
  description,
  image,
  url,
  genres = [],
  rating,
  author,
}: ManhwaJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ComicSeries',
    name: title,
    description: description,
    image: image,
    url: url,
    genre: genres,
    ...(rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating,
        bestRating: 10,
        worstRating: 0,
      },
    }),
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
