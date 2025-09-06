// Establece conexión WebSocket con el servidor
const socket = new WebSocket("ws://192.168.1.4:8080")
let bancos = []
let cajeros = []
let usuarioActual = null
let token = localStorage.getItem("jwtToken") || null

// Elementos del DOM existentes...
const loginSection = document.getElementById("loginSection")
const mainSection = document.getElementById("mainSection")
const usernameInput = document.getElementById("username")
const passwordInput = document.getElementById("password")
const loginBtn = document.getElementById("loginBtn")
const logoutBtn = document.getElementById("logoutBtn")
const perfilBtn = document.getElementById("perfilBtn")
const perfilInfo = document.getElementById("perfilInfo")
const nuevoBancoBtn = document.getElementById("nuevoBanco")
const nuevoCajeroBtn = document.getElementById("nuevoCajero")
const cuerpoTabla = document.getElementById("cuerpoTabla")
const bancoModal = document.getElementById("bancoModal")
const bancoForm = document.getElementById("bancoForm")
const modalTitulo = document.getElementById("modalTitulo")
const codigoInput = document.getElementById("codigo")
const nombreInput = document.getElementById("nombre")
const codTransaccionInput = document.getElementById("cod_transaccion")
const cancelarBtn = document.getElementById("cancelar")
const perfilModal = document.getElementById("perfilModal")
const cerrarPerfilBtn = document.getElementById("cerrarPerfil")
const avisoError = document.getElementById("avisoError")

// Elementos del modal de perfil
const editNombre = document.getElementById("editNombre")
const viewUsername = document.getElementById("viewUsername")
const editEmail = document.getElementById("editEmail")
const viewRol = document.getElementById("viewRol")
const editRol = document.getElementById("editRol")
const editarPerfilBtn = document.getElementById("editarPerfilBtn")
const guardarPerfilBtn = document.getElementById("guardarPerfilBtn")
const cancelarEdicionBtn = document.getElementById("cancelarEdicionBtn")
const cambiarPasswordBtn = document.getElementById("cambiarPasswordBtn")
const passwordContainer = document.getElementById("passwordContainer")
const currentPassword = document.getElementById("currentPassword")
const newPassword = document.getElementById("newPassword")
const confirmPassword = document.getElementById("confirmPassword")

// Elementos del DOM para cajeros
const cuerpoTabla2 = document.getElementById("cuerpoTabla2")
const cajeroModal = document.getElementById("cajeroModal")
const cajeroForm = document.getElementById("cajeroForm")
const modalTitulo2 = document.getElementById("modalTitulo2")
const idInput = document.getElementById("id")
const nombreInput2 = document.getElementById("nombre2")
const codBancoInput = document.getElementById("cod_banco")
const puestoInput = document.getElementById("puesto")
const rankingInput = document.getElementById("ranking")
const cancelarBtn2 = document.getElementById("cancelar2")

// Elementos de navegación
const menuToggle = document.getElementById("menuToggle")
const menuNav = document.getElementById("menuNav")
const linkBancos = document.getElementById("linkBancos")
const linkCajeros = document.getElementById("linkCajeros")
const vistaBancos = document.getElementById("vistaBancos")
const vistaCajeros = document.getElementById("vistaCajeros")
const tituloVista = document.getElementById("tituloVista")

// Nuevo elemento del DOM para el botón de guardar contraseña
const guardarPasswordBtn = document.getElementById("guardarPasswordBtn");
const cancelarPasswordBtn = document.getElementById("cancelarPasswordBtn");

// Toggle menú hamburguesa
if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    menuNav.style.display = menuNav.style.display === "block" ? "none" : "block"
  })
}

// Navegación entre vistas
if (linkBancos) {
  linkBancos.addEventListener("click", (e) => {
    e.preventDefault()
    vistaBancos.style.display = "block"
    vistaCajeros.style.display = "none"
    tituloVista.textContent = "Listado de Bancos"
    menuNav.style.display = "none"
  })
}

if (linkCajeros) {
  linkCajeros.addEventListener("click", (e) => {
    e.preventDefault()
    vistaBancos.style.display = "none"
    vistaCajeros.style.display = "block"
    tituloVista.textContent = "Listado de Cajeros"
    menuNav.style.display = "none"
  })
}

