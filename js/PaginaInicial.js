"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creación de las bases de datos
const bdLista = new PouchDB("tiendita_listas");
let idListaActual = ""

document.addEventListener("DOMContentLoaded", () => {
    mostrarListasEnElNav()
    obtenerDatosListaSeleccionada()
    const botonAgregarProductosLista = document.querySelector("#agregarProductosLista")
    botonAgregarProductosLista.onclick = () => window.location.href = `../pages/agregarProductosLista.html?id=${idListaActual}`
})

function mostrarListasEnElNav() {
    //Visualizar las listas en el menú de navegación
    bdLista.allDocs({ include_docs: true }).then(respuesta => {
        respuesta.rows.forEach(row => {
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

    bdLista.allDocs({ include_docs: true }).then(respuesta => {
        let i = 0
        respuesta.rows.forEach(row => {
            const lista = row.doc;
            if (lista.seleccionada) {
                idListaActual = lista._id
                nombreLista.innerText = lista.nombreLista;
                lista.productos.forEach(producto => {
                    const filaProducto = document.createElement("tr")
                    filaProducto.classList.add("producto", "table-light")

                    filaProducto.innerHTML = `
                    <div class="principal">
                        <img class="imagenProducto" src = "${producto.imagenA}" alt='Imagen' width="50px" height="50px">
                        <div class="datosProducto">
                            <div class="productoArriba">
                                <p>${producto.nombreA}</p>
                            </div>
                            <div class="productoAbajo">
                                <p>${producto.cantidadA} Cantidades = $${parseFloat(producto.cantidadA) * parseFloat(producto.precioA)} - ${producto.notaA}</p>
                            </div>
                        </div>
                    </div>
                    `
                    const checkBox = document.createElement("input")
                    checkBox.setAttribute("type", "checkbox")
                    checkBox.classList.add("checkboxCarrito")
                    checkBox.setAttribute("data-posicion", i++)
                    checkBox.checked = producto.carrito

                    checkBox.onchange = () =>{
                        lista.productos[checkBox.dataset.posicion].carrito = checkBox.checked;
                        bdLista.get(idListaActual).then(doc => {
                            doc.productos = lista.productos;
                            bdLista.put(doc);
                        })
                    }                    

                    filaProducto.appendChild(checkBox)
                    productosLista.appendChild(filaProducto)
                })
            }
        });
    }).catch(error => console.log('Error al obtener las listas', error));
}

