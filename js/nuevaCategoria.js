"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creando / Accediendo a las bases de datos
const bdCategoria = new PouchDB("tiendita_Categoria");
//Saber si tengo que regresar
const url = new URL(window.location.href);
const id = url.searchParams.get("id");
const regresar = url.searchParams.get("regresar");
const nombre = decodeURIComponent(url.searchParams.get("nombre"))
const precio = decodeURIComponent(url.searchParams.get("precio"))
const categoria = decodeURIComponent(url.searchParams.get("categoria"))
const nota = decodeURIComponent(url.searchParams.get("nota"))
const codigoBarras = decodeURIComponent(url.searchParams.get("codigoBarras"))
const carrito = url.searchParams.get("carrito");
const cantidad = url.searchParams.get("cantidad");

//Crear categoria
const botonAgregarCategoria = document.querySelector("#alta")
botonAgregarCategoria.onclick = () => {
    const categoria = document.getElementById('nombreCategoria').value;
    if (categoria) {
        bdCategoria.post({ categoria: categoria }).then(respuesta => {
            if (respuesta.ok) {
                swal({
                    icon: 'success',
                    title: 'Categoria guardada',
                });
                document.querySelector("#nombreCategoria").value = ""
                document.querySelector(".swal-button--confirm").onclick = () => {
                    switch (regresar) {
                        case "nuevoProducto.html":
                            window.location.href = `../pages/${regresar}?nombre=${encodeURIComponent(nombre)}&precio=${encodeURIComponent(precio)}&categoria=${encodeURIComponent(categoria)}&nota=${encodeURIComponent(nota)}&codigoBarras=${encodeURIComponent(codigoBarras)}`
                            break;
                        case "editarProducto.html":
                            window.location.href = `../pages/${regresar}?id=${id}&nombre=${encodeURIComponent(nombre)}&precio=${encodeURIComponent(precio)}&categoria=${encodeURIComponent(categoria)}&nota=${encodeURIComponent(nota)}&codigoBarras=${encodeURIComponent(codigoBarras)}`
                            break;
                        default:
                            window.location.href = "../pages/verCategorias.html"
                            break;
                    }
                }
            }
        });
    } else {
        swal({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, rellene todos los campos',
        });
    }
}