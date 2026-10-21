export type Brand = {
  id: string;
  name: string;
  nameLatin: string;
  tagline: string;
  description: string;

  phone: string;
  phoneRaw: string;
  whatsapp: string;

  address: { venue: string; pavilion: string; street: string; city: string };
  mapEmbed: string;
  mapLink: string;
  hours: { open: string; close: string; closedDays: number[] };

  social: { instagram?: string; instagramHandle?: string; facebook?: string };

  logo: string | null;
  icons: { icon: string; apple: string };
  images: {
    hero: string;
    og: string;
    fallback: string;
    notFound: string;
    store: { src: string; alt: string }[];
  };

  place: { in: string; to: string };
  hero: { title: string; text: string };
  quickSearches: string[];

  benefits: { icon: "advice" | "original" | "chat" | "order"; title: string; text: string }[];
  steps: { title: string; text: string }[];
  testimonials: { name: string; text: string; rating: number }[];
};
