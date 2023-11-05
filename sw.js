//Seccion de cache
//1.Estatico: todos los recursos que necesita la app para funcionar.
//2.Dinamico: todos los recursos que se borraron del estatico y se reincorporan al cache.
//3.Inmutable: Es aquel que no sufre cambios (todos los recursos de terceros por ejemplo API's, boostrao, Jquery)
const cache_estatico = 'staticV3';
const cache_dinamico = 'dinamicV3';
const cache_inmutable = 'inmutableV3';

        

self.addEventListener('install', event=>{
            const cacheInstallEstatico = caches.open(cache_estatico) //open crea y abre el cache
              .then(cache=>{
                    return cache.addAll([
                       
                        'index.html',
                        'pages/Offline.html',
                        'pages/about.html',
                        'pages/editarProducto.html',
                        'pages/nuevaCategoria.html',
                        'pages/nuevaLista.html',
                        'pages/PaginaInicial.html',
                        'pages/verProductos.html',
                        'pages/nuevoProducto.html',
                        'pages/verListas.html',
                        'pages/verCategorias.html',

                        'img/No_Image.jpg',
                        'img/git.png',
                        'img/offline.jpg',
                        'img/imgSubir.png',
                        'img/icono.ico',
                        'js/funciones.js',
                        'js/librerias/pouchdb-8.0.1.min.js',
                        'js/funcionamientoBD.js',
                        'Manifest.json'
                       
                    ]);

                })

            const cacheInstallInmutable = caches.open(cache_inmutable)
            .then(cache=>{
                return cache.addAll([
                    'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
                    'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js',
                    'https://code.jquery.com/jquery-3.3.1.slim.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
                    'https://unpkg.com/sweetalert/dist/sweetalert.min.js'

                ]);
            })

                event.waitUntil(Promise.all([cacheInstallEstatico, cacheInstallInmutable]));
        });
    self.addEventListener('fetch', a => {
        const respuesta = new Promise((resolve, reject) => {
            let rechazada = false;
    
            const falloUnaVez = () => {
                if (rechazada) {
                    if (/\.(png|jpg)$/i.test(a.request.url)) {
                        resolve(caches.match('img/No_Image.png'));
                    } else {
                        reject('No se encontro respuesta')
                    }
                } else {
                    rechazada = true;
                }
            };
            // buscamos en internet
            fetch(a.request).then(res => {
                res.ok ? resolve(res) : falloUnaVez();
            }).catch(falloUnaVez);
            // buscamos en cache
            caches.match(a.request).then(res => {
                if (res) {
                    resolve(res);
                } else {
                    console.log('El recurso solicitado no esta en cache', a.request.url);
                    return fetch(a.request).then(newResp => {
                        caches.open(cache_dinamico).then(cache => {
                            cache.put(a.request, newResp);
                        })
                        resolve(newResp.clone());
                    });
                }
            }).catch(falloUnaVez);
        });
        // si la solicitud es para un documento HTML y falla la respuesta, responder con la página offline.html
        if (a.request.headers.get('accept').includes('text/html')) {
            a.respondWith(
                respuesta.catch(() => caches.match('pages/Offline.html'))
            );
        } else {
            a.respondWith(respuesta);
        }

    });