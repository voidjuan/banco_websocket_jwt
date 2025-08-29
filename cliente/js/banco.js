const socket = new WebSocket('ws://localhost:8080');
let bancos = [];
let usuarioActual = null;
let token = localStorage.getItem('jwtToken') || null;

// Elementos del DOM
const loginSection = document.getElementById('loginSection');
const mainSection = document.getElementById('mainSection');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const perfilBtn = document.getElementById('perfilBtn');
const perfilInfo = document.getElementById('perfilInfo');
const nuevoBancoBtn = document.getElementById('nuevoBanco');
const cuerpoTabla = document.getElementById('cuerpoTabla');
const bancoModal = document.getElementById('bancoModal');
const bancoForm = document.getElementById('bancoForm');
const modalTitulo = document.getElementById('modalTitulo');
const codigoInput = document.getElementById('codigo');
const nombreInput = document.getElementById('nombre');
const codTransaccionInput = document.getElementById('cod_transaccion');
const cancelarBtn = document.getElementById('cancelar');
const perfilModal = document.getElementById('perfilModal');
const cerrarPerfilBtn = document.getElementById('cerrarPerfil');
const avisoError = document.getElementById('avisoError');

// Elementos del modal de perfil
const editNombre = document.getElementById('editNombre');
const viewUsername = document.getElementById('viewUsername');
const editEmail = document.getElementById('editEmail');
const viewRol = document.getElementById('viewRol');
const editRol = document.getElementById('editRol');
const editarPerfilBtn = document.getElementById('editarPerfilBtn');
const guardarPerfilBtn = document.getElementById('guardarPerfilBtn');
const cancelarEdicionBtn = document.getElementById('cancelarEdicionBtn');
const cambiarPasswordBtn = document.getElementById('cambiarPasswordBtn');
const passwordContainer = document.getElementById('passwordContainer');
const currentPassword = document.getElementById('currentPassword');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');

function actualizarInterfaz() {
    if (usuarioActual) {
        loginSection.style.display = 'none';
        mainSection.style.display = 'block';
        perfilInfo.textContent = `Bienvenido, ${usuarioActual.nombre} (${usuarioActual.rol})`;
        nuevoBancoBtn.style.display = ['editor', 'admin'].includes(usuarioActual.rol) ? 'block' : 'none';
    } else {
        loginSection.style.display = 'block';
        mainSection.style.display = 'none';
        perfilInfo.textContent = '';
    }
}

function mostrarAviso(mensaje, esError = true) {
    if (!avisoError) return;
    avisoError.textContent = mensaje;
    avisoError.style.display = 'block';
    avisoError.style.color = esError ? 'red' : 'green';
    setTimeout(ocultarAviso, 5000);
}

function ocultarAviso() {
    if (avisoError) {
        avisoError.textContent = '';
        avisoError.style.display = 'none';
    }
}

function cargarBancos() {
    socket.send(JSON.stringify({ action: 'listar', token: token }));
}

