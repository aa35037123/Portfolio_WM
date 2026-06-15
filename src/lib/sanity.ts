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
  tags?: string[];
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
  categories[]->{title, "slug": slug.current},
  tags
}`);

const CATEGORIES_QUERY =
  defineQuery(`*[_type == "category" && defined(slug.current)] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  "count": count(*[_type == "post" && references(^._id)])
}`);

const TAGS_QUERY = defineQuery(
  `array::unique(*[_type == "post" && defined(tags)].tags[])[] | order(@ asc)`,
);

const POST_SLUGS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)] {
  "params": {"entry": slug.current}
}`);

const CATEGORY_SLUGS_QUERY =
  defineQuery(`*[_type == "category" && defined(slug.current)] {
  "params": {"category": slug.current}
}`);

const TAG_SLUGS_QUERY =
  defineQuery(`array::unique(*[_type == "post" && defined(tags)].tags[])[] {
  "params": {"tag": @}
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
  categories[]->{title, "slug": slug.current},
  tags
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
  categories[]->{title, "slug": slug.current},
  tags
}`);

const POSTS_BY_TAG_QUERY = defineQuery(`*[
  _type == "post" &&
  defined(slug.current) &&
  $tag in tags[]
] | order(publishedAt desc, _createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  description,
  publishedAt,
  mainImage,
  author->{name, "slug": slug.current},
  categories[]->{title, "slug": slug.current},
  tags
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

export async function getSanityTags() {
  return await sanityClient.fetch<string[]>(TAGS_QUERY);
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

export async function getSanityTagSlugs() {
  return await sanityClient.fetch<{ params: { tag: string } }[]>(
    TAG_SLUGS_QUERY,
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

export async function getSanityPostsByTag(tag: string) {
  return await sanityClient.fetch<SanityPostListItem[]>(POSTS_BY_TAG_QUERY, {
    tag,
  });
}
