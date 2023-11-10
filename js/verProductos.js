"serviceWorker" in navigator && navigator.serviceWorker.register('sw.js');

//Cargar todos los productos de la base de datos
const bdLista = new PouchDB("tiendita_listas");
const bdProductos = new PouchDB("tiendita_Productos");
const bdCategoria = new PouchDB("tiendita_Categoria");
document.addEventListener("DOMContentLoaded", () => {
    obtenerProductosOrdenadosPorCategoria()
    obtenerCategoriasOrdenadas()
})
const selectCategoria = document.querySelector("#categoria")
const inputBuscarProducto = document.querySelector("#buscarProducto")

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
            let categoriasOrdenadas = categorias.rows.map(categoria => categoria.value);
            categoriasOrdenadas.forEach(categoria => {
                const option = document.createElement("option");
                option.value = categoria.categoria;
                option.text = categoria.categoria;
                selectCategoria.add(option);
            })
            document.querySelector("option").selected = true
        }).catch(err => console.log(err));
    }
}

function obtenerProductosOrdenadosPorCategoria() {
    // Emitir las categorias con el campo "nombre" como clave
    function emitirProductos(producto) {
        producto.nombreA && emit(producto.nombreA, producto);
    }

    // Verificar si el diseño de vista ya existe
    bdProductos.get('_design/nombres')
        .then(realizarConsulta)
        .catch(err => {
            // Si el diseño de vista no existe, lo creamos
            if (err.name === 'not_found') {
                bdProductos.put({
                    _id: '_design/nombres',
                    views: {
                        by_nombre: {
                            map: emitirProductos.toString()
                        }
                    }
                }).then(realizarConsulta).catch(err => console.log(err));
            }
            else
                console.log(err);
        });

    // Función para realizar la consulta
    function realizarConsulta() {
        bdProductos.query('nombres/by_nombre', {
            descending: false
        }).then(productos => {
            const contenedorProductos = document.querySelector("#productosContainer")
            contenedorProductos.innerHTML = ""
            let productosOrdenados = productos.rows.map(producto => producto.value);
            productosOrdenados.forEach(producto => {
                if (selectCategoria.value == "Todas") {
                    const productoHTML = document.createElement("div")
                    productoHTML.classList.add("producto")
                    productoHTML.innerHTML = `
                    <div class="datosProducto">
                        <img class="imagenProducto" src = "${producto.imagenA}" alt='Imagen' width="50px" height="50px">
                        <p><strong>Nombre: </strong>${producto.nombreA}</p>
                    </div>
                    `
                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("botones")

                    const botonEditar = document.createElement("button")
                    botonEditar.classList.add("btn", "btn-outline-warning", "btn-block")
                    botonEditar.innerText = "Editar"

                    botonEditar.onclick = () => window.location.href = `../pages/editarProducto.html?id=${producto._id}`

                    const botonEliminar = document.createElement("button")
                    botonEliminar.classList.add("btn", "btn-outline-danger", "btn-block")
                    botonEliminar.innerText = "Eliminar"

                    botonEliminar.onclick = () => {
                        if (confirm("¿Está seguro de eliminar este producto?")) {
                            //Eliminar el producto de todas las listas que lo incluyan
                            bdLista.allDocs({
                                include_docs: true
                            }).then(listas => {
                                for (let i = 0; i < listas.rows.length; i++) {
                                    let posicionEliminar = -1
                                    const lista = listas.rows[i].doc
                                    if (lista.nombreLista == undefined)
                                        continue
                                    for (let j = 0; j < lista.productos.length; j++) {
                                        const producto = lista.productos[j]
                                        if (producto._id == producto._id)
                                            posicionEliminar = j
                                    }
                                    lista.productos.splice(posicionEliminar, 1)
                                    bdLista.post(lista)
                                }
                                //Eliminar el producto de la base de datos de producto
                                bdProductos.remove(producto)
                                obtenerProductosOrdenados()
                            })
                        }
                    }

                    contenedorBotones.appendChild(botonEditar)
                    contenedorBotones.appendChild(botonEliminar)
                    productoHTML.appendChild(contenedorBotones)

                    contenedorProductos.appendChild(productoHTML)
                }
                else if (producto.categoriaA == selectCategoria.value) {
                    const productoHTML = document.createElement("div")
                    productoHTML.classList.add("producto")
                    productoHTML.innerHTML = `
                    <div class="datosProducto">
                        <img class="imagenProducto" src = "${producto.imagenA}" alt='Imagen' width="50px" height="50px">
                        <p><strong>Nombre: </strong>${producto.nombreA}</p>
                    </div>
                    `
                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("botones")

                    const botonEditar = document.createElement("button")
                    botonEditar.classList.add("btn", "btn-warning", "btn-block")
                    botonEditar.innerText = "Editar"

                    botonEditar.onclick = () => window.location.href = `../pages/editarProducto.html?id=${producto._id}`

                    const botonEliminar = document.createElement("button")
                    botonEliminar.classList.add("btn", "btn-danger", "btn-block")
                    botonEliminar.innerText = "Eliminar"

                    botonEliminar.onclick = () => {
                        if (confirm("¿Está seguro de eliminar este producto?")) {
                            //Eliminar el producto de todas las listas que lo incluyan
                            bdLista.allDocs({
                                include_docs: true
                            }).then(listas => {
                                for (let i = 0; i < listas.rows.length; i++) {
                                    let posicionEliminar = -1
                                    const lista = listas.rows[i].doc
                                    if (lista.nombreLista == undefined)
                                        continue
                                    for (let j = 0; j < lista.productos.length; j++) {
                                        const producto = lista.productos[j]
                                        if (producto._id == producto._id)
                                            posicionEliminar = j
                                    }
                                    lista.productos.splice(posicionEliminar, 1)
                                    bdLista.post(lista)
                                }
                                //Eliminar el producto de la base de datos de producto
                                bdProductos.remove(producto)
                                obtenerProductosOrdenadosPorCategoria()
                            })
                        }
                    }

                    contenedorBotones.appendChild(botonEditar)
                    contenedorBotones.appendChild(botonEliminar)
                    productoHTML.appendChild(contenedorBotones)

                    contenedorProductos.appendChild(productoHTML)
                }
            })

        }).catch(err => console.log(err));
    }
}

