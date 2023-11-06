"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Cargar todos los productos de la base de datos
const bdLista = new PouchDB("tiendita_listas");
const bdProductos = new PouchDB("tiendita_Productos");
document.addEventListener("DOMContentLoaded", () => obtenerProductosBD())

function obtenerProductosBD() {
    bdProductos.allDocs({
        include_docs: true
    }).then(documentos => {
        const contenedorProductos = document.getElementById("productosContainer")
        contenedorProductos.innerHTML = ""
        for (let i = 0; i < documentos.rows.length; i++) {
            let productoBD = documentos.rows[i].doc;
            const productoHTML = document.createElement("div")
            productoHTML.classList.add("producto")
            productoHTML.innerHTML = `
            <div class="datosProducto">
                <img class="imagenProducto" src = "${productoBD.imagenA}" alt='Imagen' width="50px" height="50px">
                <p><strong>Nombre: </strong>${productoBD.nombreA}</p>
            </div>
            `
            const contenedorBotones = document.createElement("div")
            contenedorBotones.classList.add("botones")

            const botonEditar = document.createElement("button")
            botonEditar.classList.add("btn", "btn-warning", "btn-block")
            botonEditar.innerText = "Editar"

            botonEditar.onclick = () => window.location.href = `../pages/editarProducto.html?id=${productoBD._id}`

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
                            for (let j = 0; j < lista.productos.length; j++) {
                                const producto = lista.productos[j]
                                if (producto._id == productoBD._id)
                                    posicionEliminar = j
                            }
                            lista.productos.splice(posicionEliminar, 1)
                            bdLista.post(lista)
                        }
                        //Eliminar el producto de la base de datos de producto
                        bdProductos.remove(productoBD)
                        obtenerProductosBD()
                    })
                }
            }

            contenedorBotones.appendChild(botonEditar)
            contenedorBotones.appendChild(botonEliminar)
            productoHTML.appendChild(contenedorBotones)

            contenedorProductos.appendChild(productoHTML)
        }
    });
}

const botonAgregarProducto = document.querySelector("#agregarProducto")
botonAgregarProducto.onclick = () => window.location.href = "../pages/nuevoProducto.html"