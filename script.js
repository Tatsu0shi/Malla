// Esperamos a que el DOM cargue
window.addEventListener("DOMContentLoaded", async () => {
    const data = await fetch("data.json").then(r => r.json());
    const colors = await fetch("colors.json").then(r => r.json());
  
    const nodes = new vis.DataSet();
    const edges = new vis.DataSet();
  
    // 1. Creamos los nodos
    for (const [semestre, asignaturas] of Object.entries(data)) {
      for (const ramo of asignaturas) {
        const [codigo, nombre, creditos, depto, prereq, paridad] = ramo;
        const [color, deptoNombre] = colors[depto] || ["#cccccc", "Desconocido"];
  
        nodes.add({
          id: codigo,
          label: `${codigo}\n${nombre}`,
          title: `Créditos: ${creditos} | Depto: ${deptoNombre}`,
          group: depto,
          color: color
        });
  
        // 2. Agregamos aristas según los prerrequisitos
        for (const req of prereq) {
          edges.add({ from: req, to: codigo, arrows: "to" });
        }
      }
    }
  
    // 3. Creamos la red
    const container = document.getElementById("network");
    const network = new vis.Network(container, { nodes, edges }, {
      nodes: {
        shape: "box",
        font: { size: 12 }
      },
      layout: {
        hierarchical: {
          direction: "UD",
          sortMethod: "directed"
        }
      },
      physics: false
    });
  
    // 4. Mostrar info al hacer clic
    network.on("click", function (params) {
      if (params.nodes.length > 0) {
        const node = nodes.get(params.nodes[0]);
        document.getElementById("info").innerText = node.title;
      }
    });
  });
  