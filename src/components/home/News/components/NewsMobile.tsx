"use client";

import { News } from "../data/NewsData";
import NewsCard from "./NewsCard";
import NewsNavigation from "./NewsNavigation";

interface Props {

    news: News[];

    current: number;

    opened: number | null;

    toggle: (id: number) => void;

    previous: () => void;

    next: () => void;

}

/*
|--------------------------------------------------------------------------
| Vista móvil
|--------------------------------------------------------------------------
*/

export default function NewsMobile({

    news,

    current,

    opened,

    toggle,

    previous,

    next,

}: Props) {

    return (

        <div className="mx-auto mt-16 max-w-md px-6">

            <NewsCard

                news={news[current]}

                opened={opened === news[current].id}

                onToggle={() => toggle(news[current].id)}

            />

            <NewsNavigation

                previous={previous}

                next={next}

            />

        </div>

    );

}