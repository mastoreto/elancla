import { createRouter } from "../../core/createApp";
import { categoriesRoutes } from "./categories.routes";
import { postsRoutes } from "./posts.routes";
import { seriesRoutes } from "./series.routes";

export const blogRoutes = createRouter()
  .route("/", postsRoutes)
  .route("/", categoriesRoutes)
  .route("/", seriesRoutes);
