"use client";

import { PERMISSIONS } from "@ancla/contracts";
import { useAccess } from "@/lib/authz/AccessProvider";
import { can } from "@/lib/authz/can";
import { cn } from "@/lib/utils";
import type { TaxonomyData } from "../../types";
import { CategoryCard } from "../category-card";
import { SeriesCard } from "../series-card";

const taxonomyPageContentBlogPage = {
  container: cn("flex flex-col gap-[18px]"),
};

/** The two taxonomy cards of the blog: categories and series. */
export function TaxonomyPageContent({ categories, series, site }: TaxonomyData) {
  const access = useAccess();
  const canEdit = can(access, PERMISSIONS.blogPosts.edit);
  return (
    <div className={taxonomyPageContentBlogPage.container}>
      <CategoryCard canEdit={canEdit} categories={categories} site={site} />
      <SeriesCard canEdit={canEdit} series={series} site={site} />
    </div>
  );
}
