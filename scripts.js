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

        var inicial = pestanas.findIndex(function (p) { return p.getAttribute('aria-selected') === 'true'; });
        activar(inicial === -1 ? 0 : inicial, false);
    });
});
