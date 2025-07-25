window.onload = async function () {
  const dataSemestres = await fetch('./data.json').then(r => r.json());
  const colores = await fetch('./colores.json').then(r => r.json());

  const cursos = convertirDatosAEstructuraEsperada(dataSemestres);
  
  // Almacenar todos los cursos en un objeto para fácil acceso por código
  const allCourses = {};
  cursos.forEach(curso => {
      allCourses[curso.codigo] = { ...curso, approved: false, element: null };
  });

  crearLeyenda(colores);
  crearSemestres(allCourses, colores);
  updateCourseStates(allCourses);

  // Añadir evento de clic al documento para manejar la aprobación de cursos
  document.addEventListener("click", (event) => {
      const cursoDiv = event.target.closest(".curso");
      if (cursoDiv) {
          const cursoCodigo = cursoDiv.dataset.codigo;
          if (cursoCodigo && allCourses[cursoCodigo]) {
              allCourses[cursoCodigo].approved = !allCourses[cursoCodigo].approved;
              updateCourseStates(allCourses);
          }
      }
  });
};

function convertirDatosAEstructuraEsperada(dataSemestres) {
  const cursos = [];
  for (const [semestreKey, cursosArray] of Object.entries(dataSemestres)) {
      const numeroSemestre = parseInt(semestreKey.replace('s', ''));
      cursosArray.forEach(cursoArray => {
          const [codigo, nombre, creditos, departamento, prerrequisitos, estado] = cursoArray;
          cursos.push({
              codigo: codigo,
              nombre: nombre,
              creditos: creditos,
              departamento: departamento,
              prerrequisitos: prerrequisitos,
              estado: estado,
              semestre: numeroSemestre
          });
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

function crearSemestres(allCourses, colores) {
  const container = document.getElementById("semesters-container");
  const cursosPorSemestre = {};
  for (const codigo in allCourses) {
      const curso = allCourses[codigo];
      const semestreKey = `s${curso.semestre}`;
      if (!cursosPorSemestre[semestreKey]) {
          cursosPorSemestre[semestreKey] = [];
      }
      cursosPorSemestre[semestreKey].push(curso);
  }

  const semesterKeys = Object.keys(cursosPorSemestre).sort((a, b) => parseInt(a.replace("s", "")) - parseInt(b.replace("s", "")));

  for (const semesterKey of semesterKeys) {
      const semestre = cursosPorSemestre[semesterKey];
      if (!semestre || semestre.length === 0) continue;
      
      const semesterDiv = document.createElement("div");
      semesterDiv.classList.add("semester");
      semesterDiv.innerHTML = `<h2>Semestre ${semesterKey.replace("s", "")}</h2>`;
      semestre.forEach(curso => {
          const cursoDiv = document.createElement("div");
          cursoDiv.classList.add("curso");
          cursoDiv.dataset.codigo = curso.codigo; // Guardar el código del curso en el dataset
          
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
          allCourses[curso.codigo].element = cursoDiv; // Guardar referencia al elemento DOM
      });
      container.appendChild(semesterDiv);
  }
}

function updateCourseStates(allCourses) {
  for (const codigo in allCourses) {
      const curso = allCourses[codigo];
      const cursoDiv = curso.element;

      if (curso.approved) {
          cursoDiv.classList.add("approved");
      } else {
          cursoDiv.classList.remove("approved");
      }

      // Verificar prerrequisitos para habilitar/deshabilitar
      let canBeTaken = true;
      if (curso.prerrequisitos && curso.prerrequisitos.length > 0) {
          for (const prerrequisitoCodigo of curso.prerrequisitos) {
              if (allCourses[prerrequisitoCodigo] && !allCourses[prerrequisitoCodigo].approved) {
                  canBeTaken = false;
                  break;
              }
          }
      }

      if (canBeTaken) {
          cursoDiv.classList.remove("disabled");
      } else {
          cursoDiv.classList.add("disabled");
      }
  }
}




