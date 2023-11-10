"serviceWorker" in navigator && navigator.serviceWorker.register('sw.js');

//Creación de las bases de datos
const bdLista = new PouchDB("tiendita_listas");
let idListaActual = ""
let total = 0
let productosCarrito = 0
let gastoCarrito = 0

document.addEventListener("DOMContentLoaded", () => {
    obtenerDatosListaSeleccionada()
    mostrarListasEnElNav()
    const botonAgregarProductosLista = document.querySelector("#agregarProductosLista")
    botonAgregarProductosLista.onclick = () => window.location.href = `../pages/agregarProductosLista.html?id=${idListaActual}`
})

function mostrarListasEnElNav() {
    //Visualizar las listas en el menú de navegación
    bdLista.allDocs({ include_docs: true }).then(listas => {
        listas.rows.forEach(row => {
            const lista = row.doc;
            if (lista.nombreLista != undefined) {
                // Crear elemento <a> con la información de la lista y agregarlo al div con id="listas"
                const link = document.createElement('p');
                link.style.margin = "0"
                link.setAttribute('class', 'dropdown-item');
                link.innerText = lista.nombreLista;
                link.onclick = () => {
                    bdLista.get(idListaActual).then(listaActual => {
                        listaActual.seleccionada = false
                        bdLista.post(listaActual).then(respuesta => {
                            if (respuesta.ok) {
                                lista.seleccionada = true
                                bdLista.post(lista).then(respuesta => {
                                    if (respuesta.ok)
                                        window.location.href = "../pages/PaginaInicial.html"
                                    else
                                        console.log("Ocurrio un error:", respuesta)
                                })
                            }
                        })
                    })
                }
                document.getElementById('listas').appendChild(link);
            }
        });
    }).catch(error => console.log('Error al obtener las listas', error));
}

