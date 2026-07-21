/*
|--------------------------------------------------------------------------
| Collaborators
|--------------------------------------------------------------------------
| Todos los colaboradores de la comunidad.
| Más adelante estos datos vendrán desde Supabase.
|--------------------------------------------------------------------------
*/

export interface Collaborator {

  id: number;
  name: string;
  avatar: string;
  banner: string;
  color: string;
  bio: string;
  twitch: string;
  discord: string;

}

export interface Amigo {
  id: number;
  name: string;
  avatar: string;
  banner: string;
  color: string;
  bio: string;

}

export const collaborators: Collaborator[] = [

  {
    id: 1,

    name: "Mati",
    avatar: "/Collaborators/Mati.png",
    banner: "/Collaborators/Mati-b.png",
    color: "#ff2424",
    twitch: "https://twitch.tv/Matipinguin23",
    discord: "Matipinguin23",

    bio:
      "Uno de los colaboradores principales activo en Twitch. Fue el primero que Max conoció.",

  },

  {
    id: 2,
    name: "Tomaxh",
    avatar: "/Collaborators/Tomaxh.png",
    banner: "/Collaborators/Tomaxh-b.png",
    color: "#ffaa2c",
    twitch: "https://twitch.tv/Tomaxh",
    discord: "Tomaxh",

    bio:
      "Uno de los colaboradores principales activo en Twitch, su presencia es indispensable.",

  },

  {
    id: 3,
    name: "Haise",
    avatar: "/Collaborators/Haise.jpg",
    banner: "/Collaborators/Haise.jpg",
    color: "#58ff2e",
    twitch: "",
    discord: "",

    bio:
      "Amigo argentino, de los principales activos en el grupo privado de Discord.",

  },

  {
    id: 4,
    name: "Toshi",
    avatar: "/Collaborators/Toshi.jpg",
    banner: "/Collaborators/Toshi.jpg",
    color: "#ffffff",
    twitch: "",
    discord: "",

    bio:
      "Amigo Ecuatoriano, siempre dispuesto a pasar un buen rato cada que se pasa.",

  },

  {
    id: 5,
    name: "Thiz",
    avatar: "/Collaborators/Thiz.jpg",
    banner: "/Collaborators/Thiz.jpg",
    color: "#f8fc2b",
    twitch: "",
    discord: "",

    bio:
      "Amigo Mexicano, su humor siempre esta presente en las llamadas.",

  },

];