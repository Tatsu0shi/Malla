window.onload = async function () {
  const dataSemestres = await fetch('./data.json').then(r => r.json());
  const colores = await fetch('./colores.json').then(r => r.json());

  // Convertir la estructura de datos a la esperada por las funciones
  const cursos = convertirDatosAEstructuraEsperada(dataSemestres);
  
  crearLeyenda(colores);
  crearSemestres(cursos, colores);
};

function convertirDatosAEstructuraEsperada(dataSemestres) {
  const cursos = [];
  
  // Iterar sobre cada semestre
  for (const [semestreKey, cursosArray] of Object.entries(dataSemestres)) {
      const numeroSemestre = parseInt(semestreKey.replace('s', ''));
      
      // Iterar sobre cada curso en el semestre
      cursosArray.forEach(cursoArray => {
          const [codigo, nombre, creditos, departamento, prerrequisitos, estado] = cursoArray;
          
          const curso = {
              codigo: codigo,
              nombre: nombre,
              creditos: creditos,
              departamento: departamento,
              prerrequisitos: prerrequisitos,
              estado: estado,
              semestre: numeroSemestre
          };
          
          cursos.push(curso);
      });
  }
  
  return cursos;
}

function crearLeyenda(colores) {
  const legend = document.getElementById("legend-items");
  for (const depto in colores) {
      const [color, nombre] = colores[depto];
      const item = document.createElement("li");

      const colorBox = document.createElement("span");
      colorBox.style.backgroundColor = color;

      item.appendChild(colorBox);
      item.appendChild(document.createTextNode(nombre || depto));
      legend.appendChild(item);
  }
}

function crearSemestres(cursos, colores) {
  console.log("Cursos recibidos:", cursos.length);

  const container = document.getElementById("semesters-container");
  const cursosPorSemestre = agruparPorSemestre(cursos);

  for (let i = 0; i < cursosPorSemestre.length; i++) {
      const semestre = cursosPorSemestre[i];
      if (!semestre || semestre.length === 0) continue;
      
      const semesterDiv = document.createElement("div");
      semesterDiv.classList.add("semester");
      semesterDiv.innerHTML = `<h2>Semestre ${i + 1}</h2>`;

      semestre.forEach(curso => {
          const cursoDiv = document.createElement("div");
          cursoDiv.classList.add("curso");
          cursoDiv.draggable = true;
          
          // Obtener color del departamento
          const colorInfo = colores[curso.departamento];
          const color = colorInfo ? colorInfo[0] : '#ddd';
          cursoDiv.style.borderLeftColor = color;
          
          cursoDiv.innerHTML = `
              <h3>${curso.codigo} - ${curso.nombre}</h3>
              <p><strong>Departamento:</strong> ${curso.departamento}</p>
              <p><strong>Créditos:</strong> ${curso.creditos}</p>
              <p><strong>Prerrequisitos:</strong> ${curso.prerrequisitos.length > 0 ? curso.prerrequisitos.join(", ") : "Ninguno"}</p>
          `;
          semesterDiv.appendChild(cursoDiv);
      });
      container.appendChild(semesterDiv);
  }
}

function agruparPorSemestre(cursos) {
  const semestres = [];
  cursos.forEach(curso => {
      if (!semestres[curso.semestre - 1]) {
          semestres[curso.semestre - 1] = [];
      }
      semestres[curso.semestre - 1].push(curso);
  });
  return semestres;
}

// Drag and drop functionality
let dragged;

document.addEventListener("dragstart", (event) => {
  if (event.target.classList.contains("curso")) {
      dragged = event.target;
      event.target.classList.add("dragging");
  }
});

document.addEventListener("dragend", (event) => {
  if (event.target.classList.contains("curso")) {
      event.target.classList.remove("dragging");
  }
});

document.addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.addEventListener("drop", (event) => {
  event.preventDefault();
  if (event.target.classList.contains("semester") && dragged) {
      event.target.appendChild(dragged);
      dragged = null;
  }
});