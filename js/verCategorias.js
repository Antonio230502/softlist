"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Cargar todos los productos de la base de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
const bdProductos = new PouchDB("tiendita_Productos");
const bdLista = new PouchDB("tiendita_listas");
document.addEventListener("DOMContentLoaded", () => obtenerCategoriasBD())
//Saber si tengo que regresar
const url = new URL(window.location.href);
const regresar = url.searchParams.get("regresar");
let nombre
let precio
let categoria
let nota
let codigoBarras

switch (regresar) {
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
            if (categoriaDB.categoria != "Sin categoría") {
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
                        //Actualizar la categoria en las listas que contengan productos de esta categoria
                        bdLista.allDocs({
                            include_docs: true
                        }).then(listas => {
                            for (let i = 0; i < listas.rows.length; i++) {
                                const lista = listas.rows[i].doc
                                for (let j = 0; j < lista.productos.length; j++) {
                                    const producto = lista.productos[i]
                                    if (producto.categoriaA == categoriaDB.categoria)
                                        producto.categoriaA = nuevaCategoria
                                }
                                bdLista.post(lista)
                            }
                            //Actualizar la categoria en todos los productos que tengan esta categoria
                            bdProductos.allDocs({
                                include_docs: true
                            }).then(productos => {
                                for (let i = 0; i < productos.rows.length; i++) {
                                    if (productos.rows[i].doc.categoriaA == categoriaDB.categoria) {
                                        const producto = productos.rows[i].doc
                                        producto.categoriaA = nuevaCategoria
                                        bdProductos.post(producto)
                                    }
                                }
                                //Actualizar la categoria en la BD Categoria
                                categoriaDB.categoria = nuevaCategoria
                                bdCategoria.put(categoriaDB).then(respuesta => {
                                    if (respuesta.ok) {
                                        swal({
                                            icon: 'success',
                                            title: 'Categoría actualizada',
                                        });

                                        bdProductos.allDocs({
                                            include_docs: true
                                        }).then(productos => {
                                            for (let i = 0; i < productos.rows.length; i++) {
                                                const productoBD = productos.rows[i].doc
                                            }
                                        })
                                        obtenerCategoriasBD();
                                    }
                                });
                            })
                        })
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
                        //Eliminar la categoria en las listas que contengan productos de esta categoria
                        bdLista.allDocs({
                            include_docs: true
                        }).then(listas => {
                            for (let i = 0; i < listas.rows.length; i++) {
                                const lista = listas.rows[i].doc
                                for (let j = 0; j < lista.productos.length; j++) {
                                    const producto = lista.productos[i]
                                    if (producto.categoriaA == categoriaDB.categoria)
                                        producto.categoriaA = "Sin categoría"
                                }
                                bdLista.post(lista)
                            }
                            //Eliminar la categoria en todos los productos que tengan esta categoria
                            bdProductos.allDocs({
                                include_docs: true
                            }).then(productos => {
                                for (let i = 0; i < productos.rows.length; i++) {
                                    if (productos.rows[i].doc.categoriaA == categoriaDB.categoria) {
                                        const producto = productos.rows[i].doc
                                        producto.categoriaA = "Sin categoría"
                                        bdProductos.post(producto)
                                    }
                                }
                                //Eliminar la categoria en la BD Categoria
                                bdCategoria.remove(categoriaDB)
                                obtenerCategoriasBD()
                            })
                        })
                    }
                }

                contenedorBotones.appendChild(botonEditar)
                contenedorBotones.appendChild(botonEliminar)
                categoriaHTML.appendChild(contenedorBotones)

                contenedorCategorias.appendChild(categoriaHTML)
            }


        }
    });
}

const botonAgregarCategoria = document.querySelector("#agregarCategoria")
botonAgregarCategoria.onclick = () => {
    if (regresar != null)
        window.location.href = `../pages/nuevaCategoria.html?regresar=${regresar}&nombre=${encodeURIComponent(nombre)}&precio=${encodeURIComponent(precio)}&categoria=${encodeURIComponent(categoria)}&nota=${encodeURIComponent(nota)}&codigoBarras=${encodeURIComponent(codigoBarras)}`
    else
        window.location.href = "../pages/nuevaCategoria.html"
}