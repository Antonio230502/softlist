"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Cargar todos los productos de la base de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
const bdProductos = new PouchDB("tiendita_Productos");
const bdLista = new PouchDB("tiendita_listas");
document.addEventListener("DOMContentLoaded", () => obtenerCategoriasOrdenadas())
//Saber si tengo que regresar
const url = new URL(window.location.href);
const regresar = url.searchParams.get("regresar");
let id
let nombre
let precio
let categoria
let nota
let codigoBarras
let carrito
let cantidad
let lista
let producto

function obtenerCategoriasOrdenadas() {
    // Emitir las categorias con el campo "nombre" como clave
    function emitirCategorias(categoria) {
        categoria.categoria && emit(categoria.categoria, categoria);
    }

    // Verificar si el diseño de vista ya existe
    bdCategoria.get('_design/nombres')
        .then(realizarConsulta)
        .catch(err => {
            // Si el diseño de vista no existe, lo creamos
            if (err.name === 'not_found') {
                bdCategoria.put({
                    _id: '_design/nombres',
                    views: {
                        by_nombre: {
                            map: emitirCategorias.toString()
                        }
                    }
                }).then(realizarConsulta).catch(err => console.log(err));
            }
            else
                console.log(err);
        });

    // Función para realizar la consulta
    function realizarConsulta() {
        bdCategoria.query('nombres/by_nombre', {
            descending: false
        }).then(categorias => {
            const contenedorCategorias = document.querySelector("tbody")
            contenedorCategorias.innerHTML = ""
            let categoriasOrdenadas = categorias.rows.map(categoria => categoria.value);
            categoriasOrdenadas.forEach(categoria => {
                if (categoria.categoria != undefined) {
                    const categoriaHTML = document.createElement("div")
                    categoriaHTML.classList.add("categoria")
                    categoriaHTML.innerHTML = `
                        <p>${categoria.categoria}</p>
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
                                        if (producto.categoriaA == categoria.categoria)
                                            producto.categoriaA = nuevaCategoria
                                    }
                                    bdLista.post(lista)
                                }
                                //Actualizar la categoria en todos los productos que tengan esta categoria
                                bdProductos.allDocs({
                                    include_docs: true
                                }).then(productos => {
                                    for (let i = 0; i < productos.rows.length; i++) {
                                        if (productos.rows[i].doc.categoriaA == categoria.categoria) {
                                            const producto = productos.rows[i].doc
                                            producto.categoriaA = nuevaCategoria
                                            bdProductos.post(producto)
                                        }
                                    }
                                    //Actualizar la categoria en la BD Categoria
                                    categoria.categoria = nuevaCategoria
                                    bdCategoria.put(categoria).then(respuesta => {
                                        if (respuesta.ok) {
                                            swal({
                                                icon: 'success',
                                                title: 'Categoría actualizada',
                                            });
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
                                        if (producto.categoriaA == categoria.categoria)
                                            producto.categoriaA = "Sin categoría"
                                    }
                                    bdLista.post(lista)
                                }
                                //Eliminar la categoria en todos los productos que tengan esta categoria
                                bdProductos.allDocs({
                                    include_docs: true
                                }).then(productos => {
                                    for (let i = 0; i < productos.rows.length; i++) {
                                        if (productos.rows[i].doc.categoriaA == categoria.categoria) {
                                            const producto = productos.rows[i].doc
                                            producto.categoriaA = "Sin categoría"
                                            bdProductos.post(producto)
                                        }
                                    }
                                    //Eliminar la categoria en la BD Categoria
                                    bdCategoria.remove(categoria)
                                    obtenerCategoriasOrdenadas()
                                })
                            })
                        }
                    }

                    contenedorBotones.appendChild(botonEditar)
                    contenedorBotones.appendChild(botonEliminar)
                    categoriaHTML.appendChild(contenedorBotones)

                    contenedorCategorias.appendChild(categoriaHTML)
                }

            })
            if (categoriasOrdenadas.length == 0)
                document.querySelector("option").selected = true
        }).catch(err => console.log(err));
    }
}

const botonAgregarCategoria = document.querySelector("#agregarCategoria")
botonAgregarCategoria.onclick = () => {
    id = decodeURIComponent(url.searchParams.get("id"))
    nombre = decodeURIComponent(url.searchParams.get("nombre"))
    precio = decodeURIComponent(url.searchParams.get("precio"))
    categoria = decodeURIComponent(url.searchParams.get("categoria"))
    nota = decodeURIComponent(url.searchParams.get("nota"))
    codigoBarras = decodeURIComponent(url.searchParams.get("codigoBarras"))
    carrito = decodeURIComponent(url.searchParams.get("carrito"))
    cantidad = decodeURIComponent(url.searchParams.get("cantidad"))
    lista = decodeURIComponent(url.searchParams.get("lista"))
    producto = decodeURIComponent(url.searchParams.get("producto"))
    switch (regresar) {
        case "nuevoProducto.html":
            window.location.href = `../pages/nuevaCategoria.html?regresar=nuevoProducto.html&nombre=${encodeURIComponent(nombre)}&precio=${encodeURIComponent(precio)}&categoria=${encodeURIComponent(categoria)}&nota=${encodeURIComponent(nota)}&codigoBarras=${encodeURIComponent(codigoBarras)}`
            break;
        case "editarProducto.html":
            //Tiene todos los parametros de nuevoProducto.html más el id
            window.location.href = `../pages/nuevaCategoria.html?regresar=editarProducto.html&id=${id}&nombre=${encodeURIComponent(nombre)}&precio=${encodeURIComponent(precio)}&categoria=${encodeURIComponent(categoria)}&nota=${encodeURIComponent(nota)}&codigoBarras=${encodeURIComponent(codigoBarras)}`
            break;
        case "editarProductoLista.html":
            //Tiene todos los parametros de nuevoProducto.html más la lista, la cantidad y el carrito
            window.location.href = `../pages/nuevaCategoria.html?regresar=editarProductoLista.html&producto=${producto}&nombre=${encodeURIComponent(nombre)}&precio=${encodeURIComponent(precio)}&categoria=${encodeURIComponent(categoria)}&nota=${encodeURIComponent(nota)}&codigoBarras=${encodeURIComponent(codigoBarras)}&lista=${encodeURIComponent(lista)}&cantidad=${encodeURIComponent(cantidad)}&carrito=${encodeURIComponent(carrito)}`
            break;
        default:
            window.location.href = "../pages/nuevaCategoria.html"
            break;
    }
}