import { createImageUrlBuilder } from "@sanity/image-url";
import { defineQuery } from "groq";
import { sanityClient } from "sanity:client";
import type { SocialLinks } from "@/types";

const builder = createImageUrlBuilder(sanityClient);
type SanityImageSource = Parameters<typeof builder.image>[0];
const SITE_AUTHOR_NAME = "Wei Che Hsu";
let siteAuthorPromise: Promise<SanityAuthor | null> | undefined;

export type SanityAuthor = {
  _id?: string;
  name?: string;
  slug?: string;
  bio?: any[] | string;
  image?: SanityImageSource;
  social?: SocialLinks;
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

const AUTHOR_BY_NAME_QUERY =
  defineQuery(`*[_type == "author" && name == $name][0] {
  _id,
  name,
  "slug": slug.current,
  bio,
  image,
  "social": {
    "email": coalesce(contact.email, email, social.email),
    "github": coalesce(contact.github, github, social.github),
    "linkedIn": coalesce(contact.linkedin, contact.linkedIn, linkedIn, linkedin, social.linkedIn, social.linkedin)
  }
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

export async function getSanityAuthorByName(name: string) {
  return await sanityClient.fetch<SanityAuthor | null>(AUTHOR_BY_NAME_QUERY, {
    name,
  });
}

export function getSanitySiteAuthor() {
  siteAuthorPromise ??= getSanityAuthorByName(SITE_AUTHOR_NAME);
  return siteAuthorPromise;
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
