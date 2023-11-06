"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creando / Accediendo a las bases de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
const bdProductos = new PouchDB("tiendita_Productos");

//Elementos HTML
const inputNombre = document.getElementById('nombreProducto')
const inputPrecio = document.getElementById('precio')
const selectCategoria = document.getElementById('categoria')
const inputNota = document.getElementById('nota')
const inputCodigoBarras = document.getElementById('codigoBarras')
const inputImagen = document.getElementById('imagen')
const vistaPreviaImagen = document.getElementById('imgFile')

//Obtener los datos del producto en caso de que haya agregado una categoría desde esta interfaz
const url = new URL(window.location.href);
const nombre = decodeURIComponent(url.searchParams.get("nombre"))
const precio = decodeURIComponent(url.searchParams.get("precio"))
const categoria = decodeURIComponent(url.searchParams.get("categoria"))
const nota = decodeURIComponent(url.searchParams.get("nota"))
const codigoBarras = decodeURIComponent(url.searchParams.get("codigoBarras"))

inputNombre.value = nombre != "null" ? nombre : "" 
inputPrecio.value = precio != "null" ? precio : "" 
selectCategoria.value = categoria != "null" ? categoria : "" 
inputNota.value = nota != "null" ? nota : "" 
inputCodigoBarras.value = codigoBarras != "null" ? codigoBarras : "" 

// Cargar las categorias en el select categorias
document.addEventListener("DOMContentLoaded", () => {
    bdCategoria.allDocs({ include_docs: true }).then(documentos => {
        for (let i = 0; i < documentos.rows.length; i++) {
            let element = documentos.rows[i].doc;
            let option = document.createElement("option");
            option.value = element.categoria;
            option.text = element.categoria;
            selectCategoria.add(option);
        }
    });
})

//Vista previa cuando se seleccione una imagen
document.querySelector("#imagen").addEventListener("change", e => {
    const file = e.target.files[0];
    console.log(file)
    const reader = new FileReader();
    reader.onload = function (event) {
        vistaPreviaImagen.src = event.target.result;
        vistaPreviaImagen.style = 'display: block; height: 50px; width: 50px';
    }
    reader.readAsDataURL(file);
})

//Funcionamiento del boton editar categorias
document.querySelector("#editarCategorias").onclick = () => window.location.href = `../pages/verCategorias.html?regresar=nuevoProducto.html&nombre=${encodeURIComponent(inputNombre.value)}&precio=${encodeURIComponent(inputPrecio.value)}&categoria=${encodeURIComponent(selectCategoria.value)}&nota=${encodeURIComponent(inputNota.value)}&codigoBarras=${encodeURIComponent(inputCodigoBarras.value)}`
//Funcionamiento del boton agregar
document.querySelector("#alta").onclick = () => registrarProducto()

function registrarProducto() {
    const nombreA = inputNombre.value;
    const precioA = inputPrecio.value;
    const categoriaA = selectCategoria.value;
    const notaA = inputNota.value;
    const codigoBarras = inputCodigoBarras.value;
    let imageDataURL = "";

    if (nombreA && precioA && categoriaA && notaA) {
        const imagenA = inputImagen;
        const imagen = imagenA.files[0];

        if (imagen) {
            const reader = new FileReader();
            reader.onload = e => {
                imageDataURL = e.target.result;
                bdProductos.post({
                    nombreA: nombreA,
                    precioA: precioA,
                    cantidadA: 1,
                    categoriaA: categoriaA,
                    notaA: notaA,
                    codigoBarras: codigoBarras,
                    imagenA: imageDataURL
                }).then(respuesta => {
                    if (respuesta.ok) {
                        swal({
                            icon: 'success',
                            title: 'Producto guardado',
                        });
                        limpiarcampos();
                        document.querySelector(".swal-button--confirm").onclick = () => window.location.href = "../pages/verProductos.html"
                    }
                });
            };
            reader.readAsDataURL(imagen);
        } else {
            bdProductos.post({
                nombreA: nombreA,
                precioA: precioA,
                cantidadA: 1,
                categoriaA: categoriaA,
                notaA: notaA,
                codigoBarras: codigoBarras,
                imagenA: "../img/imgSubir.png"
            }).then(respuesta => {
                if (respuesta.ok) {
                    swal({
                        icon: 'success',
                        title: 'Producto guardado',
                    });
                    limpiarcampos();
                    document.querySelector(".swal-button--confirm").onclick = () => window.location.href = "../pages/verProductos.html"
                }
            });
        }
    } else {
        swal({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, rellene todos los campos',
        });
    }
}

function limpiarcampos() {
    inputNombre.value = '';
    inputPrecio.value = '';
    selectCategoria.value = '';
    inputNota.value = '';
    inputCodigoBarras.value = '';
    inputImagen.value = "";
    vistaPreviaImagen.src = '../img/imgSubir.png';
}