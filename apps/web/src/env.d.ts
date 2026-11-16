/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    site?: import('@ancla/content').SiteConfig;
  }
}
