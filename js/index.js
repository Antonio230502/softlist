"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creación de las bases de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
const bdProductos = new PouchDB("tiendita_Productos");
const bdLista = new PouchDB("tiendita_listas");

document.addEventListener("DOMContentLoaded", () =>{
    crearListaDefault()
    crearCategoriasDefault()
    crearProductoDefault()


})

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

function crearCategoriasDefault() {
    bdCategoria.info().then(info => {
        if (info.doc_count === 0) {
            bdCategoria.post(
                {
                    categoria: "Abarrotes",
                }).then(respuesta =>{
                    if(respuesta.ok)
                        bdCategoria.post({
                            categoria: "Carnes frias",
                        }).then(respuesta =>{
                            if(respuesta.ok)
                                bdCategoria.post(
                                    {
                                        categoria: "Lacteos",
                                    })
                        })
                })
        }
    }).catch(err => console.log(err));
}

function crearProductoDefault() {
    bdProductos.info().then(info => {
        if (info.doc_count === 0) {
            bdProductos.post(
                {
                    cantidadA: 1,
                    categoriaA: "Abarrotes",
                    codigoBarras:"1234567890",
                    imagenA:"../img/coca.jpg", 
                    nombreA:"coca",
                    notaA:"que rica son",
                    precioA:"29",
                }).then(respuesta =>{
                    if(respuesta.ok)
                        bdProductos.post({
                            cantidadA: 2,
                            categoriaA: "Carnes frias",
                            codigoBarras:"2345234121",
                            imagenA: "../img/jamon.jpg", 
                            nombreA:"jamon",
                            notaA:"serrano",
                            precioA:"80",
                        }).then(respuesta =>{
                            if(respuesta.ok)
                                bdProductos.post({
                                    cantidadA: 3,
                                    categoriaA: "Lacteos",
                                    codigoBarras:"432154321",
                                    imagenA:"../img/leche.jpg", 
                                    nombreA:"Leche",
                                    notaA:"alpura",
                                    precioA:"35",
                                })
                        })
                })
        }
    }).catch(err => console.log(err));
}