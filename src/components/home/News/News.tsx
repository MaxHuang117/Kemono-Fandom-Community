"use client";

import { useEffect, useState } from "react";

import SectionTitle from "./components/SectionTitle";
import NewsGrid from "./components/NewsGrid";
import NewsMobile from "./components/NewsMobile";

import { newsData } from "./data/NewsData";

import { useNews } from "./hooks/useNews";
import { useNewsSlider } from "./hooks/useNewsSlider";

/*
|--------------------------------------------------------------------------
| Sección Novedades
|--------------------------------------------------------------------------
*/

export default function NovedadesSection() {

    const {

        opened,

        toggle,

    } = useNews();

    console.log("opened:", opened);

    const {

        current,

        next,

        previous,

    } = useNewsSlider(newsData.length);

    const [mobile, setMobile] = useState(false);

    useEffect(() => {

        function resize() {

            setMobile(window.innerWidth < 900);

        }

        resize();

        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);

    }, []);

    return (

        <section

            id="novedades"

            className="
                relative
                bg-black
                py-32
            "

        >

            <SectionTitle

                title="Novedades"

                subtitle="Entérate de lo más relevante de la comunidad."

            />

            {

                mobile

                ? (

                    <NewsMobile

                        news={newsData}

                        current={current}

                        opened={opened}

                        toggle={toggle}

                        previous={previous}

                        next={next}

                    />

                )

                : (

                    <NewsGrid

                        news={newsData}

                        opened={opened}

                        toggle={toggle}

                    />

                )

            }

        </section>

    );

}