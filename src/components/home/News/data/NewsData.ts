/*
|--------------------------------------------------------------------------
| NewsData
|--------------------------------------------------------------------------
| Todas las novedades de la comunidad.
| En el futuro el panel de administración llenará este array.
|--------------------------------------------------------------------------
*/

export interface News {

  id: number;

  title: string;

  description: string;

  image: string;

  date: string;

}

export const newsData: News[] = [

  {

    id:1,

    title:"Proyecto del SENA",

    description:
      "Este proyecto web KFC fue desarrollado originalmente para la formación en el SENA, pero seguirá estando disponible para toda la comunidad.",

    image:"/News/SENA-b.png",

    date:"20 Jul 2026",

  },

];