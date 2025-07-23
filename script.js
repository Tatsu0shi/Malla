window.onload = async function () {
  const cursos = await fetch('./data.json').then(r => r.json());
  const colores = await fetch('./colores.json').then(r => r.json());

  crearLeyenda(colores);
  crearSemestres(cursos, colores);
};

function crearLeyenda(colores) {
  const legend = document.getElementById("legend-items");
  for (const depto in colores) {
      const color = colores[depto].color;
      const item = document.createElement("li");

      const colorBox = document.createElement("span");
      colorBox.style.backgroundColor = color;

      item.appendChild(colorBox);
      item.appendChild(document.createTextNode(depto));
      legend.appendChild(item);
  }
}

function crearSemestres(cursos, colores) {
  const container = document.getElementById("semesters-container");
  const cursosPorSemestre = agruparPorSemestre(cursos);

  for (const semestre in cursosPorSemestre) {
      const divSemestre = document.createElement("div");
      divSemestre.className = "semester";

      const titulo = document.createElement("h3");
      titulo.textContent = `Semestre ${semestre}`;
      divSemestre.appendChild(titulo);

      const contCursos = document.createElement("div");
      contCursos.className = "courses";

      cursosPorSemestre[semestre].forEach(curso => {
          const bloque = document.createElement("div");
          bloque.className = "course";
          bloque.textContent = `${curso.sigla}<br>${curso.nombre}`;

          const colorDepto = colores[curso.departamento]?.color || "#999";

          bloque.style.backgroundColor = colorDepto;
          bloque.style.borderColor = shadeColor(colorDepto, -20); // Borde más oscuro
          contCursos.appendChild(bloque);
      });

      divSemestre.appendChild(contCursos);
      container.appendChild(divSemestre);
  }
}

function agruparPorSemestre(cursos) {
  const mapa = {};
  cursos.forEach(curso => {
      const sem = curso.semestre || "Otro";
      if (!mapa[sem]) mapa[sem] = [];
      mapa[sem].push(curso);
  });
  return mapa;
}

function shadeColor(color, percent) {
  let f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = (f >> 8) & 0x00FF,
      B = f & 0x0000FF;
  return "#" + (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
  ).toString(16).slice(1);
}