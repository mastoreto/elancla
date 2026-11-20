/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    site?: import('@ancla/content').SiteConfig;
    /** The requested section is in maintenance: the Layout renders the section notice. */
    sectionMaintenance?: boolean;
  }
}
