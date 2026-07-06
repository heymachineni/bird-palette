import type { Metadata } from "next";
import { CaseStudyPage } from "@/components/casestudy/case-study-page";
import { InfoBackLink } from "@/components/layout/info-back-link";

import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Case study",
  pathname: "/casestudy",
  description:
    "How Bird Palette turns bird plumage photographs into searchable color palettes — pipeline, design decisions, and color extraction from nature.",
});

export default function CaseStudyRoute() {
  return (
    <div className="container pb-24 pt-3 sm:pt-5">
      <article className="mx-auto max-w-xl pt-2 sm:pt-4">
        <InfoBackLink />
        <CaseStudyPage />
      </article>
    </div>
  );
}