// Mostrar/ocultar secciones según autenticación
function actualizarInterfaz() {
  if (usuarioActual) {
    loginSection.style.display = "none"
    mainSection.style.display = "block"
    perfilInfo.textContent = `Bienvenido, ${usuarioActual.nombre} (${usuarioActual.rol})`

    // Mostrar/ocultar botones según rol
    const puedeEditar = ["editor", "admin"].includes(usuarioActual.rol)
    if (nuevoBancoBtn) {
      nuevoBancoBtn.style.display = puedeEditar ? "block" : "none"
    }
    //
    if (nuevoCajeroBtn) {
      nuevoCajeroBtn.style.display = puedeEditar ? "block" : "none"
    }
  } else {
    loginSection.style.display = "block"
    mainSection.style.display = "none"
    perfilInfo.textContent = ""
  }
}

// Muestra un mensaje de aviso/error
function mostrarAviso(mensaje, esError = true) {
  if (!avisoError) return

  avisoError.textContent = mensaje
  avisoError.style.display = "block"
  avisoError.style.color = esError ? "red" : "green"
  setTimeout(ocultarAviso, 5000)
}

// Oculta el aviso/error
function ocultarAviso() {
  if (avisoError) {
    avisoError.textContent = ""
    avisoError.style.display = "none"
  }
}

// Evento cuando se establece la conexión WebSocket
socket.onopen = (e) => {
  console.log("Conexión establecida")
  actualizarInterfaz()

  // Intento de autologin si hay token almacenado
  if (token) {
    socket.send(
      JSON.stringify({
        action: "login",
        token: token,
      }),
    )
  }
}

// Evento cuando se recibe un mensaje del servidor WebSocket
socket.onmessage = (event) => {
  try {
    const response = JSON.parse(event.data)
    ocultarAviso()

    switch (response.action) {
      case "login":
        if (response.status === "success") {
          usuarioActual = response.usuario
          token = response.token
          localStorage.setItem("jwtToken", token)
          actualizarInterfaz()
          cargarBancos()
          cargarCajeros()
          mostrarAviso("Sesión iniciada correctamente", false)
        } else {
          mostrarAviso(response.message || "Error en el login")
        }
        break

      case "logout":
        if (response.status === "success") {
          usuarioActual = null
          token = null
          localStorage.removeItem("jwtToken")
          actualizarInterfaz()
          mostrarAviso("Sesión cerrada correctamente", false)
        } else {
          mostrarAviso(response.message || "Error al cerrar sesión")
        }
        break

      case "perfil":
        if (response.status === "success") {
          mostrarPerfil(response.usuario)
        } else {
          mostrarAviso(response.message || "Error al cargar perfil")
        }
        break

      case "actualizarPerfil":
        if (response.status === "success") {
          usuarioActual = response.usuario
          token = response.token
          localStorage.setItem("jwtToken", token)
          actualizarInterfaz()
          mostrarAviso("Perfil actualizado correctamente", false)
          cancelarEdicionPerfil()
        } else {
          mostrarAviso(response.message || "Error al actualizar perfil")
        }
        break

      case "listar":
        if (response.status === "success") {
          bancos = response.data
          actualizarTabla()
          if (!bancos || bancos.length === 0) {
            mostrarAviso("No hay bancos registrados.", false)
          }
        } else {
          mostrarAviso(response.message || "Error al listar bancos.")
        }
        break

      case "crear":
      case "actualizar":
      case "eliminar":
        if (response.status === "success") {
          mostrarAviso(`Operación ${response.action} realizada con éxito`, false)
          cargarBancos() //
        } else {
          mostrarAviso(response.message || `Error en la operación ${response.action}`)
        }
        break

      // CASOS PARA CAJEROS
      case "listarCajeros":
        if (response.status === "success") {
          cajeros = response.data
          actualizarTablaCajeros()
          if (!cajeros || cajeros.length === 0) {
            console.log("No hay cajeros registrados")
          }
        } else {
          mostrarAviso(response.message || "Error al listar cajeros.")
        }
        break

      case "crearCajero":
      case "actualizarCajero":
      case "eliminarCajero":
        if (response.status === "success") {
          mostrarAviso(`Operación ${response.action} realizada con éxito`, false)
          cargarCajeros()
        } else {
          mostrarAviso(response.message || `Error en la operación ${response.action}`)
        }
        break

      case "notificacion":
        if (response.tipo === "actualizacion" || response.tipo === "actualizacionCajeros") {
          cargarBancos()
          cargarCajeros() // refrescamos también cajeros
        }
        break

        case "cambiarPassword":
        if (response.status === "success") {
          mostrarAviso("Contraseña cambiada correctamente", false);
          // Opcional: Recargar perfil para confirmar
          socket.send(
            JSON.stringify({
              action: "perfil",
              token: token,
            })
          );
        } else {
          mostrarAviso(response.message || "Error al cambiar contraseña");
        }
        break;

      default:
        if (response.status === "error") {
          mostrarAviso(response.message)
        }
    }
  } catch (e) {
    console.error("Error al procesar mensaje:", e)
    mostrarAviso("Error al procesar la respuesta del servidor")
  }
}

