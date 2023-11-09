"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Cargar todos los productos de la base de datos
const bdLista = new PouchDB("tiendita_listas");
document.addEventListener("DOMContentLoaded", () => obtenerListasBD())

function obtenerListasBD() {
    bdLista.allDocs({
        include_docs: true
    }).then(documentos => {
        const contenedorListas = document.querySelector("tbody")
        contenedorListas.innerHTML = ""
        for (let i = 0; i < documentos.rows.length; i++) {
            let listaDB = documentos.rows[i].doc;
            const listaHTML = document.createElement("div")
            listaHTML.classList.add("lista")
            listaHTML.innerHTML = `
            <p>${listaDB.nombreLista}</p>
            `
            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("botones")

            const botonEditar = document.createElement("button")
            botonEditar.classList.add("btn", "btn-warning", "btn-block")
            botonEditar.innerText = "Editar"

            botonEditar.onclick = () => {
                var nuevaLista = prompt('Ingrese el nuevo nombre de la categoría: ');
                if (nuevaLista !== null && nuevaLista.trim() !== '') {
                    listaDB.nombreLista = nuevaLista
                    bdLista.put(listaDB).then(respuesta => {
                        if (respuesta.ok) {
                            swal({
                                icon: 'success',
                                title: 'Categoría actualizada',
                            });
                            obtenerListasBD();
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
            contenedorBotones.appendChild(botonEditar)

            if(!listaDB.seleccionada){
                const botonEliminar = document.createElement("button")
                botonEliminar.classList.add("btn", "btn-danger", "btn-block")
                botonEliminar.innerText = "Eliminar"
    
                botonEliminar.onclick = () => {
                    if (confirm("¿Está seguro de eliminar esta lista?")) {
                        bdLista.remove(listaDB)
                        obtenerListasBD()
                    }
                }
                contenedorBotones.appendChild(botonEliminar)
            }

            listaHTML.appendChild(contenedorBotones)

            contenedorListas.appendChild(listaHTML)
        }
    });
}

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

const botonAgregarCategoria = document.querySelector("#agregarLista")
botonAgregarCategoria.onclick = () => window.location.href = "../pages/nuevaLista.html"