function obtenerDatosListaSeleccionada() {
    const nombreLista = document.querySelector("#nombreLista")
    const productosLista = document.querySelector("#productosLista")
    productosLista.innerHTML = ""
    const totalArriba = document.querySelector("#totalArriba")
    const totalAbajo = document.querySelector("#totalAbajo")
    const carritoArriba = document.querySelector("#carritoArriba")
    const carritoAbajo = document.querySelector("#carritoAbajo")
    gastoCarrito = 0
    total = 0

    bdLista.allDocs({ include_docs: true }).then(listas => {
        let i = 0
        listas.rows.forEach(row => {
            const lista = row.doc;
            if (lista.seleccionada) {
                idListaActual = lista._id
                nombreLista.innerText = lista.nombreLista;
                totalArriba.innerText = `Total (${lista.productos.length})`
                const categorias = []
                lista.productos.forEach(producto => {
                    if (!producto.carrito && !categorias.includes(producto.categoriaA))
                        categorias.push(producto.categoriaA)
                    if (producto.carrito && !categorias.includes("Carrito"))
                        categorias.push("Carrito")
                }
                )
                if (categorias.includes("Carrito")) {
                    categorias.splice(categorias.indexOf("Carrito"), 1)
                    categorias.push("Carrito")
                }

                categorias.forEach(categoria => {
                    const filaCategoria = document.createElement("tr")
                    filaCategoria.classList.add("categoria", "table-light")
                    filaCategoria.innerHTML = `<h6>${categoria}</h6>`
                    productosLista.appendChild(filaCategoria)

                    lista.productos.forEach(producto => {
                        if (producto.categoriaA == categoria && !producto.carrito) {
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
                            checkBox.setAttribute("data-posicion", i)
                            i++
                            checkBox.checked = producto.carrito

                            contenedorPrincipal.lastElementChild.firstElementChild.firstElementChild.style.textDecoration = producto.carrito ? "line-through" : "none"

                            checkBox.onchange = () => {
                                console.log(checkBox.checked)

                                if (checkBox.checked) {
                                    productosCarrito++
                                    gastoCarrito += parseInt(producto.cantidadA) * parseFloat(producto.precioA)
                                    checkBox.parentElement.firstElementChild.lastElementChild.firstElementChild.firstElementChild.style.textDecoration = "line-through"
                                    console.log("Palomie")
                                    bdLista.get(idListaActual).then(listaActual => {
                                        for (let i = 0; i < listaActual.productos.length; i++) {
                                            if (listaActual.productos[i].nombreA == producto.nombreA) {
                                                listaActual.productos[i].carrito = true
                                                bdLista.post(listaActual).then(respuesta => {
                                                    if (respuesta.ok) {
                                                        obtenerDatosListaSeleccionada()
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                                else {
                                    productosCarrito--
                                    gastoCarrito -= parseInt(producto.cantidadA) * parseFloat(producto.precioA)
                                    checkBox.parentElement.firstElementChild.lastElementChild.firstElementChild.firstElementChild.style.textDecoration = "none"
                                    console.log("Despalomie")
                                    bdLista.get(idListaActual).then(listaActual => {
                                        for (let i = 0; i < listaActual.productos.length; i++) {
                                            if (listaActual.productos[i].nombreA == producto.nombreA) {
                                                listaActual.productos[i].carrito = false
                                                bdLista.post(listaActual).then(respuesta => {
                                                    if (respuesta.ok) {
                                                        obtenerDatosListaSeleccionada()
                                                    }
                                                })
                                            }
                                        }
                                    })
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
                                // productosCarrito++
                                gastoCarrito += parseInt(producto.cantidadA) * parseFloat(producto.precioA)
                            }
                        }
                        else if (categoria == "Carrito" && producto.carrito) {
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
                                if (checkBox.checked) {
                                    productosCarrito++
                                    gastoCarrito += parseInt(producto.cantidadA) * parseFloat(producto.precioA)
                                    checkBox.parentElement.firstElementChild.lastElementChild.firstElementChild.firstElementChild.style.textDecoration = "line-through"
                                    console.log("Palomie")
                                    bdLista.get(idListaActual).then(listaActual => {
                                        for (let i = 0; i < listaActual.productos.length; i++) {
                                            if (listaActual.productos[i].nombreA == producto.nombreA) {
                                                listaActual.productos[i].carrito = true
                                                bdLista.post(listaActual).then(respuesta => {
                                                    if (respuesta.ok) {
                                                        obtenerDatosListaSeleccionada()
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                                else {
                                    productosCarrito--
                                    gastoCarrito -= parseInt(producto.cantidadA) * parseFloat(producto.precioA)
                                    checkBox.parentElement.firstElementChild.lastElementChild.firstElementChild.firstElementChild.style.textDecoration = "none"
                                    bdLista.get(idListaActual).then(listaActual => {
                                        for (let i = 0; i < listaActual.productos.length; i++) {
                                            if (listaActual.productos[i].nombreA == producto.nombreA) {
                                                listaActual.productos[i].carrito = false
                                                bdLista.post(listaActual).then(respuesta => {
                                                    if (respuesta.ok) {
                                                        obtenerDatosListaSeleccionada()
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                                carritoArriba.innerText = `Carrito (${productosCarrito})`
                                carritoAbajo.innerText = `$${gastoCarrito.toFixed(2)}`
                            }

                            contenedorPrincipal.lastElementChild.firstElementChild.firstElementChild.style.textDecoration = producto.carrito ? "line-through" : "none"

                            filaProducto.appendChild(contenedorPrincipal)
                            filaProducto.appendChild(checkBox)
                            productosLista.appendChild(filaProducto)

                            //Calcular costo total
                            total += parseInt(producto.cantidadA) * parseFloat(producto.precioA)

                            //Calcular costo carrito
                            if (producto.carrito) {
                                // productosCarrito++
                                gastoCarrito += parseInt(producto.cantidadA) * parseFloat(producto.precioA)
                            }
                        }
                    })
                })


                totalAbajo.innerText = `$${total.toFixed(2)}`
                carritoArriba.innerText = `Carrito (${productosCarrito})`
                carritoAbajo.innerText = `$${gastoCarrito.toFixed(2)}`
            }
        });
    }).catch(error => console.log('Error al obtener las listas', error));
}