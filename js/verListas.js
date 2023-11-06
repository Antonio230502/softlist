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

const botonAgregarCategoria = document.querySelector("#agregarLista")
botonAgregarCategoria.onclick = () => window.location.href = "../pages/nuevaLista.html"