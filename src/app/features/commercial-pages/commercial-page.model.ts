export interface EditorialImage {
  src: string;
  title: string;
  alt: string;
  width: number;
  height: number;
}

export interface EditorialAction { label: string; href: string; }

export interface CommercialContent {
  heading: string;
  intro: string[];
  heroActions: EditorialAction[];
  catalogHeading: string;
  cards: { name: string; image: EditorialImage; price: string; action: EditorialAction }[];
  sections: {
    heading: string;
    blocks: { heading: string; paragraphs: string[] }[];
    images: EditorialImage[];
    actions: EditorialAction[];
  }[];
  faqs: { question: string; answer: string }[];
}
