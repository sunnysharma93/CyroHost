export type Availability = "published" | "enquiry" | "unconfirmed";

export type Cta = {
  label: string;
  href: string;
  external?: boolean;
};

export type Plan = {
  name: string;
  price: string;
  summary: string;
  features: string[];
};

export type CatalogProduct = {
  name: string;
  summary: string;
  sourceHref?: string;
  sourceLabel?: string;
  facts: string[];
  plans?: Plan[];
};

export type ServiceDocument = {
  id: string;
  path: string;
  group: string;
  kicker: string;
  title: string;
  lede: string;
  availability: Availability;
  what: string;
  who: string[];
  capabilities: { title: string; body: string }[];
  technical: string[];
  workloads: string[];
  products?: CatalogProduct[];
  pricingNote?: string;
  links?: { label: string; href: string; description: string; external?: boolean }[];
  faqs: { question: string; answer: string }[];
  primaryCta: Cta;
  secondaryCta?: Cta;
  related: { label: string; href: string }[];
  seoTitle: string;
  seoDescription: string;
};
