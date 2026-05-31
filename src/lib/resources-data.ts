// All content is fully translatable via tr() — no hardcoded strings in body text.
// List items use "\n" as separator; split on "\n" to render each item.

export type ArticleCategory = "resume" | "interview" | "salary" | "career" | "networking";

export type ArticleSection = {
  headingKey: string;
  bodyKey?: string;     // text + tip sections
  itemsKey?: string;    // list sections — value is newline-separated items
  type: "text" | "tip" | "list";
};

export type Article = {
  id: number;
  slug: string;
  category: ArticleCategory;
  image: string;
  minutes: number;
  featured: boolean;
  titleKey: string;
  descKey: string;
  introKey: string;
  sections: ArticleSection[];
  conclusionKey: string;
};

export const articles: Article[] = [
  {
    id: 1, slug: "resume-that-gets-hired", category: "resume",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=600&fit=crop",
    minutes: 7, featured: true,
    titleKey: "art1Title", descKey: "art1Desc", introKey: "art1Intro",
    sections: [
      { headingKey: "art1S1Head", bodyKey: "art1S1Body", type: "text" },
      { headingKey: "art1S2Head", itemsKey: "art1S2Items", type: "list" },
      { headingKey: "art1S3Head", bodyKey: "art1S3Body", type: "text" },
      { headingKey: "art1S4Head", bodyKey: "art1S4Body", type: "tip" },
      { headingKey: "art1S5Head", itemsKey: "art1S5Items", type: "list" },
    ],
    conclusionKey: "art1Concl",
  },
  {
    id: 2, slug: "resume-mistakes", category: "resume",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=600&fit=crop",
    minutes: 5, featured: false,
    titleKey: "art2Title", descKey: "art2Desc", introKey: "art2Intro",
    sections: [
      { headingKey: "art2S1Head", bodyKey: "art2S1Body", type: "text" },
      { headingKey: "art2S2Head", bodyKey: "art2S2Body", type: "text" },
      { headingKey: "art2S3Head", bodyKey: "art2S3Body", type: "tip" },
      { headingKey: "art2S4Head", itemsKey: "art2S4Items", type: "list" },
      { headingKey: "art2S5Head", bodyKey: "art2S5Body", type: "text" },
    ],
    conclusionKey: "art2Concl",
  },
  {
    id: 3, slug: "tell-me-about-yourself", category: "interview",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=600&fit=crop",
    minutes: 10, featured: true,
    titleKey: "art3Title", descKey: "art3Desc", introKey: "art3Intro",
    sections: [
      { headingKey: "art3S1Head", bodyKey: "art3S1Body", type: "text" },
      { headingKey: "art3S2Head", bodyKey: "art3S2Body", type: "tip" },
      { headingKey: "art3S3Head", itemsKey: "art3S3Items", type: "list" },
      { headingKey: "art3S4Head", bodyKey: "art3S4Body", type: "text" },
      { headingKey: "art3S5Head", itemsKey: "art3S5Items", type: "list" },
    ],
    conclusionKey: "art3Concl",
  },
  {
    id: 4, slug: "common-interview-questions", category: "interview",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&h=600&fit=crop",
    minutes: 8, featured: false,
    titleKey: "art4Title", descKey: "art4Desc", introKey: "art4Intro",
    sections: [
      { headingKey: "art4S1Head", bodyKey: "art4S1Body", type: "text" },
      { headingKey: "art4S2Head", itemsKey: "art4S2Items", type: "list" },
      { headingKey: "art4S3Head", bodyKey: "art4S3Body", type: "tip" },
      { headingKey: "art4S4Head", itemsKey: "art4S4Items", type: "list" },
    ],
    conclusionKey: "art4Concl",
  },
  {
    id: 5, slug: "salary-negotiation", category: "salary",
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&h=600&fit=crop",
    minutes: 6, featured: true,
    titleKey: "art5Title", descKey: "art5Desc", introKey: "art5Intro",
    sections: [
      { headingKey: "art5S1Head", bodyKey: "art5S1Body", type: "text" },
      { headingKey: "art5S2Head", bodyKey: "art5S2Body", type: "tip" },
      { headingKey: "art5S3Head", itemsKey: "art5S3Items", type: "list" },
      { headingKey: "art5S4Head", itemsKey: "art5S4Items", type: "list" },
    ],
    conclusionKey: "art5Concl",
  },
  {
    id: 6, slug: "salary-guide-2026", category: "salary",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=600&fit=crop",
    minutes: 4, featured: false,
    titleKey: "art6Title", descKey: "art6Desc", introKey: "art6Intro",
    sections: [
      { headingKey: "art6S1Head", itemsKey: "art6S1Items", type: "list" },
      { headingKey: "art6S2Head", itemsKey: "art6S2Items", type: "list" },
      { headingKey: "art6S3Head", itemsKey: "art6S3Items", type: "list" },
      { headingKey: "art6S4Head", bodyKey: "art6S4Body", type: "tip" },
    ],
    conclusionKey: "art6Concl",
  },
  {
    id: 7, slug: "skills-recruiters-want", category: "career",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop",
    minutes: 9, featured: true,
    titleKey: "art7Title", descKey: "art7Desc", introKey: "art7Intro",
    sections: [
      { headingKey: "art7S1Head", itemsKey: "art7S1Items", type: "list" },
      { headingKey: "art7S2Head", bodyKey: "art7S2Body", type: "text" },
      { headingKey: "art7S3Head", itemsKey: "art7S3Items", type: "list" },
      { headingKey: "art7S4Head", bodyKey: "art7S4Body", type: "tip" },
    ],
    conclusionKey: "art7Concl",
  },
  {
    id: 8, slug: "junior-to-senior", category: "career",
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=600&fit=crop",
    minutes: 7, featured: false,
    titleKey: "art8Title", descKey: "art8Desc", introKey: "art8Intro",
    sections: [
      { headingKey: "art8S1Head", bodyKey: "art8S1Body", type: "text" },
      { headingKey: "art8S2Head", itemsKey: "art8S2Items", type: "list" },
      { headingKey: "art8S3Head", bodyKey: "art8S3Body", type: "text" },
      { headingKey: "art8S4Head", bodyKey: "art8S4Body", type: "tip" },
    ],
    conclusionKey: "art8Concl",
  },
  {
    id: 9, slug: "professional-network-ethiopia", category: "networking",
    image: "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=1200&h=600&fit=crop",
    minutes: 6, featured: false,
    titleKey: "art9Title", descKey: "art9Desc", introKey: "art9Intro",
    sections: [
      { headingKey: "art9S1Head", bodyKey: "art9S1Body", type: "text" },
      { headingKey: "art9S2Head", itemsKey: "art9S2Items", type: "list" },
      { headingKey: "art9S3Head", bodyKey: "art9S3Body", type: "tip" },
      { headingKey: "art9S4Head", itemsKey: "art9S4Items", type: "list" },
    ],
    conclusionKey: "art9Concl",
  },
  {
    id: 10, slug: "linkedin-for-ethiopians", category: "networking",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop",
    minutes: 5, featured: false,
    titleKey: "art10Title", descKey: "art10Desc", introKey: "art10Intro",
    sections: [
      { headingKey: "art10S1Head", itemsKey: "art10S1Items", type: "list" },
      { headingKey: "art10S2Head", bodyKey: "art10S2Body", type: "text" },
      { headingKey: "art10S3Head", bodyKey: "art10S3Body", type: "tip" },
      { headingKey: "art10S4Head", itemsKey: "art10S4Items", type: "list" },
    ],
    conclusionKey: "art10Concl",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(article: Article, count = 3): Article[] {
  const sameCategory = articles.filter((a) => a.id !== article.id && a.category === article.category);
  const other = articles.filter((a) => a.id !== article.id && a.category !== article.category);
  return [...sameCategory, ...other].slice(0, count);
}
