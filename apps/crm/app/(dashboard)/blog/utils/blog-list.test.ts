import { describe, expect, test } from "bun:test";
import { blogPosts } from "../data/blog-seeds";
import {
  countWithoutImage,
  getCategoryNames,
  getPrimaryCategory,
  getTotalViews,
} from "./blog-list";

describe("blog list helpers", () => {
  test("totals views and lists categories", () => {
    expect(getTotalViews(blogPosts)).toBe(2630);
    expect(getCategoryNames(blogPosts)).toHaveLength(5);
  });

  test("uses the first category and counts drafts without image", () => {
    expect(getPrimaryCategory(blogPosts[0] as (typeof blogPosts)[number])).toBe("Comunidad");
    expect(countWithoutImage(blogPosts)).toBe(2);
  });
});