// Evento cuando se cierra la conexión WebSocket
socket.onclose = (event) => {
  if (event.wasClean) {
    console.log(`Conexión cerrada limpiamente, código=${event.code} motivo=${event.reason}`)
  } else {
    console.log("La conexión se cayó")
    mostrarAviso("Conexión perdida. Intentando reconectar...")
    setTimeout(() => {
      window.location.reload()
    }, 5000)
  }
}

// Evento cuando ocurre un error en la conexión WebSocket
socket.onerror = (error) => {
  console.log(`Error en WebSocket: ${error.message}`)
  mostrarAviso("Error de conexión con el servidor")
}

// Función para mostrar el perfil del usuario
function mostrarPerfil(usuario) {
  if (!perfilModal || !editNombre || !viewUsername || !editEmail || !viewRol || !editRol) {
    console.error("Elementos del modal de perfil no encontrados")
    return
  }

  editNombre.value = usuario.nombre
  viewUsername.textContent = usuario.username
  editEmail.value = usuario.email
  viewRol.textContent = usuario.rol
  editRol.value = usuario.rol

  if (usuarioActual.rol !== "admin") {
    editRol.style.display = "none"
    viewRol.style.display = "block"
  }

  if (passwordContainer) {
    passwordContainer.style.display = "none"
  }
  if (currentPassword) currentPassword.value = ""
  if (newPassword) newPassword.value = ""
  if (confirmPassword) confirmPassword.value = ""

  if (editarPerfilBtn) editarPerfilBtn.style.display = "inline-block"
  if (guardarPerfilBtn) guardarPerfilBtn.style.display = "none"
  if (cancelarEdicionBtn) cancelarEdicionBtn.style.display = "none"
  if (cambiarPasswordBtn) cambiarPasswordBtn.style.display = "inline-block"

  perfilModal.style.display = "block"
}

// Carga la lista de bancos desde el servidor
function cargarBancos() {
  if (!token) {
    console.log("No hay token disponible para cargar bancos")
    return
  }
  socket.send(
    JSON.stringify({
      action: "listar",
      token: token,
    }),
  )
}

function cargarCajeros() {
  if (!token) {
    console.log("No hay token disponible para cargar cajeros")
    return
  }
  socket.send(
    JSON.stringify({
      action: "listarCajeros",
      token: token,
    }),
  )
}

// Actualiza la tabla HTML con los datos de los bancos
function actualizarTabla() {
  if (!cuerpoTabla) return

  cuerpoTabla.innerHTML = ""

  if (!bancos || bancos.length === 0) {
    const tr = document.createElement("tr")
    tr.innerHTML = '<td colspan="4" style="text-align: center;">No hay bancos registrados</td>'
    cuerpoTabla.appendChild(tr)
    return
  }

  bancos.forEach((banco) => {
    const tr = document.createElement("tr")

    let botones = ""
    if (usuarioActual) {
      if (usuarioActual.rol === "admin") {
        botones = `
                    <button onclick="editarBanco(${banco.codigo})">✏️</button>
                    <button onclick="eliminarBanco(${banco.codigo})">🗑️</button>
                `
      } else if (usuarioActual.rol === "editor") {
        botones = `
                    <button onclick="editarBanco(${banco.codigo})">✏️</button>
                `
      } else {
        botones = "<span>Solo lectura</span>"
      }
    }

    tr.innerHTML = `
            <td>${banco.codigo}</td>
            <td>${banco.nombre}</td>
            <td>${banco.cod_transaccion}</td>
            <td>${botones}</td>
        `
    cuerpoTabla.appendChild(tr)
  })
}

