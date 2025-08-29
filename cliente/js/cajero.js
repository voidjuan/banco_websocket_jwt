const socket = new WebSocket('ws://localhost:8080');
let cajeros = [];
let usuarioActual = null;
let token = localStorage.getItem('jwtToken') || null;

// Nuevos elementos para cajeros
const nuevoCajeroBtn = document.getElementById('nuevoCajero');
const cuerpoTabla2 = document.getElementById('cuerpoTabla2');
const cajeroModal = document.getElementById('cajeroModal')
const cajeroForm = document.getElementById('cajeroForm');
const modalTitulo2 = document.getElementById('modalTitulo2');
const idInput = document.getElementById('id');
const nombreInput2 = document.getElementById('nombre2');
const codBancoInput = document.getElementById('cod_banco');
const puestoInput = document.getElementById('puesto');
const rankingInput = document.getElementById('ranking');
const cancelarBtn2 = document.getElementById('cancelar2');