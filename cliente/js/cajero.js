let cajeros = [];

// Elementos del DOM para cajeros
const nuevoCajeroBtn = document.getElementById('nuevoCajero');
const cuerpoTabla2 = document.getElementById('cuerpoTabla2');
const cajeroModal = document.getElementById('cajeroModal');
const cajeroForm = document.getElementById('cajeroForm');
const modalTitulo2 = document.getElementById('modalTitulo2');
const idInput = document.getElementById('id');
const nombreInput2 = document.getElementById('nombre2');
const codBancoInput = document.getElementById('cod_banco');
const puestoInput = document.getElementById('puesto');
const rankingInput = document.getElementById('ranking');
const cancelarBtn2 = document.getElementById('cancelar2');

function cargarCajeros() {
    socket.send(JSON.stringify({ action: 'listarCajeros', token: token }));
}

function actualizarTablaCajeros() {
    cuerpoTabla2.innerHTML = '';
    if (!cajeros || cajeros.length === 0) {
        mostrarAviso('No hay cajeros registrados.', false);
        return;
    }
    cajeros.forEach(cajero => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${cajero.id}</td>
            <td>${cajero.nombre}</td>
            <td>${cajero.cod_banco}</td>
            <td>${cajero.puesto}</td>
            <td>${cajero.ranking}</td>
            <td>
                ${usuarioActual.rol !== 'lector' ? `<button onclick="editarCajero(${cajero.id})">Editar</button>` : ''}
                ${usuarioActual.rol === 'admin' ? `<button onclick="eliminarCajero(${cajero.id})">Eliminar</button>` : ''}
                <button onclick="consultarCajero(${cajero.id})">Consultar</button>
            </td>
        `;
        cuerpoTabla2.appendChild(fila);
    });
}

function editarCajero(id) {
    socket.send(JSON.stringify({ action: 'consultarCajero', id: id, token: token }));
    socket.addEventListener('message', function handleMessage(event) {
        const response = JSON.parse(event.data);
        if (response.action === 'consultarCajero' && response.status === 'success') {
            modalTitulo2.textContent = 'Editar Cajero';
            idInput.value = response.data.id;
            nombreInput2.value = response.data.nombre;
            codBancoInput.value = response.data.cod_banco;
            puestoInput.value = response.data.puesto;
            rankingInput.value = response.data.ranking;
            cajeroModal.style.display = 'block';
        }
        socket.removeEventListener('message', handleMessage);
    });
}

function eliminarCajero(id) {
    if (confirm('¿Confirmar eliminación del cajero?')) {
        socket.send(JSON.stringify({ action: 'eliminarCajero', id: id, token: token }));
    }
}

function consultarCajero(id) {
    socket.send(JSON.stringify({ action: 'consultarCajero', id: id, token: token }));
    socket.addEventListener('message', function handleMessage(event) {
        const response = JSON.parse(event.data);
        if (response.action === 'consultarCajero' && response.status === 'success') {
            alert(`ID: ${response.data.id}\nNombre: ${response.data.nombre}\nCód. Banco: ${response.data.cod_banco}\nPuesto: ${response.data.puesto}\nRanking: ${response.data.ranking}`);
        }
        socket.removeEventListener('message', handleMessage);
    });
}

if (nuevoCajeroBtn) {
    nuevoCajeroBtn.addEventListener('click', () => {
        modalTitulo2.textContent = 'Nuevo Cajero';
        cajeroForm.reset();
        idInput.value = '';
        cajeroModal.style.display = 'block';
    });
}

if (cancelarBtn2) {
    cancelarBtn2.addEventListener('click', () => {
        cajeroModal.style.display = 'none';
    });
}

if (cajeroForm) {
    cajeroForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const id = idInput?.value;
        const nombre = nombreInput2?.value.trim();
        const cod_banco = codBancoInput?.value.trim();
        const puesto = puestoInput?.value.trim();
        const ranking = rankingInput?.value.trim();
        if (!nombre || !cod_banco || !puesto || !ranking) {
            mostrarAviso('Por favor complete todos los campos');
            return;
        }
        if (ranking.length !== 1 || ranking < 1 || ranking > 5) {
            mostrarAviso('El ranking debe ser un número entre 1 y 5');
            return;
        }
        const action = id ? 'actualizarCajero' : 'crearCajero';
        socket.send(JSON.stringify({
            action: action,
            id: id || null,
            nombre: nombre,
            cod_banco: cod_banco,
            puesto: puesto,
            ranking: ranking,
            token: token
        }));
        cajeroModal.style.display = 'none';
    });
}

window.addEventListener('click', (event) => {
    if (cajeroModal && event.target === cajeroModal) {
        cajeroModal.style.display = 'none';
    }
});