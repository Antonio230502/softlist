"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creación de las bases de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
const bdProductos = new PouchDB("tiendita_Productos");
const bdLista = new PouchDB("tiendita_listas");

document.addEventListener("DOMContentLoaded", crearListaDefault)

//Se va a crear únicamente una lista por default si no existe ninguna lista en la base de datos
function crearListaDefault() {
    bdLista.info().then(info => {
        if (info.doc_count === 0) {
            bdLista.post(
                {
                    nombreLista: "Mi lista",
                    seleccionada: true,
                    productos: []
                })
        }
    }).catch(err => console.log(err));
}