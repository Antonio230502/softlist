"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creando / Accediendo a las bases de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
const bdProductos = new PouchDB("tiendita_Productos");

// Cargar las categorias en el select categorias
document.addEventListener("DOMContentLoaded", () => {
    bdCategoria.allDocs({ include_docs: true }).then(documentos => {
        for (let i = 0; i < documentos.rows.length; i++) {
            let element = documentos.rows[i].doc;
            let option = document.createElement("option");
            option.value = element.categoria;
            option.text = element.categoria;
            document.getElementById('categoria').add(option);
        }
    });
})

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

//Funcionamiento del boton agregar
document.querySelector("#alta").onclick = () => registrarProducto()

function registrarProducto() {
    const nombreA = document.getElementById('nombreProducto').value;
    const precioA = document.getElementById('precio').value;
    const categoriaA = document.getElementById('categoria').value;
    const notaA = document.getElementById('nota').value;
    const codigoBarras = document.getElementById('codigoBarras').value;
    let imageDataURL = "";

    if (nombreA && precioA && categoriaA && notaA) {
        const imagenA = document.getElementById('imagen');
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
    document.getElementById('nombreProducto').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('categoria').value = '';
    document.getElementById('nota').value = '';
    document.getElementById('codigoBarras').value = '';
    document.getElementById('imagen').value = "";
    document.getElementById('imgFile').src = '../img/imgSubir.png';
}