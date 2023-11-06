"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creando / Accediendo a las bases de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
const bdProductos = new PouchDB("tiendita_Productos");
const bdLista = new PouchDB("tiendita_listas");
//Obtener el id del producto a editar
const url = new URL(window.location.href);
const idLista = url.searchParams.get("lista");
const idProducto = url.searchParams.get("producto");
//Objetos HTML
const inputNombre = document.querySelector("#nombreProducto")
const inputCantidad = document.querySelector("#cantidad")
const inputPrecio = document.querySelector("#precio")
const inputCarrito = document.querySelector("#carrito")
const selectCategoria = document.querySelector("#categoria")
const inputNota = document.querySelector("#nota")
const inputCodigoBarras = document.querySelector("#codigoBarras")
const inputImagen = document.querySelector("#imagen")
const vistaPreviaImagen = document.querySelector("#imgFile")

let actualizacionCorrecta = true

// Cargar las categorias en el select categorias
document.addEventListener("DOMContentLoaded", () => {
    obtenerCategoriasBD()
    obtenerDatosProducto()
})

function obtenerCategoriasBD() {
    bdCategoria.allDocs({ include_docs: true }).then(documentos => {
        for (let i = 0; i < documentos.rows.length; i++) {
            let element = documentos.rows[i].doc;
            let option = document.createElement("option");
            option.value = element.categoria;
            option.text = element.categoria;
            document.getElementById('categoria').add(option);
        }
    });
}

function obtenerDatosProducto() {
    bdLista.get(idLista).then(lista => {
        lista.productos.forEach(producto => {
            if (producto._id == idProducto) {
                inputNombre.value = producto.nombreA
                inputCantidad.value = producto.cantidadA
                inputPrecio.value = producto.precioA
                inputCarrito.checked = producto.carrito
                selectCategoria.value = producto.categoriaA
                inputNota.value = producto.notaA
                inputCodigoBarras.value = producto.codigoBarras
                vistaPreviaImagen.setAttribute("src", producto.imagenA)
            }
        })
    })
}

//Vista previa cuando se seleccione una imagen
document.querySelector("#imagen").addEventListener("change", e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        const imagen = document.getElementById('imgFile');
        imagen.src = event.target.result;
        imagen.style = 'display: block; height: 50px; width: 50px';
    }
    reader.readAsDataURL(file);
})

//Funcionamiento del boton actualizar
document.querySelector("#btnActualizarProducto").onclick = click => {
    click.preventDefault()
    actualizarProducto()
}

async function actualizarProducto() {
    //Esto va hasta el final
    //window.location.href = "../pages/PaginaInicial.html"
    //Validar que el nombre tenga al menos un nombre y un precio
    if (inputNombre.value && inputPrecio.value) {
        bdProductos.get(idProducto).then(productoAEditar => {
            productoAEditar.nombreA = inputNombre.value
            productoAEditar.precioA = inputPrecio.value
            productoAEditar.categoriaA = selectCategoria.value
            productoAEditar.notaA = inputNota.value
            productoAEditar.codigoBarras = inputCodigoBarras.value

            const imagen = inputImagen.files[0];
            let imageDataURL = ""

            if (imagen) {
                const reader = new FileReader();
                reader.onload = e => {
                    imageDataURL = e.target.result;
                    productoAEditar.imagenA = imageDataURL
                }
                reader.readAsDataURL(imagen)
            }

            setTimeout(() => {
                //Editar el producto en la base de datos de productos
                bdProductos.put(productoAEditar).then(respuesta => {
                    if (respuesta.ok) {
                        //Editar el producto en todas las listas que lo contengan
                        bdLista.allDocs({
                            include_docs: true
                        }).then(listas => {
                            for (let i = 0; i < listas.rows.length; i++) {
                                for (let j = 0; j < listas.rows[i].doc.productos.length; j++) {
                                    if (listas.rows[i].doc.productos[j]._id == idProducto) {
                                        if (listas.rows[i].doc._id == idLista) {
                                            productoAEditar.cantidadA = inputCantidad.value
                                            productoAEditar.carrito = inputCarrito.checked
                                        }
                                        else {
                                            productoAEditar.cantidadA = listas.rows[i].doc.productos[j].cantidadA
                                            productoAEditar.carrito = listas.rows[i].doc.productos[j].carrito
                                        }
                                        listas.rows[i].doc.productos[j] = productoAEditar
                                        bdLista.put(listas.rows[i].doc)
                                    }
                                }
                            }
                        })
                    }
                }).then(() => {
                    console.log("Ya se deberían de ver reflejados los cambios en toda la página")
                })
            }, 300)
        })
    }
    else {
        swal({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, rellene todos los campos',
        });
    }
}

function limpiarcampos() {
    document.getElementById('nombreProducto').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('carrito').checked = false;
    document.getElementById('categoria').value = '';
    document.getElementById('nota').value = '';
    document.getElementById('codigoBarras').value = '';
    document.getElementById('imagen').value = "";
    document.getElementById('imgFile').src = '../img/imgSubir.png';
}