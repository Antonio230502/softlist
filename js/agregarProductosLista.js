"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Cargar todos los productos de la base de datos
const bdProductos = new PouchDB("tiendita_Productos");
const bdLista = new PouchDB("tiendita_listas");
const bdCategoria = new PouchDB("tiendita_Categoria");
//Obtener el id de la lista a la que le vamos a pasar los productos
var url = new URL(window.location.href);
let idListaActual = url.searchParams.get("id");

document.addEventListener("DOMContentLoaded", () => {
    obtenerProductosBD()
    cargarCategoriasSelect()
})

function obtenerProductosBD() {
    bdProductos.allDocs({
        include_docs: true
    }).then(productos => {
        const contenedorProductos = document.getElementById("productosContainer")
        contenedorProductos.innerHTML = ""
        for (let i = 0; i < productos.rows.length; i++) {
            let productoBD = productos.rows[i].doc;
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

            const checkBox = document.createElement("input")
            checkBox.setAttribute("type", "checkbox")
            //Detectar si el producto ya está en la lista o no
            bdLista.get(idListaActual).then(listaActual => {
                listaActual.productos.forEach(producto => producto._id == productoBD._id && checkBox.setAttribute("checked", true))
            }).catch(err => console.log('Error:', err));

            checkBox.onchange = () => {
                bdLista.get(idListaActual).then(listaActual => {
                    if (checkBox.checked) {
                        listaActual.productos.push(productoBD)
                        bdLista.put(listaActual)
                    }
                    else {
                        for (let i = 0; i < listaActual.productos.length; i++) {
                            if (listaActual.productos[i]._id == productoBD._id) {
                                listaActual.productos.splice(i, 1)
                                bdLista.put(listaActual)
                            }
                        }
                    }

                }).catch(err => console.log('Error:', err));
            }

            contenedorBotones.appendChild(checkBox)
            productoHTML.appendChild(contenedorBotones)

            contenedorProductos.appendChild(productoHTML)
        }
    });
}

function cargarCategoriasSelect(){
    bdCategoria.allDocs({ include_docs: true }).then(categorias => {
        for (let i = 0; i < categorias.rows.length; i++) {
            let categoria = categorias.rows[i].doc;
            let option = document.createElement("option");
            option.value = categoria.categoria;
            option.text = categoria.categoria;
            document.getElementById('categoria').add(option);
        }
    });
}

const botonAgregarProducto = document.querySelector("#agregarProducto")