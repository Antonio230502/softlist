"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Cargar todos los productos de la base de datos
const bdLista = new PouchDB("tiendita_listas");
document.addEventListener("DOMContentLoaded", () => obtenerListasOrdenadas())

function obtenerListasOrdenadas() {
    // Emitir las categorias con el campo "nombre" como clave
    function emitirLista(lista) {
        lista.nombreLista && emit(lista.nombreLista, lista);
    }

    // Verificar si el diseño de vista ya existe
    bdLista.get('_design/nombres')
        .then(realizarConsulta)
        .catch(err => {
            // Si el diseño de vista no existe, lo creamos
            if (err.name === 'not_found') {
                bdLista.put({
                    _id: '_design/nombres',
                    views: {
                        by_nombre: {
                            map: emitirLista.toString()
                        }
                    }
                }).then(realizarConsulta).catch(err => console.log(err));
            }
            else
                console.log(err);
        });

    // Función para realizar la consulta
    function realizarConsulta() {
        bdLista.query('nombres/by_nombre', {
            descending: false
        }).then(listas => {
            const contenedorListas = document.querySelector("tbody")
            contenedorListas.innerHTML = ""
            let listasOrdenadas = listas.rows.map(lista => lista.value);
            listasOrdenadas.forEach(lista => {
                if (lista.nombreLista != undefined) {
                    const listaHTML = document.createElement("div")
                    listaHTML.classList.add("lista")
                    listaHTML.innerHTML = `
                        <p>${lista.nombreLista}</p>
                        `
                    const contenedorBotones = document.createElement("div")
                    contenedorBotones.classList.add("botones")

                    const botonEditar = document.createElement("button")
                    botonEditar.classList.add("btn", "btn-warning", "btn-block")
                    botonEditar.innerText = "Editar"

                    botonEditar.onclick = () => {
                        var nuevaLista = prompt('Ingrese el nuevo nombre de la categoría: ');
                        if (nuevaLista !== null && nuevaLista.trim() !== '') {
                            lista.nombreLista = nuevaLista
                            bdLista.put(lista).then(respuesta => {
                                if (respuesta.ok) {
                                    swal({
                                        icon: 'success',
                                        title: 'Categoría actualizada',
                                    });
                                    obtenerListasOrdenadas();
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

                    if (!lista.seleccionada) {
                        const botonEliminar = document.createElement("button")
                        botonEliminar.classList.add("btn", "btn-danger", "btn-block")
                        botonEliminar.innerText = "Eliminar"

                        botonEliminar.onclick = () => {
                            if (confirm("¿Está seguro de eliminar esta lista?")) {
                                bdLista.remove(lista)
                                obtenerListasOrdenadas()
                            }
                        }
                        contenedorBotones.appendChild(botonEliminar)
                    }

                    listaHTML.appendChild(contenedorBotones)

                    contenedorListas.appendChild(listaHTML)
                }

            })
        }).catch(err => console.log(err));
    }
}

const botonAgregarCategoria = document.querySelector("#agregarLista")
botonAgregarCategoria.onclick = () => window.location.href = "../pages/nuevaLista.html"