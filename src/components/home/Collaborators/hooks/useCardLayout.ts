"use client";

import { useEffect, useState } from "react";

/*
|--------------------------------------------------------------------------
| Layout Responsive
|--------------------------------------------------------------------------
| Calcula automáticamente la distribución de la baraja.
|--------------------------------------------------------------------------
*/

export function useCardLayout(total: number) {

  const [mobile, setMobile] = useState(false);

  useEffect(() => {

    function update() {

      // Puedes cambiar 900 por el ancho que prefieras
      setMobile(window.innerWidth < 900);

    }

    update();

    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);

  }, []);

  function getX(index: number, expanded: boolean) {

    // En móvil no usamos desplazamiento horizontal
    if (mobile) return 0;

    return expanded
      ? index * 270 - ((total - 1) * 135)
      : index * 70;

  }

  function getY(index: number, expanded: boolean) {

    if (!mobile) return 0;

    return expanded
      ? index * 260
      : index * 55;

  }

  function getRotation(index: number, expanded: boolean) {

    if (mobile) return 0;

    if (expanded) return 0;

    return -6 + index * 3;

  }

  function getHeight(expanded: boolean) {

  if (!mobile) return 470;

  const cardHeight = 420;
  const collapsedOffset = 45;
  const expandedOffset = 260;

  if (expanded) {
    return cardHeight + (total - 1) * expandedOffset;
  }

  return cardHeight + (total - 1) * collapsedOffset;

}

function getButtonMargin(expanded: boolean) {

    if (!mobile)
        return 40;

    return expanded
        ? total * 70 - 40
        : 40;

}

  return {

    mobile,

    getX,

    getY,

    getRotation,

    getHeight,

    getButtonMargin,

  };

}