function actualizarTablaCajeros() {
  const cuerpoTabla2 = document.getElementById("cuerpoTabla2")
  if (!cuerpoTabla2) {
    console.error("Elemento cuerpoTabla2 no encontrado")
    return
  }

  cuerpoTabla2.innerHTML = ""

  if (!cajeros || cajeros.length === 0) {
    const tr = document.createElement("tr")
    tr.innerHTML = '<td colspan="6" style="text-align: center;">No hay cajeros registrados</td>'
    cuerpoTabla2.appendChild(tr)
    return
  }

  cajeros.forEach((cajero) => {
    const tr = document.createElement("tr")

    let botones = ""
    if (usuarioActual) {
      if (usuarioActual.rol === "admin") {
        botones = `
                    <button onclick="editarCajero(${cajero.id})">✏️</button>
                    <button onclick="eliminarCajero(${cajero.id})">🗑️</button>
                `
      } else if (usuarioActual.rol === "editor") {
        botones = `
                    <button onclick="editarCajero(${cajero.id})">✏️</button>
                `
      } else {
        botones = `<span>Solo lectura</span>`
      }
    }

    tr.innerHTML = `
            <td>${cajero.id}</td>
            <td>${cajero.nombre}</td>
            <td>${cajero.cod_banco}</td>
            <td>${cajero.puesto}</td>
            <td>${cajero.ranking}</td>
            <td>${botones}</td>
        `
    cuerpoTabla2.appendChild(tr)
  })
}

// Prepara el formulario para editar un banco existente
function editarBanco(codigo) {
  const banco = bancos.find((b) => b.codigo == codigo)
  if (!banco) {
    mostrarAviso("Banco no encontrado")
    return
  }

  if (modalTitulo) modalTitulo.textContent = "Editar Banco"
  if (codigoInput) codigoInput.value = banco.codigo
  if (nombreInput) nombreInput.value = banco.nombre
  if (codTransaccionInput) codTransaccionInput.value = banco.cod_transaccion
  if (bancoModal) bancoModal.style.display = "block"
}

function editarCajero(id) {
  const cajero = cajeros.find((c) => c.id == id)
  if (!cajero) {
    mostrarAviso("Cajero no encontrado")
    return
  }

  const modalTitulo2 = document.getElementById("modalTitulo2")
  const idInput = document.getElementById("id")
  const nombreInput2 = document.getElementById("nombre2")
  const codBancoInput = document.getElementById("cod_banco")
  const puestoInput = document.getElementById("puesto")
  const rankingInput = document.getElementById("ranking")
  const cajeroModal = document.getElementById("cajeroModal")

  if (modalTitulo2) modalTitulo2.textContent = "Editar Cajero"
  if (idInput) idInput.value = cajero.id
  if (nombreInput2) nombreInput2.value = cajero.nombre
  if (codBancoInput) codBancoInput.value = cajero.cod_banco
  if (puestoInput) puestoInput.value = cajero.puesto
  if (rankingInput) rankingInput.value = cajero.ranking
  if (cajeroModal) cajeroModal.style.display = "block"
}

// Solicita al servidor eliminar un banco
function eliminarBanco(codigo) {
  if (confirm("¿Está seguro de eliminar este banco? Esta acción no se puede deshacer.")) {
    socket.send(
      JSON.stringify({
        action: "eliminar",
        codigo: codigo,
        token: token,
      }),
    )
  }
}

function eliminarCajero(id) {
  if (confirm("¿Está seguro de eliminar este cajero? Esta acción no se puede deshacer.")) {
    socket.send(
      JSON.stringify({
        action: "eliminarCajero",
        id: id,
        token: token,
      }),
    )
  }
}

// Habilitar edición del perfil
function habilitarEdicionPerfil() {
  if (!editNombre || !editEmail || !viewUsername || !viewRol || !editRol) return

  editNombre.style.display = "block"
  editEmail.style.display = "block"
  viewUsername.style.display = "none"
  viewRol.style.display = "none"

  if (usuarioActual.rol === "admin") {
    editRol.style.display = "block"
  }

  if (editarPerfilBtn) editarPerfilBtn.style.display = "none"
  if (guardarPerfilBtn) guardarPerfilBtn.style.display = "inline-block"
  if (cancelarEdicionBtn) cancelarEdicionBtn.style.display = "inline-block"
  if (cambiarPasswordBtn) cambiarPasswordBtn.style.display = "none"
  if (passwordContainer) passwordContainer.style.display = "none"
}

