import type {MetadataRoute} from "next";
import {getBaseUrl} from "@/lib/common/Constants";

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/auth/password-reset`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/pricing/pricing`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/pricing/purchase`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/ai`,
      lastModified: new Date(),
    },
  ];
}