function obtenerProductosOrdenadosPorBusqueda() {
    // Emitir las categorias con el campo "nombre" como clave
    function emitirProductos(producto) {
        producto.nombreA && emit(producto.nombreA, producto);
    }

    // Verificar si el diseño de vista ya existe
    bdProductos.get('_design/nombres')
        .then(realizarConsulta)
        .catch(err => {
            // Si el diseño de vista no existe, lo creamos
            if (err.name === 'not_found') {
                bdProductos.put({
                    _id: '_design/nombres',
                    views: {
                        by_nombre: {
                            map: emitirProductos.toString()
                        }
                    }
                }).then(realizarConsulta).catch(err => console.log(err));
            }
            else
                console.log(err);
        });

    // Función para realizar la consulta
    function realizarConsulta() {
        bdProductos.query('nombres/by_nombre', {
            descending: false
        }).then(productos => {
            const contenedorProductos = document.querySelector("#productosContainer")
            contenedorProductos.innerHTML = ""
            let productosOrdenados = productos.rows.map(producto => producto.value);
            productosOrdenados.forEach(producto => {
                if (inputBuscarProducto.value.trim() == "") {
                    const productoHTML = document.createElement("div")
                    productoHTML.classList.add("producto")
                    productoHTML.innerHTML = `
                    <div class="datosProducto">
                        <img class="imagenProducto" src = "${producto.imagenA}" alt='Imagen' width="50px" height="50px">
                        <p><strong>Nombre: </strong>${producto.nombreA}</p>
                    </div>
                    `
                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("botones")

                    const botonEditar = document.createElement("button")
                    botonEditar.classList.add("btn", "btn-warning", "btn-block")
                    botonEditar.innerText = "Editar"

                    botonEditar.onclick = () => window.location.href = `../pages/editarProducto.html?id=${producto._id}`

                    const botonEliminar = document.createElement("button")
                    botonEliminar.classList.add("btn", "btn-danger", "btn-block")
                    botonEliminar.innerText = "Eliminar"

                    botonEliminar.onclick = () => {
                        if (confirm("¿Está seguro de eliminar este producto?")) {
                            //Eliminar el producto de todas las listas que lo incluyan
                            bdLista.allDocs({
                                include_docs: true
                            }).then(listas => {
                                for (let i = 0; i < listas.rows.length; i++) {
                                    let posicionEliminar = -1
                                    const lista = listas.rows[i].doc
                                    if (lista.nombreLista == undefined)
                                        continue
                                    for (let j = 0; j < lista.productos.length; j++) {
                                        const producto = lista.productos[j]
                                        if (producto._id == producto._id)
                                            posicionEliminar = j
                                    }
                                    lista.productos.splice(posicionEliminar, 1)
                                    bdLista.post(lista)
                                }
                                //Eliminar el producto de la base de datos de producto
                                bdProductos.remove(producto)
                                obtenerProductosOrdenados()
                            })
                        }
                    }

                    contenedorBotones.appendChild(botonEditar)
                    contenedorBotones.appendChild(botonEliminar)
                    productoHTML.appendChild(contenedorBotones)

                    contenedorProductos.appendChild(productoHTML)
                }
                else if (producto.nombreA.toLowerCase().includes(inputBuscarProducto.value.trim().toLowerCase())) {
                    const productoHTML = document.createElement("div")
                    productoHTML.classList.add("producto")
                    productoHTML.innerHTML = `
                    <div class="datosProducto">
                        <img class="imagenProducto" src = "${producto.imagenA}" alt='Imagen' width="50px" height="50px">
                        <p><strong>Nombre: </strong>${producto.nombreA}</p>
                    </div>
                    `
                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("botones")

                    const botonEditar = document.createElement("button")
                    botonEditar.classList.add("btn", "btn-warning", "btn-block")
                    botonEditar.innerText = "Editar"

                    botonEditar.onclick = () => window.location.href = `../pages/editarProducto.html?id=${producto._id}`

                    const botonEliminar = document.createElement("button")
                    botonEliminar.classList.add("btn", "btn-danger", "btn-block")
                    botonEliminar.innerText = "Eliminar"

                    botonEliminar.onclick = () => {
                        if (confirm("¿Está seguro de eliminar este producto?")) {
                            //Eliminar el producto de todas las listas que lo incluyan
                            bdLista.allDocs({
                                include_docs: true
                            }).then(listas => {
                                for (let i = 0; i < listas.rows.length; i++) {
                                    let posicionEliminar = -1
                                    const lista = listas.rows[i].doc
                                    if (lista.nombreLista == undefined)
                                        continue
                                    for (let j = 0; j < lista.productos.length; j++) {
                                        const producto = lista.productos[j]
                                        if (producto._id == producto._id)
                                            posicionEliminar = j
                                    }
                                    lista.productos.splice(posicionEliminar, 1)
                                    bdLista.post(lista)
                                }
                                //Eliminar el producto de la base de datos de producto
                                bdProductos.remove(producto)
                                obtenerProductosOrdenados()
                            })
                        }
                    }

                    contenedorBotones.appendChild(botonEditar)
                    contenedorBotones.appendChild(botonEliminar)
                    productoHTML.appendChild(contenedorBotones)

                    contenedorProductos.appendChild(productoHTML)
                }
            })

        }).catch(err => console.log(err));
    }
}
//codigo para el boton regresar
document.getElementById("botonRegresar").addEventListener("click", function() {
    window.history.back(); 
});
const botonAgregarProducto = document.querySelector("#agregarProducto")
botonAgregarProducto.onclick = () => window.location.href = "../pages/nuevoProducto.html"

selectCategoria.onchange = obtenerProductosOrdenadosPorCategoria
inputBuscarProducto.onkeyup = obtenerProductosOrdenadosPorBusqueda