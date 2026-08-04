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

  {

    id:2,

    title:"Comentarios en las Novedades",

    description:
      "Registra tu cuenta para obtener beneficios en las proximas actualizaciones!",

    image:"/News/Comment-b.png",

    date:"4 Ago 2026",

  },
];