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

    const currentNews = news[current];

    if (!currentNews) {
        return null;
    }

    return (
        <div className="mx-auto mt-16 flex max-w-md items-center gap-3 px-3">

            <NewsNavigation
                direction="previous"
                onClick={previous}
            />

            <div className="min-w-0 flex-1">
                <NewsCard
                    news={currentNews}
                    onOpenComments={() => onOpenComments(currentNews)}
                />
            </div>

            <NewsNavigation
                direction="next"
                onClick={next}
            />

        </div>
    );
}