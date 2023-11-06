"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Cargar todos los productos de la base de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
document.addEventListener("DOMContentLoaded", () => obtenerCategoriasBD())
//Saber si tengo que regresar
const url = new URL(window.location.href);
const regresar = url.searchParams.get("regresar");
let nombre
let precio
let categoria
let nota
let codigoBarras

switch(regresar){
    case "nuevoProducto.html":
        nombre = decodeURIComponent(url.searchParams.get("nombre"))
        console.log(nombre)
        precio = decodeURIComponent(url.searchParams.get("precio"))
        console.log(precio)
        categoria = decodeURIComponent(url.searchParams.get("categoria"))
        console.log(categoria)
        nota = decodeURIComponent(url.searchParams.get("nota"))
        console.log(nota)
        codigoBarras = decodeURIComponent(url.searchParams.get("codigoBarras"))
        console.log(codigoBarras)
        break;
}

function obtenerCategoriasBD() {
    bdCategoria.allDocs({
        include_docs: true
    }).then(documentos => {
        const contenedorCategorias = document.querySelector("tbody")
        contenedorCategorias.innerHTML = ""
        for (let i = 0; i < documentos.rows.length; i++) {
            let categoriaDB = documentos.rows[i].doc;
            const categoriaHTML = document.createElement("div")
            categoriaHTML.classList.add("categoria")
            categoriaHTML.innerHTML = `
            <p>${categoriaDB.categoria}</p>
            `
            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("botones")

            const botonEditar = document.createElement("button")
            botonEditar.classList.add("btn", "btn-warning", "btn-block")
            botonEditar.innerText = "Editar"

            botonEditar.onclick = () => {
                var nuevaCategoria = prompt('Ingrese el nuevo nombre de la categoría: ');
                if (nuevaCategoria !== null && nuevaCategoria.trim() !== '') {
                    categoriaDB.categoria = nuevaCategoria
                    bdCategoria.put(categoriaDB).then(respuesta => {
                        if (respuesta.ok) {
                            swal({
                                icon: 'success',
                                title: 'Categoría actualizada',
                            });
                            obtenerCategoriasBD();
                        }
                    });
                } else {
                    swal({
                        icon: 'error',
                        title: 'Error',
                        text: 'El nombre de categoría no puede estar vacío',
                    });
                }
            }

            const botonEliminar = document.createElement("button")
            botonEliminar.classList.add("btn", "btn-danger", "btn-block")
            botonEliminar.innerText = "Eliminar"

            botonEliminar.onclick = () => {
                if (confirm("¿Está seguro de eliminar este producto?")) {
                    bdCategoria.remove(categoriaDB)
                    obtenerCategoriasBD()
                }
            }

            contenedorBotones.appendChild(botonEditar)
            contenedorBotones.appendChild(botonEliminar)
            categoriaHTML.appendChild(contenedorBotones)

            contenedorCategorias.appendChild(categoriaHTML)
        }
    });
}

const botonAgregarCategoria = document.querySelector("#agregarCategoria")
botonAgregarCategoria.onclick = () => {
    if(regresar != null)
        window.location.href = `../pages/nuevaCategoria.html?regresar=${regresar}&nombre=${encodeURIComponent(nombre)}&precio=${encodeURIComponent(precio)}&categoria=${encodeURIComponent(categoria)}&nota=${encodeURIComponent(nota)}&codigoBarras=${encodeURIComponent(codigoBarras)}`
    else
        window.location.href = "../pages/nuevaCategoria.html"
}
