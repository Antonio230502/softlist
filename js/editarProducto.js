"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creando / Accediendo a las bases de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
const bdProductos = new PouchDB("tiendita_Productos");
const bdLista = new PouchDB("tiendita_listas");
//Obtener el id del producto a editar
const url = new URL(window.location.href);
const idProducto = url.searchParams.get("id");
//Objetos HTML
const inputNombre = document.querySelector("#nombreProducto")
const inputPrecio = document.querySelector("#precio")
const selectCategoria = document.querySelector("#categoria")
const inputNota = document.querySelector("#nota")
const inputCodigoBarras = document.querySelector("#codigoBarras")
const inputImagen = document.querySelector("#imagen")
const vistaPreviaImagen = document.querySelector("#imgFile")

//Obtener los datos del producto en caso de que haya agregado una categoría desde esta interfaz
const nombre = decodeURIComponent(url.searchParams.get("nombre"))
const precio = decodeURIComponent(url.searchParams.get("precio"))
const categoria = decodeURIComponent(url.searchParams.get("categoria"))
const nota = decodeURIComponent(url.searchParams.get("nota"))
const codigoBarras = decodeURIComponent(url.searchParams.get("codigoBarras"))
let categoriaOriginal = ""

// Cargar las categorias en el select categorias
document.addEventListener("DOMContentLoaded", () => {
    obtenerDatosProducto()
    obtenerCategoriasOrdenadas()
})

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
                selectCategoria.value = categoria != "null" ? categoria : categoriaOriginal
        }).catch(err => console.log(err));
    }
}

function obtenerDatosProducto() {
    bdProductos.get(idProducto).then(producto => {
        inputNombre.value = producto.nombreA
        inputPrecio.value = producto.precioA
        selectCategoria.value = producto.categoriaA
        categoriaOriginal = producto.categoriaA
        inputNota.value = producto.notaA
        inputCodigoBarras.value = producto.codigoBarras
        vistaPreviaImagen.setAttribute("src", producto.imagenA)

        if (!(nombre == "null" && precio == "null" && categoria == "null" && nota == "null" && codigoBarras == "null")) {
            inputNombre.value = nombre != "null" ? nombre : ""
            inputPrecio.value = precio != "null" ? precio : ""
            inputNota.value = nota != "null" ? nota : ""
            inputCodigoBarras.value = codigoBarras != "null" ? codigoBarras : ""
        }
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
                    //Actualizar el producto en todas las listas que lo contengan
                    bdLista.allDocs({
                        include_docs: true
                    }).then(listas => {
                        for (let i = 0; i < listas.rows.length; i++) {
                            const lista = listas.rows[i].doc
                            
                            if(lista.nombreLista == undefined)
                                continue
                                
                            for (let j = 0; j < lista.productos.length; j++)
                                if (lista.productos[j]._id == idProducto)
                                    lista.productos[j] = producto
                            bdLista.post(lista)
                        }
                        //Actualizar el producto en la base de datos Producto
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
                    })
                };
                reader.readAsDataURL(imagen);
            } else {
                //Actualizar el producto en todas las listas que lo contengan
                bdLista.allDocs({
                    include_docs: true
                }).then(listas => {
                    for (let i = 0; i < listas.rows.length; i++) {

                        const lista = listas.rows[i].doc
                        if(lista.nombreLista == undefined)
                            continue

                        for (let j = 0; j < lista.productos.length; j++)
                            if (lista.productos[j]._id == idProducto)
                                lista.productos[j] = producto
                        bdLista.post(lista)
                    }
                    //Actualizar el producto en la base de datos Producto
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
                })
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

//Funcionamiento del boton editar categorias
document.querySelector("#editarCategorias").onclick = click => {
    click.preventDefault()
    window.location.href = `../pages/verCategorias.html?id=${idProducto}&regresar=editarProducto.html&nombre=${encodeURIComponent(inputNombre.value)}&precio=${encodeURIComponent(inputPrecio.value)}&categoria=${encodeURIComponent(selectCategoria.value)}&nota=${encodeURIComponent(inputNota.value)}&codigoBarras=${encodeURIComponent(inputCodigoBarras.value)}`
}

//codigo para el boton regresar
document.getElementById("botonRegresar").addEventListener("click", function() {
    window.history.back(); 
});