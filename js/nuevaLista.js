"serviceWorker" in navigator && navigator.serviceWorker.register('../sw.js');

//Obtener las listas de la base de datos
const bdLista = new PouchDB("tiendita_listas");

const botonAgregarLista = document.querySelector("#alta")
botonAgregarLista.onclick = () => {
    const nombreLista = document.getElementById('nombreLista').value;
    if (nombreLista) {
        bdLista.post(
            {
                nombreLista: nombreLista,
                seleccionada: false,
                productos: []
            }).then(respuesta => {
                if (respuesta.ok) {
                    swal({
                        icon: 'success',
                        title: 'Lista guardada',
                    });
                    document.querySelector("#nombreLista").value = ""
                    document.querySelector(".swal-button--confirm").onclick = () => window.location.href = "../pages/verListas.html"
                }
            });
    }
    else {
        swal({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, rellene todos los campos',
        });
    }
}