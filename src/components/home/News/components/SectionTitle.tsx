/*
|--------------------------------------------------------------------------
| Título de sección
|--------------------------------------------------------------------------
*/
console.log("SectionTitle: Novedades cargado");

interface Props {

  title: string;

  subtitle: string;

}

export default function SectionTitle({

  title,

  subtitle,

}: Props) {

  return (

    <div className="mb-16 text-center">

      <h2
        className="
          text-5xl
          font-black
          text-white
        "
      >
        {title}
      </h2>

      <p
        className="
          mx-auto
          mt-5
          max-w-2xl
          text-gray-400
          text-lg
        "
      >
        {subtitle}
      </p>

    </div>

  );

}