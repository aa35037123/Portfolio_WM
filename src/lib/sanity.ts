import { createImageUrlBuilder } from "@sanity/image-url";
import { defineQuery } from "groq";
import { sanityClient } from "sanity:client";

const builder = createImageUrlBuilder(sanityClient);
type SanityImageSource = Parameters<typeof builder.image>[0];

export type SanityAuthor = {
  name?: string;
  slug?: string;
};

export type SanityCategory = {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
};

export type SanityPostListItem = {
  _id: string;
  title?: string;
  slug?: string;
  description?: string;
  publishedAt?: string;
  mainImage?: SanityImageSource;
  author?: SanityAuthor;
  categories?: SanityCategory[];
};

export type SanityPost = SanityPostListItem & {
  body?: any[];
};

const POSTS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)] | order(publishedAt desc, _createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  description,
  publishedAt,
  mainImage,
  author->{name, "slug": slug.current},
  categories[]->{title, "slug": slug.current}
}`);

const CATEGORIES_QUERY =
  defineQuery(`*[_type == "category" && defined(slug.current)] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  "count": count(*[_type == "post" && references(^._id)])
}`);

const POST_SLUGS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)] {
  "params": {"entry": slug.current}
}`);

const CATEGORY_SLUGS_QUERY =
  defineQuery(`*[_type == "category" && defined(slug.current)] {
  "params": {"category": slug.current}
}`);

const POST_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  publishedAt,
  mainImage,
  body,
  author->{name, "slug": slug.current},
  categories[]->{title, "slug": slug.current}
}`);

const POSTS_BY_CATEGORY_QUERY = defineQuery(`*[
  _type == "post" &&
  defined(slug.current) &&
  $category in categories[]->slug.current
] | order(publishedAt desc, _createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  description,
  publishedAt,
  mainImage,
  author->{name, "slug": slug.current},
  categories[]->{title, "slug": slug.current}
}`);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export async function getSanityPosts() {
  return await sanityClient.fetch<SanityPostListItem[]>(POSTS_QUERY);
}

export async function getSanityCategories() {
  return await sanityClient.fetch<(SanityCategory & { count: number })[]>(
    CATEGORIES_QUERY,
  );
}

export async function getSanityPostSlugs() {
  return await sanityClient.fetch<{ params: { entry: string } }[]>(
    POST_SLUGS_QUERY,
  );
}

export async function getSanityCategorySlugs() {
  return await sanityClient.fetch<{ params: { category: string } }[]>(
    CATEGORY_SLUGS_QUERY,
  );
}

export async function getSanityPost(slug: string) {
  return await sanityClient.fetch<SanityPost | null>(POST_QUERY, { slug });
}

export async function getSanityPostsByCategory(category: string) {
  return await sanityClient.fetch<SanityPostListItem[]>(
    POSTS_BY_CATEGORY_QUERY,
    { category },
  );
}