function actualizarTablaBancos() {
    cuerpoTabla.innerHTML = '';
    if (!bancos || bancos.length === 0) {
        mostrarAviso('No hay bancos registrados.', false);
        return;
    }
    bancos.forEach(banco => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${banco.codigo}</td>
            <td>${banco.nombre}</td>
            <td>${banco.cod_transaccion}</td>
            <td>
                ${usuarioActual.rol !== 'lector' ? `<button onclick="editarBanco(${banco.codigo})">Editar</button>` : ''}
                ${usuarioActual.rol === 'admin' ? `<button onclick="eliminarBanco(${banco.codigo})">Eliminar</button>` : ''}
                <button onclick="consultarBanco(${banco.codigo})">Consultar</button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

function editarBanco(codigo) {
    socket.send(JSON.stringify({ action: 'consultar', codigo: codigo, token: token }));
    socket.addEventListener('message', function handleMessage(event) {
        const response = JSON.parse(event.data);
        if (response.action === 'consultar' && response.status === 'success') {
            modalTitulo.textContent = 'Editar Banco';
            codigoInput.value = response.data.codigo;
            nombreInput.value = response.data.nombre;
            codTransaccionInput.value = response.data.cod_transaccion;
            bancoModal.style.display = 'block';
        }
        socket.removeEventListener('message', handleMessage);
    });
}

function eliminarBanco(codigo) {
    if (confirm('¿Confirmar eliminación del banco?')) {
        socket.send(JSON.stringify({ action: 'eliminar', codigo: codigo, token: token }));
    }
}

function consultarBanco(codigo) {
    socket.send(JSON.stringify({ action: 'consultar', codigo: codigo, token: token }));
    socket.addEventListener('message', function handleMessage(event) {
        const response = JSON.parse(event.data);
        if (response.action === 'consultar' && response.status === 'success') {
            alert(`Código: ${response.data.codigo}\nNombre: ${response.data.nombre}\nCód. Transacción: ${response.data.cod_transaccion}`);
        }
        socket.removeEventListener('message', handleMessage);
    });
}

socket.onopen = function (e) {
    console.log('Conexión establecida');
    actualizarInterfaz();
    if (token) {
        socket.send(JSON.stringify({ action: 'login', token: token }));
    }
};

socket.onmessage = function (event) {
    try {
        const response = JSON.parse(event.data);
        ocultarAviso();
        switch (response.action) {
            case 'login':
                if (response.status === 'success') {
                    usuarioActual = response.usuario;
                    token = response.token;
                    localStorage.setItem('jwtToken', token);
                    actualizarInterfaz();
                    cargarBancos();
                    cargarCajeros(); // Definida en cajero.js
                    mostrarAviso('Sesión iniciada correctamente', false);
                } else {
                    mostrarAviso(response.message || 'Error en el login');
                }
                break;
            case 'logout':
                if (response.status === 'success') {
                    usuarioActual = null;
                    token = null;
                    localStorage.removeItem('jwtToken');
                    actualizarInterfaz();
                    mostrarAviso('Sesión cerrada correctamente', false);
                } else {
                    mostrarAviso(response.message || 'Error al cerrar sesión');
                }
                break;
            case 'perfil':
                if (response.status === 'success') {
                    mostrarPerfil(response.usuario);
                } else {
                    mostrarAviso(response.message || 'Error al cargar perfil');
                }
                break;
            case 'actualizarPerfil':
                if (response.status === 'success') {
                    usuarioActual = response.usuario;
                    token = response.token;
                    localStorage.setItem('jwtToken', token);
                    actualizarInterfaz();
                    mostrarAviso('Perfil actualizado correctamente', false);
                    cancelarEdicionPerfil();
                } else {
                    mostrarAviso(response.message || 'Error al actualizar perfil');
                }
                break;
            case 'listar':
                if (response.status === 'success') {
                    bancos = response.data;
                    actualizarTablaBancos();
                    if (!bancos || bancos.length === 0) {
                        mostrarAviso('No hay bancos registrados.', false);
                    }
                } else {
                    mostrarAviso(response.message || 'Error al listar bancos.');
                }
                break;
            case 'crear':
            case 'actualizar':
            case 'eliminar':
                if (response.status === 'success') {
                    cargarBancos();
                    mostrarAviso(response.message, false);
                } else {
                    mostrarAviso(response.message || 'Error en la operación');
                }
                break;
            case 'notificacion':
                if (response.tipo === 'actualizacionBancos') {
                    cargarBancos();
                } else if (response.tipo === 'actualizacionCajeros') {
                    cargarCajeros();
                }
                break;
        }
    } catch (e) {
        mostrarAviso('Error al procesar mensaje del servidor');
    }
};

function mostrarPerfil(usuario) {
    if (!perfilModal) return;
    editNombre.value = usuario.nombre;
    editEmail.value = usuario.email;
    viewUsername.textContent = usuario.username;
    viewRol.textContent = usuario.rol;
    editRol.value = usuario.rol;
    perfilModal.style.display = 'block';
}

function habilitarEdicionPerfil() {
    if (!editNombre || !editEmail || !editRol) return;
    editNombre.style.display = 'inline-block';
    editEmail.style.display = 'inline-block';
    if (usuarioActual.rol === 'admin') {
        editRol.style.display = 'inline-block';
    }
    viewUsername.style.display = 'none';
    viewRol.style.display = 'none';
    editarPerfilBtn.style.display = 'none';
    guardarPerfilBtn.style.display = 'inline-block';
    cancelarEdicionBtn.style.display = 'inline-block';
    cambiarPasswordBtn.style.display = 'none';
}

function cancelarEdicionPerfil() {
    if (!usuarioActual || !editNombre || !editEmail || !editRol) return;
    editNombre.value = usuarioActual.nombre;
    editEmail.value = usuarioActual.email;
    editRol.value = usuarioActual.rol;
    editNombre.style.display = 'none';
    editEmail.style.display = 'none';
    editRol.style.display = 'none';
    viewUsername.style.display = 'block';
    viewRol.style.display = 'block';
    viewUsername.textContent = usuarioActual.username;
    viewRol.textContent = usuarioActual.rol;
    editarPerfilBtn.style.display = 'inline-block';
    guardarPerfilBtn.style.display = 'none';
    cancelarEdicionBtn.style.display = 'none';
    cambiarPasswordBtn.style.display = 'inline-block';
    passwordContainer.style.display = 'none';
}

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const username = usernameInput?.value.trim();
        const password = passwordInput?.value.trim();
        if (!username || !password) {
            mostrarAviso('Por favor ingrese usuario y contraseña');
            return;
        }
        socket.send(JSON.stringify({ action: 'login', username: username, password: password }));
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        socket.send(JSON.stringify({ action: 'logout', token: token }));
    });
}

