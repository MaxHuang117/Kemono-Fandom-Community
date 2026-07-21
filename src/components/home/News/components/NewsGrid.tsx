"use client";

import NewsCard from "./NewsCard";
import { News } from "../data/NewsData";

interface Props {

    news: News[];

    opened: number | null;

    toggle: (id: number) => void;

}

/*
|--------------------------------------------------------------------------
| Grid de Noticias
|--------------------------------------------------------------------------
| Vista de escritorio.
|--------------------------------------------------------------------------
*/

export default function NewsGrid({

    news,

    opened,

    toggle,

}: Props) {

    return (

<div
    className="
        mx-auto
        mt-16
        flex
        flex-wrap
        justify-center
        items-start
        gap-8
        max-w-[1400px]
        px-8
    "
>
    {news.map((item) => (
        <div
            key={item.id}
            className="
                w-full
                md:w-[46%]
                xl:w-[31%]
            "
        >
            <NewsCard
                news={item}
                opened={opened === item.id}
                onToggle={() => toggle(item.id)}
            />
        </div>
    ))}
</div>

    );

}