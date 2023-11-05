"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Creando / Accediendo a las bases de datos
const bdCategoria = new PouchDB("tiendita_Categoria");

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
                document.querySelector(".swal-button--confirm").onclick = () => window.location.href = "../pages/verCategorias.html"
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