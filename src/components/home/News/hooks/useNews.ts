"use client";

import { useState } from "react";

/*
|--------------------------------------------------------------------------
| useNews
|--------------------------------------------------------------------------
| Controla qué tarjeta está desplegada.
|--------------------------------------------------------------------------
*/

export function useNews(){

    const [opened,setOpened]=useState<number|null>(null);

    function toggle(id:number){

        setOpened(prev=>prev===id?null:id);

    }

    return{

        opened,

        toggle,

    };

}