if (perfilBtn) {
    perfilBtn.addEventListener('click', () => {
        socket.send(JSON.stringify({ action: 'perfil', token: token }));
    });
}

if (cerrarPerfilBtn) {
    cerrarPerfilBtn.addEventListener('click', () => {
        if (perfilModal) perfilModal.style.display = 'none';
        cancelarEdicionPerfil();
    });
}

if (nuevoBancoBtn) {
    nuevoBancoBtn.addEventListener('click', () => {
        modalTitulo.textContent = 'Nuevo Banco';
        bancoForm.reset();
        codigoInput.value = '';
        bancoModal.style.display = 'block';
    });
}

if (cancelarBtn) {
    cancelarBtn.addEventListener('click', () => {
        bancoModal.style.display = 'none';
    });
}

if (bancoForm) {
    bancoForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const codigo = codigoInput?.value;
        const nombre = nombreInput?.value.trim();
        const cod_transaccion = codTransaccionInput?.value.trim();
        if (!nombre || !cod_transaccion) {
            mostrarAviso('Por favor complete todos los campos');
            return;
        }
        if (cod_transaccion.length !== 4) {
            mostrarAviso('El código de transacción debe tener 4 caracteres');
            return;
        }
        const action = codigo ? 'actualizar' : 'crear';
        socket.send(JSON.stringify({
            action: action,
            codigo: codigo || null,
            nombre: nombre,
            cod_transaccion: cod_transaccion,
            token: token
        }));
        bancoModal.style.display = 'none';
    });
}

if (editarPerfilBtn) {
    editarPerfilBtn.addEventListener('click', habilitarEdicionPerfil);
}

if (guardarPerfilBtn) {
    guardarPerfilBtn.addEventListener('click', function () {
        const nuevoNombre = editNombre?.value;
        const nuevoEmail = editEmail?.value;
        const nuevoRol = usuarioActual?.rol === 'admin' ? editRol?.value : usuarioActual?.rol;
        if (!nuevoNombre || !nuevoEmail) {
            mostrarAviso('Nombre y email son requeridos');
            return;
        }
        socket.send(JSON.stringify({
            action: 'actualizarPerfil',
            token: token,
            nombre: nuevoNombre,
            email: nuevoEmail,
            rol: nuevoRol
        }));
    });
}

if (cancelarEdicionBtn) {
    cancelarEdicionBtn.addEventListener('click', cancelarEdicionPerfil);
}

if (cambiarPasswordBtn) {
    cambiarPasswordBtn.addEventListener('click', function () {
        passwordContainer.style.display = 'block';
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    });
}

window.addEventListener('click', (event) => {
    if (bancoModal && event.target === bancoModal) {
        bancoModal.style.display = 'none';
    }
    if (perfilModal && event.target === perfilModal) {
        perfilModal.style.display = 'none';
        cancelarEdicionPerfil();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    actualizarInterfaz();
});