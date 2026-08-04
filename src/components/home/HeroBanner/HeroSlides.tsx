/*
|--------------------------------------------------------------------------
| HeroSlides
|--------------------------------------------------------------------------
| Aquí se guardan TODOS los banners del Hero.
| Para agregar uno nuevo solamente añade otro objeto al array.
|--------------------------------------------------------------------------
*/

export interface HeroSlide {
  title: string;
  subtitle: string;

  image: string;

  buttonText: string;

  buttonColor: string;
  buttonHover: string;
  indicatorColor: string;

  url: string;
}

export const heroSlides: HeroSlide[] = [
  {
    title: "Comunidad de Discord",

    subtitle: "Interactúa con los seguidores, enterate de los anuncios y habla con los creadores.",

    image: "/HeroSection/Max-wpp1.png",

    buttonText: "Ir al servidor de Discord",

    buttonColor: "bg-[#5865F2]",
    buttonHover: "hover:bg-[#4752C4]",
    indicatorColor: "bg-green-400",

    url: "https://discord.gg/Ef86ndx33f",
  },

  {
    title: "Canal de YouTube",

    subtitle:
      "Descubre nuestros proyectos, videos y toda la comunidad desde YouTube.",

    image: "/HeroSection/YT-wpp2.png",

    buttonText: "Ir al canal de YouTube",

    buttonColor: "bg-red-600",
    buttonHover: "hover:bg-red-700",
    indicatorColor: "bg-green-400",

    url: "https://www.youtube.com/@maxhuang117",
  },

  {
    title: "Streams en Twitch",

    subtitle:
      "Únete a los directos y comparte con toda la comunidad en vivo.",

    image: "/HeroSection/Twitch-wpp3.png",

    buttonText: "Ir al canal de Twitch",

    buttonColor: "bg-[#9146FF]",
    buttonHover: "hover:bg-[#7C3AED]",
    indicatorColor: "bg-green-400",

    url: "https://www.twitch.tv/maxhuang117",
  },
];