<?php
require_once 'class/c_banco.php';
require_once 'class/c_usuario.php';
require_once 'class/c_cajero.php';
require_once __DIR__ . '/vendor/autoload.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class BancoWebSocket implements MessageComponentInterface
{
    protected $clients;
    protected $usuariosConectados;
    private $secretKey = 'tu_clave_secreta_super_segura_!@#$%^&*()';
    private $tokenExpiration = 86400; // 24 horas en segundos

    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
        $this->usuariosConectados = [];
    }

    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients->attach($conn);
        $this->usuariosConectados[$conn->resourceId] = [
            'autenticado' => false,
            'usuario' => null,
            'token' => null,
            'last_activity' => time()
        ];
        echo "[{$conn->resourceId}] Nueva conexión establecida\n";
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        try {
            // Validar tamaño del mensaje
            if (strlen($msg) > 2048) {
                throw new Exception('Mensaje demasiado largo');
            }

            $data = json_decode($msg, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Formato JSON inválido: ' . json_last_error_msg());
            }

            if (!isset($data['action'])) {
                throw new Exception('El campo "action" es requerido');
            }

            $this->usuariosConectados[$from->resourceId]['last_activity'] = time();
            $response = ['action' => $data['action'], 'status' => 'success'];

            switch ($data['action']) {
                case 'login':
                    $this->handleLogin($from, $data, $response);
                    break;

                case 'logout':
                    $this->handleLogout($from, $response);
                    break;

                case 'perfil':
                    $this->handlePerfil($from, $response);
                    break;

                case 'listar':
                    $this->handleListar($from, $response);
                    break;

                case 'crear':
                    $this->handleCrear($from, $data, $response);
                    break;

                case 'actualizar':
                    $this->handleActualizar($from, $data, $response);
                    break;

                case 'eliminar':
                    $this->handleEliminar($from, $data, $response);
                    break;

                case 'consultar':
                    $this->handleConsultar($from, $data, $response);
                    break;

                case 'listarCajeros':
                    $this->handleListarCajeros($from, $response);
                    break;

                case 'crearCajero':
                    $this->handleCrearCajero($from, $data, $response);
                    break;

                case 'actualizarCajero':
                    $this->handleActualizarCajero($from, $data, $response);
                    break;

                case 'eliminarCajero':
                    $this->handleEliminarCajero($from, $data, $response);
                    break;

                case 'consultarCajero':
                    $this->handleConsultarCajero($from, $data, $response);
                    break;

                default:
                    throw new Exception('Acción no reconocida');
            }

            $from->send(json_encode($response));
        } catch (Exception $e) {
            $errorResponse = [
                'status' => 'error',
                'message' => $e->getMessage(),
                'action' => $data['action'] ?? 'unknown'
            ];
            $from->send(json_encode($errorResponse));
            echo "[{$from->resourceId}] Error: {$e->getMessage()}\n";
        }
    }

    private function handleLogin(ConnectionInterface $conn, array $data, array &$response)
    {
        if (!isset($data['username']) || !isset($data['password'])) {
            if (!isset($data['token'])) {
                throw new Exception('Se requieren username/password o token');
            }
        }

        $usuario = new usuario();

        if (isset($data['token'])) {
            try {
                $decoded = JWT::decode($data['token'], new Key($this->secretKey, 'HS256'));
                $usuario->setUsername($decoded->username);

                if (!$usuario->consultar()) {
                    throw new Exception('Usuario no encontrado');
                }
            } catch (Exception $e) {
                throw new Exception('Token inválido: ' . $e->getMessage());
            }
        } else {
            $usuario->setUsername(trim($data['username']));

            if (!$usuario->consultar()) {
                throw new Exception('Credenciales incorrectas');
            }

            if (!$usuario->verificarPassword($data['password'])) {
                throw new Exception('Credenciales incorrectas');
            }
        }

        $token = $this->generarToken($usuario);

        $this->usuariosConectados[$conn->resourceId] = [
            'autenticado' => true,
            'usuario' => $usuario,
            'token' => $token,
            'last_activity' => time()
        ];

        $response['token'] = $token;
        $response['usuario'] = [
            'id' => $usuario->getId(),
            'nombre' => $usuario->getNombre(),
            'username' => $usuario->getUsername(),
            'email' => $usuario->getEmail(),
            'rol' => $usuario->getRol()
        ];
    }

    private function handleLogout(ConnectionInterface $conn, array &$response)
    {
        $this->verificarAutenticacion($conn);
        $this->usuariosConectados[$conn->resourceId]['autenticado'] = false;
        $this->usuariosConectados[$conn->resourceId]['usuario'] = null;
        $this->usuariosConectados[$conn->resourceId]['token'] = null;
        $response['message'] = 'Sesión cerrada correctamente';
    }

    private function handlePerfil(ConnectionInterface $conn, array &$response)
    {
        $usuario = $this->verificarAutenticacion($conn);
        $response['usuario'] = [
            'id' => $usuario->getId(),
            'nombre' => $usuario->getNombre(),
            'username' => $usuario->getUsername(),
            'email' => $usuario->getEmail(),
            'rol' => $usuario->getRol()
        ];
    }

    private function handleListar(ConnectionInterface $conn, array &$response)
    {
        $this->verificarPermiso($conn, 'lector');
        $banco = new banco();
        $response['data'] = $banco->listar();
    }

    private function handleCrear(ConnectionInterface $conn, array $data, array &$response)
    {
        $this->verificarPermiso($conn, 'editor');

        if (!isset($data['nombre']) || !isset($data['cod_transaccion'])) {
            throw new Exception('Nombre y código de transacción son requeridos');
        }

        $banco = new banco();
        $banco->setNombre(trim($data['nombre']));
        $banco->setCod_transaccion(trim($data['cod_transaccion']));
        $banco->insertar();

        $this->notificarTodos('actualizacion');
        $response['message'] = 'Banco creado exitosamente';
    }

    private function handleActualizar(ConnectionInterface $conn, array $data, array &$response)
    {
        $this->verificarPermiso($conn, 'editor');

        if (!isset($data['codigo']) || !isset($data['nombre']) || !isset($data['cod_transaccion'])) {
            throw new Exception('Todos los campos son requeridos');
        }

        $banco = new banco();
        $banco->setCodigo($data['codigo']);
        $banco->setNombre(trim($data['nombre']));
        $banco->setCod_transaccion(trim($data['cod_transaccion']));
        $banco->actualizar();

        $this->notificarTodos('actualizacion');
        $response['message'] = 'Banco actualizado exitosamente';
    }

    private function handleEliminar(ConnectionInterface $conn, array $data, array &$response)
    {
        $this->verificarPermiso($conn, 'admin');

        if (!isset($data['codigo'])) {
            throw new Exception('Código de banco es requerido');
        }

        $banco = new banco();
        $banco->setCodigo($data['codigo']);
        $banco->eliminar();

        $this->notificarTodos('actualizacion');
        $response['message'] = 'Banco eliminado exitosamente';
    }

    private function handleConsultar(ConnectionInterface $conn, array $data, array &$response)
    {
        $this->verificarPermiso($conn, 'lector');

        if (!isset($data['codigo'])) {
            throw new Exception('Código de banco es requerido');
        }

        $banco = new banco();
        $banco->setCodigo($data['codigo']);
        $banco->consultar();

        $response['data'] = [
            'codigo' => $banco->getCodigo(),
            'nombre' => $banco->getNombre(),
            'cod_transaccion' => $banco->getCod_transaccion()
        ];
    }

    private function handleListarCajeros(ConnectionInterface $conn, array &$response)
    {
        $this->verificarPermiso($conn, 'lector');
        $cajero = new cajero();
        $response['data'] = $cajero->listar();
    }
    
    private function handleCrearCajero(ConnectionInterface $conn, array $data, array &$response)
    {
        $this->verificarPermiso($conn, 'editor');
    
        if (!isset($data['nombre']) || !isset($data['cod_banco']) || !isset($data['puesto']) || !isset($data['ranking'])) {
            throw new Exception('Todos los campos son requeridos');
        }
    
        $cajero = new cajero();
        
        // Validar que el banco existe
        if (!$cajero->validarBanco($data['cod_banco'])) {
            throw new Exception('El banco especificado no existe');
        }
    
        $cajero->setNombre(trim($data['nombre']));
        $cajero->setCod_banco($data['cod_banco']);
        $cajero->setPuesto(trim($data['puesto']));
        $cajero->setRanking($data['ranking']);
        
        $result = $cajero->insertar();
        
        if (!$result) {
            throw new Exception('Error al crear el cajero');
        }
    
        $this->notificarTodos('actualizacionCajeros');
        $response['message'] = 'Cajero creado exitosamente';
    }
    
    private function handleActualizarCajero(ConnectionInterface $conn, array $data, array &$response)
    {
        $this->verificarPermiso($conn, 'editor');
    
        if (!isset($data['id']) || !isset($data['nombre']) || !isset($data['cod_banco']) || !isset($data['puesto']) || !isset($data['ranking'])) {
            throw new Exception('Todos los campos son requeridos');
        }
    
        $cajero = new cajero();
        
        // Validar que el banco exists
        if (!$cajero->validarBanco($data['cod_banco'])) {
            throw new Exception('El banco especificado no existe');
        }
    
        $cajero->setId($data['id']);
        $cajero->setNombre(trim($data['nombre']));
        $cajero->setCod_banco($data['cod_banco']);
        $cajero->setPuesto(trim($data['puesto']));
        $cajero->setRanking($data['ranking']);
        
        $result = $cajero->actualizar();
        
        if (!$result) {
            throw new Exception('Error al actualizar el cajero');
        }
    
        $this->notificarTodos('actualizacionCajeros');
        $response['message'] = 'Cajero actualizado exitosamente';
    }
    
    private function handleEliminarCajero(ConnectionInterface $conn, array $data, array &$response)
    {
        $this->verificarPermiso($conn, 'admin');
    
        if (!isset($data['id'])) {
            throw new Exception('ID del cajero es requerido');
        }
    
        $cajero = new cajero();
        $cajero->setId($data['id']);
        $result = $cajero->eliminar();
        
        if (!$result) {
            throw new Exception('Error al eliminar el cajero');
        }
    
        $this->notificarTodos('actualizacionCajeros');
        $response['message'] = 'Cajero eliminado exitosamente';
    }
    
    private function handleConsultarCajero(ConnectionInterface $conn, array $data, array &$response)
    {
        $this->verificarPermiso($conn, 'lector');
    
        if (!isset($data['id'])) {
            throw new Exception('ID del cajero es requerido');
        }
    
        $cajero = new cajero();
        $cajero->setId($data['id']);
        
        if (!$cajero->consultar()) {
            throw new Exception('Cajero no encontrado');
        }
    
        $response['data'] = [
            'id' => $cajero->getId(),
            'nombre' => $cajero->getNombre(),
            'cod_banco' => $cajero->getCod_banco(),
            'puesto' => $cajero->getPuesto(),
            'ranking' => $cajero->getRanking()
        ];
    }
    
    public function onClose(ConnectionInterface $conn)
    {
        if (isset($this->usuariosConectados[$conn->resourceId])) {
            echo "[{$conn->resourceId}] Conexión cerrada. Usuario: " .
                ($this->usuariosConectados[$conn->resourceId]['usuario'] ?
                    $this->usuariosConectados[$conn->resourceId]['usuario']->getUsername() : 'no autenticado') . "\n";
            unset($this->usuariosConectados[$conn->resourceId]);
        }
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "[{$conn->resourceId}] Error: {$e->getMessage()}\n";
        $conn->close();
    }

    protected function notificarTodos($tipo)
    {
        foreach ($this->clients as $client) {
            if ($this->usuariosConectados[$client->resourceId]['autenticado']) {
                $client->send(json_encode([
                    'action' => 'notificacion',
                    'tipo' => $tipo,
                    'timestamp' => time(),
                    'message' => 'Base de datos actualizada'
                ]));
            }
        }
    }

    private function generarToken($usuario)
    {
        $payload = [
            'iss' => 'banco_websocket',
            'iat' => time(),
            'exp' => time() + $this->tokenExpiration,
            'sub' => $usuario->getId(),
            'username' => $usuario->getUsername(),
            'rol' => $usuario->getRol()
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    private function verificarAutenticacion(ConnectionInterface $conn)
    {
        if (!isset($this->usuariosConectados[$conn->resourceId]['autenticado'])) {
            throw new Exception('No autenticado');
        }

        if (!$this->usuariosConectados[$conn->resourceId]['autenticado']) {
            throw new Exception('Sesión no válida');
        }

        return $this->usuariosConectados[$conn->resourceId]['usuario'];
    }

    private function verificarPermiso(ConnectionInterface $conn, $rolRequerido)
    {
        $usuario = $this->verificarAutenticacion($conn);

        $jerarquiaRoles = [
            'lector' => 1,
            'editor' => 2,
            'admin' => 3
        ];

        if (!isset($jerarquiaRoles[$usuario->getRol()])) {
            throw new Exception('Rol de usuario no válido');
        }

        if ($jerarquiaRoles[$usuario->getRol()] < $jerarquiaRoles[$rolRequerido]) {
            throw new Exception('Permisos insuficientes');
        }

        return true;
    }
}

// Configuración del servidor
$port = 8080;
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new BancoWebSocket()
        )
    ),
    $port
);

echo "Servidor WebSocket iniciado en el puerto {$port}\n";
$server->run();
?>