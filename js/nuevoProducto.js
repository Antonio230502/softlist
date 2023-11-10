"serviceWorker" in navigator && navigator.serviceWorker.register('sw.js');

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
inputNota.value = nota != "null" ? nota : ""
inputCodigoBarras.value = codigoBarras != "null" ? codigoBarras : ""

// Cargar las categorias en el select categorias de forma ordenada por nombre
document.addEventListener("DOMContentLoaded", obtenerCategoriasOrdenadas)

function obtenerCategoriasOrdenadas() {
    // Emitir las categorias con el campo "nombre" como clave
    function emitirCategorias(categoria) {
        categoria.categoria && emit(categoria.categoria, categoria);
    }

    // Verificar si el diseño de vista ya existe
    bdCategoria.get('_design/nombres')
        .then(realizarConsulta)
        .catch(err => {
            // Si el diseño de vista no existe, lo creamos
            if (err.name === 'not_found') {
                bdCategoria.put({
                    _id: '_design/nombres',
                    views: {
                        by_nombre: {
                            map: emitirCategorias.toString()
                        }
                    }
                }).then(realizarConsulta).catch(err => console.log(err));
            }
            else
                console.log(err);
        });

    // Función para realizar la consulta
    function realizarConsulta() {
        bdCategoria.query('nombres/by_nombre', {
            descending: false
        }).then(categorias => {
            let categoriasOrdenadas = categorias.rows.map(categoria => categoria.value);
            categoriasOrdenadas.forEach(categoria => {
                const option = document.createElement("option");
                option.value = categoria.categoria;
                option.text = categoria.categoria;
                selectCategoria.add(option);
            })
            if (categoriasOrdenadas.length == 0)
                document.querySelector("option").selected = true
            else
                selectCategoria.value = categoria != "null" ? categoria : "Sin categoría"
        }).catch(err => console.log(err));
    }
}

//Vista previa cuando se seleccione una imagen
document.querySelector("#imagen").addEventListener("change", e => {
    const file = e.target.files[0];
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
//codigo para el boton regresar
document.getElementById("botonRegresar").addEventListener("click", function() {
    window.history.back(); 
});
function agregarProductoPorDefecto() {
    const productoPorDefecto = {
        nombreA: 'Producto',
        precioA: '80',
        cantidadA: 1,
        categoriaA: 'Sin categoría',
        notaA: 'disfruta producto',
        codigoBarras: '1234567890',
        imagenA: '../img/producto.png',
    };

    bdProductos.post(productoPorDefecto).then((respuesta) => {
        if (respuesta.ok) {
            console.log('Producto por defecto agregado');
        }
    });
}


const inputnota = document.getElementById('nota');
inputnota.addEventListener('input', () => {
    let notaValue = inputnota.value;
    
    // Eliminar caracteres no permitidos (dejar solo letras)
    notaValue = notaValue.replace(/[^a-zA-Z ]/g, '');

  
    inputnota.value = notaValue;
});


inputCodigoBarras.addEventListener("input", () => {
    let codigoBarrasValue = inputCodigoBarras.value;
    codigoBarrasValue = codigoBarrasValue.replace(/[^A-Za-z0-9]/g, '');

   
    if (codigoBarrasValue.length > 10) {
        codigoBarrasValue = codigoBarrasValue.slice(0, 10);
    }

  
    inputCodigoBarras.value = codigoBarrasValue;
});

document.addEventListener("DOMContentLoaded", () => {
    const precioInput = document.getElementById("precio");
    precioInput.addEventListener("input", function () {
        if (/[^\d.]/.test(this.value)) {
            this.value = this.value.replace(/[^\d.]/g, '');
        }

        const decimalCount = this.value.split('.').length - 1;
        if (decimalCount > 1) {
            const parts = this.value.split('.');
            this.value = parts[0] + '.' + parts.slice(1).join('');
        }

        const parts = this.value.split('.');
        if (parts[1] && parts[1].length > 2) {
            this.value = parts[0] + '.' + parts[1].slice(0, 2);
        }
    });
});

    
    const altaButton = document.getElementById("alta");
    altaButton.addEventListener("click", () => {
       
    });