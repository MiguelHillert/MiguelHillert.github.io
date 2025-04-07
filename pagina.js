let peliculas = [];

// Cargar datos desde el JSON
fetch('peliculas.json')
    .then(response => {
        if (!response.ok) throw new Error("No se pudo cargar el JSON");
        return response.json();
    })
    .then(data => {
        peliculas = data.peliculas;
        mostrarPeliculas();
    })
    .catch(error => console.error('Error al cargar JSON:', error));

// Buscar películas por categoría
function buscarPorCategoria() {
    const categoria = document.getElementById('categoria').value.trim();
    if (categoria === "") {
        alert("Introduce una categoría de película.");
        return;
    }

    const resultados = peliculas.filter(pelicula =>
        pelicula.categoria.localeCompare(categoria, 'es', { sensitivity: 'base' }) === 0
    );

    mostrarPeliculas(resultados);
}

// Mostrar películas (todas o filtradas)
function mostrarPeliculas(lista = peliculas) {
    const contenedor = document.getElementById('lista-peliculas');
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron películas.</p>';
        return;
    }

    lista.forEach(pelicula => {
        contenedor.innerHTML += `
            <div class="pelicula">
                <img src="${pelicula.imagen}" alt="${pelicula.titulo}">
                <h3>${pelicula.titulo}</h3>
                <span>Categoría: ${pelicula.categoria}</span>
                <span>Año: ${pelicula.anio}</span>
            </div>
        `;
    });
}
// Permitir búsqueda al pulsar Enter
document.getElementById("categoria").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        buscarPorCategoria();
    }
});