// Cancelar edición del perfil
function cancelarEdicionPerfil() {
  if (!usuarioActual || !editNombre || !editEmail || !editRol) return

  editNombre.value = usuarioActual.nombre
  editEmail.value = usuarioActual.email
  editRol.value = usuarioActual.rol

  editNombre.style.display = "none"
  editEmail.style.display = "none"
  editRol.style.display = "none"

  if (viewUsername) viewUsername.style.display = "block"
  if (viewRol) viewRol.style.display = "block"

  if (viewUsername) viewUsername.textContent = usuarioActual.username
  if (viewRol) viewRol.textContent = usuarioActual.rol

  if (editarPerfilBtn) editarPerfilBtn.style.display = "inline-block"
  if (guardarPerfilBtn) guardarPerfilBtn.style.display = "none"
  if (cancelarEdicionBtn) cancelarEdicionBtn.style.display = "none"
  if (cambiarPasswordBtn) cambiarPasswordBtn.style.display = "inline-block"
  if (passwordContainer) passwordContainer.style.display = "none"
}

// Event Listeners existentes...
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const username = usernameInput?.value.trim()
    const password = passwordInput?.value.trim()

    if (!username || !password) {
      mostrarAviso("Por favor ingrese usuario y contraseña")
      return
    }

    socket.send(
      JSON.stringify({
        action: "login",
        username: username,
        password: password,
      }),
    )
  })
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    socket.send(
      JSON.stringify({
        action: "logout",
        token: token,
      }),
    )
  })
}

if (perfilBtn) {
  perfilBtn.addEventListener("click", () => {
    socket.send(
      JSON.stringify({
        action: "perfil",
        token: token,
      }),
    )
  })
}

if (cerrarPerfilBtn) {
  cerrarPerfilBtn.addEventListener("click", () => {
    if (perfilModal) perfilModal.style.display = "none"
    cancelarEdicionPerfil()
  })
}

if (nuevoBancoBtn) {
  nuevoBancoBtn.addEventListener("click", () => {
    if (modalTitulo) modalTitulo.textContent = "Nuevo Banco"
    if (bancoForm) bancoForm.reset()
    if (codigoInput) codigoInput.value = ""
    if (bancoModal) bancoModal.style.display = "block"
  })
}

if (cancelarBtn) {
  cancelarBtn.addEventListener("click", () => {
    if (bancoModal) bancoModal.style.display = "none"
  })
}

if (bancoForm) {
  bancoForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const codigo = codigoInput?.value
    const nombre = nombreInput?.value.trim()
    const cod_transaccion = codTransaccionInput?.value.trim()

    if (!nombre || !cod_transaccion) {
      mostrarAviso("Por favor complete todos los campos")
      return
    }

    if (cod_transaccion.length !== 4) {
      mostrarAviso("El código de transacción debe tener 4 caracteres")
      return
    }

    const action = codigo ? "actualizar" : "crear"

    socket.send(
      JSON.stringify({
        action: action,
        codigo: codigo || null,
        nombre: nombre,
        cod_transaccion: cod_transaccion,
        token: token,
      }),
    )

    if (bancoModal) bancoModal.style.display = "none"
  })
}

// Event listeners para el perfil
if (editarPerfilBtn) {
  editarPerfilBtn.addEventListener("click", habilitarEdicionPerfil)
}

if (guardarPerfilBtn) {
  guardarPerfilBtn.addEventListener("click", () => {
    const nuevoNombre = editNombre?.value
    const nuevoEmail = editEmail?.value
    const nuevoRol = usuarioActual?.rol === "admin" ? editRol?.value : usuarioActual?.rol

    if (!nuevoNombre || !nuevoEmail) {
      mostrarAviso("Nombre y email son requeridos")
      return
    }

    socket.send(
      JSON.stringify({
        action: "actualizarPerfil",
        token: token,
        nombre: nuevoNombre,
        email: nuevoEmail,
        rol: nuevoRol,
      }),
    )
  })
}

