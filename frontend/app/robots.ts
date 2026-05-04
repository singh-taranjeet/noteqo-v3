import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register"],
      disallow: ["/notes/", "/library/", "/trash/", "/assets/"],
    },
    sitemap: "https://noteqo.com/sitemap.xml",
  };
}
