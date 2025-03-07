import { RefreshRouteOnSave } from "@/app/(app)/components/RefreshRouteOnSave";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { getPayloadClient } from "@/payloadClient";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import styles from "./legal.module.css";
import { Legal, Page } from "@/payload-types";
import { Metadata } from "next";

// ISR LOGIC START -----------------------------------------------------------------

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true;

// generate static params for all legal pages at build time
export async function generateStaticParams() {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
        collection: "legal",
        depth: 1,
    });

    return docs.map((doc) => ({
        legal: (doc.page as Page).slug,
    }));
}

// ISR LOGIC END -----------------------------------------------------------------

interface Props {
    params: Promise<{
        legal: string;
    }>;
    searchParams: Promise<{
        [key: string]: string | string[];
    }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const legalPage = await getLegalPage((await params).legal);
    if (!legalPage) return { title: "404: Page Not Found" };
    const page = legalPage.page as Page;

    return {
        title: `${page.title}`,
        description: page.seoDescription,
    };
}

async function getLegalPage(slug: string): Promise<Legal | null> {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
        collection: "legal",
        where: {
            "page.slug": {
                equals: slug,
            },
        },
        depth: 1,
        limit: 1,
    });
    return docs[0] || null;
}

export default async function LegalPage({ params }: Props) {
    const page = await getLegalPage((await params).legal);
    if (!page) {
        notFound();
    }

    return (
        <Fragment>
            <RefreshRouteOnSave />
            <section className="rounded-xl px-[10vw] py-[10vh] md:px-[15vw] lg:px-[20vw]">
                <article className={styles.legalContent}>
                    <RichText data={page.content as SerializedEditorState} />
                </article>
            </section>
        </Fragment>
    );
}
