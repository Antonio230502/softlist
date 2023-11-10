let CACHE_NAME = "Boveda Principal"

self.addEventListener('install', e => {

    const recursos = caches.open(CACHE_NAME).then(cache => {
        cache.add('/'),
            cache.add('css/librerias/all.min.css'),
            cache.add('css/librerias/bootstrap.min.css'),
            cache.add('css/about.css'),
            cache.add('css/agregarProductoLista.css'),
            cache.add('css/editarProducto.css'),
            cache.add('css/editarProductoLista.css'),
            cache.add('css/index.css'),
            cache.add('css/nuevaCategoria.css'),
            cache.add('css/nuevaLista.css'),
            cache.add('css/nuevoProducto.css'),
            cache.add('css/PaginaInicial.css'),
            cache.add('css/verCategorias.css'),
            cache.add('css/verLista.css'),
            cache.add('css/verProductos.css'),

            cache.add('img/icono/faviAlert.ico'),
            cache.add('img/icono/i1.png'),
            cache.add('img/icono/i2.png'),
            cache.add('img/icono/i3.png'),
            cache.add('img/icono/i4.png'),
            cache.add('img/icono/i5.png'),
            cache.add('img/icono/i6.png'),
            cache.add('img/America.jpg'),
            cache.add('img/antonio.jpg'),
            cache.add('img/calculadora.png'),
            cache.add('img/carrito-de-compras.png'),
            cache.add('img/carrito.png'),
            cache.add('img/coca.jpg'),
            cache.add('img/fondo.jpg'),
            cache.add('img/fondo2.jpg'),
            cache.add('img/git.png'),
            cache.add('img/icono.ico'),
            cache.add('img/imgSubir.png'),
            cache.add('img/jamon.jpg'),
            cache.add('img/jocelin.jpg'),
            cache.add('img/lapiz.png'),
            cache.add('img/leche.jpg'),
            cache.add('img/No_Image.jpg'),
            cache.add('img/offline.jpg'),
            cache.add('icono.png'),

            cache.add('js/librerias/bootstrap.min.js'),
            cache.add('js/librerias/jquery-3.3.1.slim.min.js'),
            cache.add('js/librerias/pouchdb-8.0.1.min.js'),
            cache.add('js/librerias/sweetalert.min.js'),
            cache.add('js/agregarProductoLista.js'),
            cache.add('js/editarProducto.js'),
            cache.add('js/editarProductoLista.js'),
            cache.add('js/index.js'),
            cache.add('js/nuevaCategoria.js'),
            cache.add('js/nuevaLista.js'),
            cache.add('js/nuevoProducto.js'),
            cache.add('js/PaginaInicial.js'),
            cache.add('js/verCategorias.js'),
            cache.add('js/verLista.js'),
            cache.add('js/verProductos.js'),

            cache.add('pages/about.html'),
            cache.add('pages/agregarProductoLista.html'),
            cache.add('pages/editarProducto.html'),
            cache.add('pages/editarProductoLista.html'),
            cache.add('pages/nuevaCategoria.html'),
            cache.add('pages/nuevaLista.html'),
            cache.add('pages/nuevoProducto.html'),
            cache.add('pages/PaginaInicial.html'),
            cache.add('pages/verCategorias.html'),
            cache.add('pages/verLista.html'),
            cache.add('pages/verProductos.html'),
            cache.add('index.html'),

            cache.add('manifest.json'),
            cache.add('sw.js')
    })

    e.waitUntil(recursos);
})

self.addEventListener('fetch', e => {

    //Estrategia 3 first network then cache
    const respuesta = fetch(e.request).then(newResp => {
        caches.open(CACHE_NAME)
            .then(cache => {
                cache.put(e.request, newResp)
            });

        return newResp.clone()
    }).catch(err => {
        return caches.match(e.request)
    })
    e.respondWith(respuesta);
})