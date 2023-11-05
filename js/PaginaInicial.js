"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creación de las bases de datos
const bdLista = new PouchDB("tiendita_listas");
let idListaActual = ""
let total = 0
let productosCarrito = 0
let gastoCarrito = 0

document.addEventListener("DOMContentLoaded", () => {
    mostrarListasEnElNav()
    obtenerDatosListaSeleccionada()
    const botonAgregarProductosLista = document.querySelector("#agregarProductosLista")
    botonAgregarProductosLista.onclick = () => window.location.href = `../pages/agregarProductosLista.html?id=${idListaActual}`
})

function mostrarListasEnElNav() {
    //Visualizar las listas en el menú de navegación
    bdLista.allDocs({ include_docs: true }).then(listas => {
        listas.rows.forEach(row => {
            const lista = row.doc;
            // Crear elemento <a> con la información de la lista y agregarlo al div con id="listas"
            const link = document.createElement('a');
            link.setAttribute('class', 'dropdown-item');
            link.setAttribute('href', 'PaginaInicial.html');
            link.innerText = lista.nombreLista;
            document.getElementById('listas').appendChild(link);
        });
    }).catch(error => console.log('Error al obtener las listas', error));
}

function obtenerDatosListaSeleccionada() {
    const nombreLista = document.querySelector("#nombreLista")
    const productosLista = document.querySelector("#productosLista")
    const totalArriba = document.querySelector("#totalArriba")
    const totalAbajo = document.querySelector("#totalAbajo")
    const carritoArriba = document.querySelector("#carritoArriba")
    const carritoAbajo = document.querySelector("#carritoAbajo")

    bdLista.allDocs({ include_docs: true }).then(listas => {
        let i = 0
        listas.rows.forEach(row => {
            const lista = row.doc;
            if (lista.seleccionada) {
                idListaActual = lista._id
                nombreLista.innerText = lista.nombreLista;
                totalArriba.innerText = `Total (${lista.productos.length})`
                lista.productos.forEach(producto => {

                    const filaProducto = document.createElement("tr")
                    filaProducto.classList.add("producto", "table-light")
                    const contenedorPrincipal = document.createElement("div")
                    contenedorPrincipal.classList.add("principal")
                    contenedorPrincipal.innerHTML = `
                    <img class="imagenProducto" src = "${producto.imagenA}" alt='Imagen' width="50px" height="50px">
                    <div class="datosProducto">
                        <div class="productoArriba">
                            <p>${producto.nombreA}</p>
                        </div>
                        <div class="productoAbajo">
                            <p>${producto.cantidadA} Cantidades = $${parseFloat(producto.cantidadA) * parseFloat(producto.precioA)} - ${producto.notaA}</p>
                        </div>
                    </div>
                    `

                    contenedorPrincipal.onclick = () => window.location.href = `../pages/editarProductoLista.html?lista=${lista._id}&producto=${producto._id}`

                    const checkBox = document.createElement("input")
                    checkBox.setAttribute("type", "checkbox")
                    checkBox.classList.add("checkboxCarrito")
                    checkBox.setAttribute("data-posicion", i++)
                    checkBox.checked = producto.carrito

                    checkBox.onchange = () => {
                        lista.productos[checkBox.dataset.posicion].carrito = checkBox.checked;
                        bdLista.get(idListaActual).then(doc => {
                            doc.productos = lista.productos;
                            bdLista.put(doc);
                        })

                        if (checkBox.checked) {
                            productosCarrito++
                            gastoCarrito += parseInt(producto.cantidadA) * parseFloat(producto.precioA)
                        }
                        else {
                            productosCarrito--
                            gastoCarrito -= parseInt(producto.cantidadA) * parseFloat(producto.precioA)
                        }
                        carritoArriba.innerText = `Carrito (${productosCarrito})`
                        carritoAbajo.innerText = `$${gastoCarrito.toFixed(2)}`
                    }
                    filaProducto.appendChild(contenedorPrincipal)
                    filaProducto.appendChild(checkBox)
                    productosLista.appendChild(filaProducto)

                    //Calcular costo total
                    total += parseInt(producto.cantidadA) * parseFloat(producto.precioA)

                    //Calcular costo carrito
                    if (producto.carrito) {
                        productosCarrito++
                        gastoCarrito += parseInt(producto.cantidadA) * parseFloat(producto.precioA)
                    }
                })
                totalAbajo.innerText = `$${total.toFixed(2)}`
                carritoArriba.innerText = `Carrito (${productosCarrito})`
                carritoAbajo.innerText = `$${gastoCarrito.toFixed(2)}`
            }
        });
    }).catch(error => console.log('Error al obtener las listas', error));
}