/*
|--------------------------------------------------------------------------
| Capas oscuras
|--------------------------------------------------------------------------
| Hace que el texto siempre sea legible.
|--------------------------------------------------------------------------
*/

export default function HeroOverlay() {

  return (
    <>

      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"/>

      <div className="absolute inset-0 bg-gradient-to-l from-black via-transparent to-transparent"/>

    </>
  );

}