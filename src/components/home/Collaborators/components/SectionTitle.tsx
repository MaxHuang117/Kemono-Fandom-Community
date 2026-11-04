/*
|--------------------------------------------------------------------------
| Título de sección
|--------------------------------------------------------------------------
*/

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
          text-4xl
          sm:text-5xl
          font-black
          text-white
        "
      >
        {title}
      </h2>

      <p
        className="
          mx-auto
          mt-3
          max-w-2xl
          text-gray-400
          text-base
          sm:text-lg
        "
      >
        {subtitle}
      </p>

    </div>

  );

}