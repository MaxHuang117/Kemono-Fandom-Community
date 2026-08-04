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

    onOpenComments: (news: News) => void;

    commentsCount: number;

}

/*
|--------------------------------------------------------------------------
| Vista móvil
|--------------------------------------------------------------------------
*/

export default function NewsMobile({

    news,

    current,

    previous,

    next,
    
    onOpenComments,

}: Props) {

    return (

        <div className="mx-auto mt-16 max-w-md px-6">

            <NewsCard

                news={news[current]}
                onOpenComments={() => onOpenComments(news[current])}

            />

            <NewsNavigation

                previous={previous}

                next={next}

            />

        </div>

    );

}