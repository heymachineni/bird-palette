import type { Metadata } from "next";
import { InfoBackLink } from "@/components/layout/info-back-link";
import { InfoEmailLink } from "@/components/layout/info-links";
import { InfoPageFooter } from "@/components/layout/info-page-footer";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of service for Bird Palette.",
};

export default function TermsPage() {
  return (
    <div className="container pb-24 pt-3 sm:pt-5">
      <article className="mx-auto max-w-xl pt-2 sm:pt-4">
        <InfoBackLink />

        <h1 className="mt-8 font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
          Terms
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: June 19, 2026
        </p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-muted-foreground">
          <section>
            <p>
              We are building the kind of site we want to use: simple, calm, and
              free to wander. These terms follow the same idea. They exist to be
              clear, not to bury you in legalese.
            </p>
            <p className="mt-3">
              Questions or feedback? We would love to hear from you at{" "}
              <InfoEmailLink email="heymachineni@gmail.com" />.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-foreground">
              Terms of Service
            </h2>
            <p className="mt-3">
              These Terms govern your use of Bird Palette. By using the site, you
              agree to them. We have tried to write them in plain language.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-foreground">
              Using Bird Palette
            </h2>
            <p className="mt-3">
              Bird Palette is a free, static site for browsing bird plumage
              colors. There are no accounts, subscriptions, or payments. Use it
              for inspiration, learning, and exploration.
            </p>
            <p className="mt-3">
              Please do not use the site for anything illegal, and do not
              scrape or republish the dataset or images at scale without
              permission. Bird photos and credits belong to their original
              sources, not to us.
            </p>
            <p className="mt-3">
              The site is offered for educational and exploratory purposes, not
              for commercial reuse of the compiled data or imagery.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-foreground">
              Colors and accuracy
            </h2>
            <p className="mt-3">
              Palettes are sampled from each bird&apos;s photo. Lighting, pose,
              season, and background can all affect what shows up. A bit of
              background may appear in a palette now and then. We are still
              improving this.
            </p>
            <p className="mt-3">
              You can also hover a bird&apos;s photo and copy a color directly
              from the image. That is often the most precise way to grab a shade
              you care about.
            </p>
            <p className="mt-3">
              We do our best, but we do not guarantee that every hex or palette
              is perfect for every use.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-foreground">
              Third-party content
            </h2>
            <p className="mt-3">
              Bird names, photos, and some descriptions come from BirdNET,
              iNaturalist, and Wikipedia. Your browser loads those directly from
              those services. Their terms and licenses apply to that content.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-foreground">
              Our work and your use
            </h2>
            <p className="mt-3">
              The Bird Palette site, design, and curated data presentation are
              our work. You are welcome to browse and take inspiration. You may
              not copy the site wholesale, mirror the dataset, or pass our work
              off as your own product without permission.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-foreground">
              Availability and changes
            </h2>
            <p className="mt-3">
              We work to keep Bird Palette online, but the site is provided
              &ldquo;as is.&rdquo; Features may change, break briefly, or
              improve over time. We may update these Terms; if we do, we will
              post the new version here with an updated date.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-foreground">Liability</h2>
            <p className="mt-3">
              Bird Palette is a small personal project. We are not liable for
              indirect or consequential damages from using the site. If you rely
              on a color for something important, verify it yourself.
            </p>
            <p className="mt-3">
              Nothing here limits consumer rights that apply to you under local
              law where those rights cannot be waived.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg text-foreground">Contact</h2>
            <p className="mt-3">
              Questions about these Terms?{" "}
              <InfoEmailLink email="heymachineni@gmail.com" />.
            </p>
          </section>

          <p className="text-xs leading-relaxed text-muted-foreground/70">
            We&apos;re not lawyers, and these Terms may not be perfect. If you
            spot an issue or have suggestions, please let us know.
          </p>
        </div>

        <InfoPageFooter />
      </article>
    </div>
  );
}
