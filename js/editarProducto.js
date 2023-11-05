"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creando / Accediendo a las bases de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
const bdProductos = new PouchDB("tiendita_Productos");
//Obtener el id del producto a editar
const url = new URL(window.location.href);
const idProducto = url.searchParams.get("id");
//Objetos HTML
const inputNombre = document.querySelector("#nombreProducto")
const inputCantidad = document.querySelector("#cantidad")
const inputPrecio = document.querySelector("#precio")
const selectCategoria = document.querySelector("#categoria")
const inputNota = document.querySelector("#nota")
const inputCodigoBarras = document.querySelector("#codigoBarras")
const inputImagen = document.querySelector("#imagen")
const vistaPreviaImagen = document.querySelector("#imgFile")

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
    bdProductos.get(idProducto).then(producto => {
        inputNombre.value = producto.nombreA
        inputPrecio.value = producto.precioA
        selectCategoria.value = producto.categoriaA
        inputNota.value = producto.notaA
        inputCodigoBarras.value = producto.codigoBarras
        vistaPreviaImagen.setAttribute("src", producto.imagenA)
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
                        if (respuesta.ok) {
                            swal({
                                icon: 'success',
                                title: 'Producto Actualizado',
                            });
                            limpiarcampos();
                            document.querySelector(".swal-button--confirm").onclick = () => window.location.href = "../pages/verProductos.html"
                        }
                    });
                };
                reader.readAsDataURL(imagen);
            } else {
                bdProductos.post(producto).then(respuesta => {
                    if (respuesta.ok) {
                        swal({
                            icon: 'success',
                            title: 'Producto Actualizado',
                        });
                        limpiarcampos();
                        document.querySelector(".swal-button--confirm").onclick = () => window.location.href = "../pages/verProductos.html"
                    }
                });
            }
        })
    } else {
        swal({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, rellene todos los campos',
        });
    }

}

function limpiarcampos() {
    document.getElementById('nombreProducto').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('nota').value = '';
    document.getElementById('codigoBarras').value = '';
    document.getElementById('imagen').value = "";
    document.getElementById('imgFile').src = '../img/imgSubir.png';
}