"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creación de las bases de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
const bdProductos = new PouchDB("tiendita_Productos");
const bdLista = new PouchDB("tiendita_listas");

document.addEventListener("DOMContentLoaded", ()=>{
    crearListaDefault()
    crearCategoriaDefault()
})

//Se va a crear únicamente una lista por default si no existe ninguna lista en la base de datos
function crearListaDefault() {
    bdLista.info().then(info => {
        if (info.doc_count === 0) {
            bdLista.post(
                {
                    _id: "1",
                    nombreLista: "Mi lista",
                    seleccionada: true,
                    productos: []
                })
        }
    }).catch(err => console.log(err));
}

function crearCategoriaDefault() {
    bdCategoria.info().then(info => {
        if (info.doc_count === 0) {
            bdCategoria.post(
                {
                    _id: "1",
                    categoria: "Sin categoría",
                })
        }
    }).catch(err => console.log(err));
}