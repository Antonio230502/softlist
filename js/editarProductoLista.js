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
                console.log(`¿El producto está en el carrito? ${producto.carrito}`)
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

function actualizarProducto() {
    actualizacionCorrecta = true
    actualizarProductoBD()
    actualizarProductoLista()

    console.log(actualizacionCorrecta)
    if (actualizacionCorrecta) {
        swal({
            icon: 'success',
            title: 'Producto Actualizado',
        });
        limpiarcampos();
        document.querySelector(".swal-button--confirm").onclick = () => window.location.href = "../pages/PaginaInicial.html"
    }
    else {
        swal({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, rellene todos los campos',
        });
    }
}

function actualizarProductoBD() {
    const nombreA = inputNombre.value;
    const precioA = inputPrecio.value;
    const categoriaA = selectCategoria.value;
    const notaA = inputNota.value;
    let imageDataURL = "";

    if (nombreA && precioA && categoriaA && notaA) {
        const imagenA = document.getElementById('imagen');
        const imagen = imagenA.files[0];

        bdProductos.get(idProducto).then(producto => {
            producto.nombreA = inputNombre.value
            producto.precioA = inputPrecio.value
            producto.categoriaA = selectCategoria.value
            producto.notaA = inputNota.value
            producto.codigoBarras = inputCodigoBarras.value

            if (imagen) {
                const reader = new FileReader();
                reader.onload = e => {
                    imageDataURL = e.target.result;
                    producto.imagenA = imageDataURL
                    bdProductos.post(producto).then(respuesta => {
                        if (!respuesta.ok)
                            actualizacionCorrecta = false
                    });
                };
                reader.readAsDataURL(imagen);
            } else {
                bdProductos.post(producto).then(respuesta => {
                    if (!respuesta.ok)
                        actualizacionCorrecta = false
                });
            }
        })
    } else
        actualizacionCorrecta = false
}

function actualizarProductoLista() {
    const nombreA = inputNombre.value;
    const cantidadA = inputCantidad.value;
    const precioA = inputPrecio.value;
    const carrito = inputCarrito.checked;
    const categoriaA = selectCategoria.value;
    const notaA = inputNota.value;
    let imageDataURL = "";

    if (nombreA && precioA && categoriaA && notaA) {
        const imagenA = document.getElementById('imagen');
        const imagen = imagenA.files[0];

        bdLista.get(idLista).then(lista => {
            for (let i = 0; i < lista.productos.length; i++) {
                if (lista.productos[i]._id == idProducto) {
                    lista.productos[i].nombreA = nombreA
                    lista.productos[i].cantidadA = cantidadA != "" ? cantidadA : 1
                    lista.productos[i].precioA = precioA
                    lista.productos[i].categoriaA = categoriaA
                    lista.productos[i].carrito = carrito
                    lista.productos[i].codigoBarras = inputNombre.value

                    if (imagen) {
                        const reader = new FileReader();
                        reader.onload = e => {
                            imageDataURL = e.target.result;
                            lista.productos[i].imagenA = imageDataURL
                            bdLista.post(lista).then(respuesta => {
                                if (!respuesta.ok)
                                    actualizacionCorrecta = false
                            })
                        };
                        reader.readAsDataURL(imagen);
                    } else {
                        bdLista.post(lista).then(respuesta => {
                            if (!respuesta.ok)
                                actualizacionCorrecta = false
                        })
                    }
                }
            }
        })
    } else
        actualizacionCorrecta = false
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