if (cancelarEdicionBtn) {
  cancelarEdicionBtn.addEventListener("click", cancelarEdicionPerfil)
}

// Cambiar contraseña
if (cambiarPasswordBtn) {
  cambiarPasswordBtn.addEventListener("click", () => {
    if (passwordContainer) passwordContainer.style.display = "block";
    if (currentPassword) currentPassword.value = "";
    if (newPassword) newPassword.value = "";
    if (confirmPassword) confirmPassword.value = "";
  });
}

// Nuevo: Event listener para guardar contraseña
if (guardarPasswordBtn) {
  guardarPasswordBtn.addEventListener("click", () => {
    const currentPass = currentPassword?.value.trim();
    const newPass = newPassword?.value.trim();
    const confirmPass = confirmPassword?.value.trim();

    if (!currentPass || !newPass || !confirmPass) {
      mostrarAviso("Por favor complete todos los campos de contraseña");
      return;
    }

    if (newPass !== confirmPass) {
      mostrarAviso("La nueva contraseña y la confirmación no coinciden");
      return;
    }

    if (newPass.length < 6) {
      mostrarAviso("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Enviar al servidor
    socket.send(
      JSON.stringify({
        action: "cambiarPassword",
        currentPassword: currentPass,
        newPassword: newPass,
        token: token,
      })
    );

    // Ocultar contenedor después de enviar (se maneja respuesta en onmessage)
    if (passwordContainer) passwordContainer.style.display = "none";
    if (currentPassword) currentPassword.value = "";
    if (newPassword) newPassword.value = "";
    if (confirmPassword) confirmPassword.value = "";
  });
}

// Nuevo: Event listener para cancelar cambio de contraseña
if (cancelarPasswordBtn) {
  cancelarPasswordBtn.addEventListener("click", () => {
    if (passwordContainer) passwordContainer.style.display = "none";
    if (currentPassword) currentPassword.value = "";
    if (newPassword) newPassword.value = "";
    if (confirmPassword) confirmPassword.value = "";
  });
}

// Event Listeners para cajeros
if (nuevoCajeroBtn) {
  nuevoCajeroBtn.addEventListener("click", () => {
    if (modalTitulo2) modalTitulo2.textContent = "Nuevo Cajero"
    if (cajeroForm) cajeroForm.reset()
    if (idInput) idInput.value = ""
    if (cajeroModal) cajeroModal.style.display = "block"
  })
}

if (cancelarBtn2) {
  cancelarBtn2.addEventListener("click", () => {
    if (cajeroModal) cajeroModal.style.display = "none"
  })
}

if (cajeroForm) {
  cajeroForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const id = idInput?.value
    const nombre = nombreInput2?.value.trim()
    const cod_banco = codBancoInput?.value.trim()
    const puesto = puestoInput?.value.trim()
    const ranking = rankingInput?.value.trim()

    if (!nombre || !cod_banco || !puesto || !ranking) {
      mostrarAviso("Por favor complete todos los campos")
      return
    }

    if (isNaN(cod_banco) || cod_banco <= 0) {
      mostrarAviso("El código de banco debe ser un número válido")
      return
    }

    if (isNaN(ranking) || ranking < 1 || ranking > 5) {
      mostrarAviso("El ranking debe ser un número entre 1 y 5")
      return
    }

    const action = id ? "actualizarCajero" : "crearCajero"

    socket.send(
      JSON.stringify({
        action: action,
        id: id || null,
        nombre: nombre,
        cod_banco: Number.parseInt(cod_banco),
        puesto: puesto,
        ranking: Number.parseInt(ranking),
        token: token,
      }),
    )

    if (cajeroModal) cajeroModal.style.display = "none"
  })
}

// Cerrar modales al hacer clic fuera de ellos
window.addEventListener("click", (event) => {
  if (bancoModal && event.target === bancoModal) {
    bancoModal.style.display = "none"
  }
  if (perfilModal && event.target === perfilModal) {
    perfilModal.style.display = "none"
    cancelarEdicionPerfil()
  }
  const cajeroModal = document.getElementById("cajeroModal")
  if (cajeroModal && event.target === cajeroModal) {
    cajeroModal.style.display = "none"
  }
})

// Inicializar interfaz al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  actualizarInterfaz()
})
