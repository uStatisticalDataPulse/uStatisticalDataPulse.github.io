/* Statistical DataPulse 2026 — interacciones mínimas.
   El desplazamiento suave lo hace CSS (scroll-behavior), no hace falta JS. */
document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Menú móvil ---------- */
    var boton = document.getElementById('boton-menu');
    var menu = document.getElementById('menu-movil');

    if (boton && menu) {
        boton.addEventListener('click', function () {
            var abierto = menu.classList.toggle('abierto');
            boton.setAttribute('aria-expanded', String(abierto));
            boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
        });

        menu.querySelectorAll('a').forEach(function (enlace) {
            enlace.addEventListener('click', function () {
                menu.classList.remove('abierto');
                boton.setAttribute('aria-expanded', 'false');
                boton.setAttribute('aria-label', 'Abrir menú');
            });
        });
    }

    /* ---------- Sección actual en la barra ----------
       Marca con aria-current el enlace de la sección que cruza el centro de la
       pantalla; el estilo ya está en styles.css. «Inscríbete» no se marca: es
       un botón, y esa regla le pondría texto blanco sobre el naranja. */
    var enlacesSeccion = document.querySelectorAll('.barra__enlaces a[href^="#"]:not(.barra__cta), .menu-movil a[href^="#"]');
    var secciones = document.querySelectorAll('main > section[id]');

    if (enlacesSeccion.length && secciones.length && 'IntersectionObserver' in window) {
        /* La sección «Convocatoria y recursos» se llama así en el menú. */
        var alias = { convocatoria: 'recursos' };
        var visibles = {};

        var observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) { visibles[entrada.target.id] = entrada.isIntersecting; });
            var actual = Array.prototype.filter.call(secciones, function (s) { return visibles[s.id]; })[0];
            var destino = actual ? '#' + (alias[actual.id] || actual.id) : '';
            enlacesSeccion.forEach(function (enlace) {
                if (enlace.getAttribute('href') === destino) enlace.setAttribute('aria-current', 'location');
                else enlace.removeAttribute('aria-current');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        secciones.forEach(function (seccion) { observador.observe(seccion); });
    }

    /* ---------- Hora del evento ----------
       Fecha (AAAA-MM-DD) y minuto del día en Bogotá, esté donde esté quien mira.
       Para probar se puede simular otro momento con ?ahora=2026-11-12T10:30. */
    function ahoraEnBogota() {
        var prueba = /[?&]ahora=(\d{4}-\d{2}-\d{2})T(\d{1,2}):(\d{2})/.exec(location.search);
        if (prueba) return { fecha: prueba[1], minuto: Number(prueba[2]) * 60 + Number(prueba[3]) };
        try {
            var partes = {};
            new Intl.DateTimeFormat('en-CA', {
                timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
            }).formatToParts(new Date()).forEach(function (p) { partes[p.type] = p.value; });
            return { fecha: partes.year + '-' + partes.month + '-' + partes.day, minuto: Number(partes.hour) * 60 + Number(partes.minute) };
        } catch (e) {
            return { fecha: '', minuto: -1 };
        }
    }

    /* Pone «AHORA» en la franja del panel cuyo horario («10:00 – 12:00») contiene
       la hora actual, y se la quita a la que ya pasó. */
    function marcarAhora(panel) {
        var minuto = ahoraEnBogota().minuto;
        panel.querySelectorAll('.etiqueta--ahora').forEach(function (e) { e.remove(); });
        Array.prototype.forEach.call(panel.children, function (franja) {
            franja.classList.remove('franja--ahora');
            var hora = franja.querySelector(':scope > .franja__hora');
            var rango = hora && /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/.exec(hora.textContent);
            if (!rango) return;
            var desde = Number(rango[1]) * 60 + Number(rango[2]);
            var hasta = Number(rango[3]) * 60 + Number(rango[4]);
            if (minuto >= desde && minuto < hasta) {
                franja.classList.add('franja--ahora');
                var etiqueta = document.createElement('span');
                etiqueta.className = 'etiqueta etiqueta--ahora';
                etiqueta.textContent = 'AHORA';
                hora.appendChild(etiqueta);
            }
        });
    }

    /* ---------- Pestañas de día del programa ----------
       Sin JS se ven los dos paneles seguidos, que también es correcto;
       aquí sólo se convierte en pestañas. */
    var listas = document.querySelectorAll('[role="tablist"]');

    listas.forEach(function (lista) {
        var pestanas = Array.prototype.slice.call(lista.querySelectorAll('[role="tab"]'));
        if (!pestanas.length) return;

        var paneles = pestanas.map(function (p) {
            return document.getElementById(p.getAttribute('aria-controls'));
        });

        function activar(indice, mover) {
            pestanas.forEach(function (pestana, i) {
                var activa = i === indice;
                pestana.setAttribute('aria-selected', String(activa));
                pestana.setAttribute('tabindex', activa ? '0' : '-1');
                if (paneles[i]) paneles[i].hidden = !activa;
            });
            if (mover) pestanas[indice].focus();
        }

        pestanas.forEach(function (pestana, i) {
            pestana.addEventListener('click', function () { activar(i, false); });
            pestana.addEventListener('keydown', function (evento) {
                var salto = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[evento.key];
                if (salto) {
                    evento.preventDefault();
                    activar((i + salto + pestanas.length) % pestanas.length, true);
                } else if (evento.key === 'Home') {
                    evento.preventDefault();
                    activar(0, true);
                } else if (evento.key === 'End') {
                    evento.preventDefault();
                    activar(pestanas.length - 1, true);
                }
            });
        });

        /* «Ver el jueves» / «Ver el miércoles» al final de cada día: cambia de
           pestaña y sube a las pestañas, que en celular quedan unos 3.000 px
           más arriba. */
        document.querySelectorAll('[data-pestana]').forEach(function (cambio) {
            var indice = pestanas.findIndex(function (p) { return p.id === cambio.getAttribute('data-pestana'); });
            if (indice === -1) return;
            cambio.hidden = false;
            cambio.addEventListener('click', function () {
                activar(indice, false);
                lista.scrollIntoView({ block: 'start' });
                pestanas[indice].focus({ preventScroll: true });
            });
        });

        /* Durante el evento, el programa abre en el día de hoy y marca la franja en curso. */
        var hoy = ahoraEnBogota().fecha;
        var delDia = pestanas.findIndex(function (p) { return p.getAttribute('data-fecha') === hoy; });
        var inicial = delDia !== -1 ? delDia : pestanas.findIndex(function (p) { return p.getAttribute('aria-selected') === 'true'; });
        activar(inicial === -1 ? 0 : inicial, false);

        if (delDia !== -1 && paneles[delDia]) {
            marcarAhora(paneles[delDia]);
            setInterval(function () { marcarAhora(paneles[delDia]); }, 60000);
        }
    });
});
