<?php
include_once("basedatos.php");

class usuario extends basedatos
{
    public $id;
    public $username;
    public $password;
    public $nombre;
    public $email;
    public $rol;

    function __construct($id = NULL, $username = NULL, $password = NULL, $nombre = NULL, $email = NULL, $rol = NULL)
    {
        $this->id = $id;
        $this->username = $username;
        $this->password = $password;
        $this->nombre = $nombre;
        $this->email = $email;
        $this->rol = $rol;
    }

    // Getters y Setters
    public function getId()
    {
        return $this->id;
    }
    public function getUsername()
    {
        return $this->username;
    }
    public function getPassword()
    {
        return $this->password;
    }
    public function getNombre()
    {
        return $this->nombre;
    }
    public function getEmail()
    {
        return $this->email;
    }
    public function getRol()
    {
        return $this->rol;
    }

    public function setId($id)
    {
        $this->id = $id;
    }
    public function setUsername($username)
    {
        $this->username = $username;
    }
    public function setPassword($password)
    {
        $this->password = password_hash($password, PASSWORD_BCRYPT);
    }
    public function setNombre($nombre)
    {
        $this->nombre = $nombre;
    }
    public function setEmail($email)
    {
        $this->email = $email;
    }
    public function setRol($rol)
    {
        $this->rol = $rol;
    }

    // Métodos CRUD

    /**
     * Consulta un usuario por su username
     */
    public function consultar()
    {
        $sql = sprintf("SELECT * FROM usuarios WHERE username = '%s'", $this->username);
        $this->conectar();
        $this->ejecutarSQL($sql);
        $res = $this->cargarRegistro();
        $this->desconectar();

        if ($res) {
            $this->id = $res['id'];
            $this->password = $res['password'];
            $this->nombre = $res['nombre'];
            $this->email = $res['email'];
            $this->rol = $res['rol'];
            return true;
        }
        return false;
    }

    /**
     * Inserta un nuevo usuario en la base de datos
     */
    public function insertar()
    {
        $sql = sprintf(
            "INSERT INTO usuarios (username, password, nombre, email, rol) VALUES ('%s', '%s', '%s', '%s', '%s')",
            $this->username,
            $this->password,
            $this->nombre,
            $this->email,
            $this->rol
        );
        $this->conectar();
        $result = $this->ejecutarSQL($sql);
        $this->desconectar();
        return $result;
    }

    /**
     * Actualiza un usuario existente en la base de datos
     */
    protected function actualizar()
    {
        $sql = sprintf(
            "UPDATE usuarios SET username = '%s', password = '%s', nombre = '%s', email = '%s', rol = '%s' WHERE id = %d",
            $this->username,
            $this->password,
            $this->nombre,
            $this->email,
            $this->rol,
            $this->id
        );
        $this->conectar();
        $result = $this->ejecutarSQL($sql);
        $this->desconectar();
        return $result;
    }

    /**
     * Elimina un usuario de la base de datos
     */
    protected function eliminar()
    {
        $sql = sprintf("DELETE FROM usuarios WHERE id = %d", $this->id);
        $this->conectar();
        $result = $this->ejecutarSQL($sql);
        $this->desconectar();
        return $result;
    }

    /**
     * Verifica si la contraseña proporcionada coincide con la almacenada
     */
    public function verificarPassword($password)
    {
        return password_verify($password, $this->password);
    }

    /**
     * Lista todos los usuarios (opcional, para administración)
     */
    public function listar()
    {
        $sql = "SELECT id, username, nombre, email, rol FROM usuarios ORDER BY nombre ASC";
        $this->conectar();
        $this->ejecutarSQL($sql);
        $res = $this->cargarTodo();
        $this->desconectar();
        return $res;
    }
}
