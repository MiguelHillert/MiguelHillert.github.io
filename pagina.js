// Uso de IIFE para encapsular código y evitar variables globales
(async function() {
    'use strict';
    
    // Cache de películas
    let peliculas = [];
    let loading = true;
    
    // Referencias DOM
    const listaPeliculas = document.getElementById("lista-peliculas");
    const formularioBusqueda = document.getElementById("formulario-busqueda");
    const inputCategoria = document.getElementById("categoria");
    const btnMostrarTodas = document.getElementById("btn-mostrar-todas");
    const estadoCarga = document.getElementById("estado-carga");
    
    // Añadir intersectionObserver para lazy loading
    const observador = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observador.unobserve(img);
        }
      });
    }, {
      rootMargin: '200px',
      threshold: 0.1
    });
    
    // Cargar datos JSON con manejo de errores mejorado
    async function cargarPeliculas() {
      try {
        const respuesta = await fetch("peliculas.json");
        
        if (!respuesta.ok) {
          throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        return datos.peliculas || [];
      } catch (error) {
        console.error("Error al cargar las películas:", error);
        mostrarError(`No se pudieron cargar las películas: ${error.message}`);
        return [];
      } finally {
        loading = false;
      }
    }
    
    // Inicializar la aplicación
    async function inicializar() {
      // Configurar event listeners
      formularioBusqueda.addEventListener("submit", (e) => {
        e.preventDefault();
        buscarPorCategoria();
      });
      
      btnMostrarTodas.addEventListener("click", () => {
        inputCategoria.value = "";
        mostrarPeliculas();
      });
      
      // Añadir soporte para navegación por teclado
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          inputCategoria.value = "";
          mostrarPeliculas();
        }
      });
      
      // Cargar datos
      peliculas = await cargarPeliculas();
      mostrarPeliculas();
    }
    
    // Normalizar texto para búsquedas (eliminar acentos, espacios extra y convertir a minúscula)
    function normalizarTexto(texto) {
      return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    }
    
    // Buscar películas por categoría
    function buscarPorCategoria() {
      const categoria = inputCategoria.value.trim();
      
      if (!categoria) {
        mostrarPeliculas();
        return;
      }
      
      const categoriaNormalizada = normalizarTexto(categoria);
      
      const resultados = peliculas.filter(pelicula => 
        normalizarTexto(pelicula.categoria) === categoriaNormalizada
      );
      
      mostrarPeliculas(resultados);
      
      // Anunciar resultados para lectores de pantalla
      const mensaje = resultados.length > 0 
        ? `Se encontraron ${resultados.length} películas en la categoría ${categoria}`
        : `No se encontraron películas en la categoría ${categoria}`;
        
      anunciarParaLectoresDepantalla(mensaje);
    }
    
    // Mostrar películas con optimizaciones de rendimiento
    function mostrarPeliculas(lista = peliculas) {
      // Limpiar contenedor
      listaPeliculas.innerHTML = "";
      
      if (loading) {
        listaPeliculas.innerHTML = '<p id="estado-carga" role="status">Cargando películas...</p>';
        return;
      }
      
      if (lista.length === 0) {
        listaPeliculas.innerHTML = '<p role="status">No se encontraron películas.</p>';
        return;
      }
      
      // Usar DocumentFragment para mejor rendimiento
      const fragmento = document.createDocumentFragment();
      
      // Crear elementos para cada película
      lista.forEach((pelicula, index) => {
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("pelicula");
        tarjeta.setAttribute("tabindex", "0");
        
        // Crear elementos antes de añadirlos al DOM (mejor rendimiento)
        const img = document.createElement("img");
        
        // Si está en las primeras 4 imágenes, cargar inmediatamente
        // Las demás con lazy loading
        if (index < 4) {
          img.src = pelicula.imagen;
        } else {
          img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23333'/%3E%3C/svg%3E";
          img.dataset.src = pelicula.imagen;
          observador.observe(img);
        }
        
        img.alt = `Póster de ${pelicula.titulo}`;
        img.loading = index < 4 ? "eager" : "lazy";
        img.width = 200;
        img.height = 300;
        
        const titulo = document.createElement("h3");
        titulo.textContent = pelicula.titulo;
        
        const meta = document.createElement("span");
        meta.textContent = `${pelicula.categoria} - ${pelicula.anio}`;
        
        // Añadir elementos al contenedor
        tarjeta.appendChild(img);
        tarjeta.appendChild(titulo);
        tarjeta.appendChild(meta);
        
        fragmento.appendChild(tarjeta);
      });
      
      // Añadir todo de una vez (reduce reflows)
      listaPeliculas.appendChild(fragmento);
    }
    
    // Mostrar error
    function mostrarError(mensaje) {
      listaPeliculas.innerHTML = `<p role="alert">${mensaje}</p>`;
    }
    
    // Anunciar para lectores de pantalla
    function anunciarParaLectoresDepantalla(mensaje) {
      const anuncio = document.createElement("div");
      anuncio.setAttribute("role", "status");
      anuncio.setAttribute("aria-live", "polite");
      anuncio.classList.add("visually-hidden");
      anuncio.textContent = mensaje;
      
      document.body.appendChild(anuncio);
      
      // Eliminar después de un tiempo
      setTimeout(() => {
        document.body.removeChild(anuncio);
      }, 3000);
    }
    
    // Iniciar la aplicación cuando el DOM esté listo
    document.addEventListener("DOMContentLoaded", inicializar);
  })();
