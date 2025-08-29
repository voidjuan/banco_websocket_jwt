<?php
include_once("basedatos.php");

class cajero extends basedatos {
    public $id;
    public $nombre;
    public $cod_banco;
    public $puesto;
    public $ranking;

    function __construct($id = NULL, $nombre = NULL, $cod_banco = NULL, $puesto = NULL, $ranking = NULL) {
        $this->id = $id;
        $this->nombre = $nombre;
        $this->cod_banco = $cod_banco;
        $this->puesto = $puesto;
        $this->ranking = $ranking;
    }

    // Getters y Setters (mantengo los existentes, pero agrego consistencia)
    public function getId() { return $this->id; }
    public function getNombre() { return $this->nombre; }
    public function getCod_banco() { return $this->cod_banco; }
    public function getPuesto() { return $this->puesto; }
    public function getRanking() { return $this->ranking; }

    public function setId($id) { $this->id = $id; }
    public function setNombre($nombre) { $this->nombre = $nombre; }
    public function setCod_banco($cod_banco) { $this->cod_banco = $cod_banco; }
    public function setPuesto($puesto) { $this->puesto = $puesto; }
    public function setRanking($ranking) { $this->ranking = $ranking; }

    // Métodos CRUD similares a c_banco.php
    public function insertar() {
        if (!$this->validarBanco($this->cod_banco)) {
            return false; // Banco no existe
        }
        $sql = sprintf("INSERT INTO cajero (nombre, cod_banco, puesto, ranking) VALUES ('%s', %d, '%s', %d)",
            $this->nombre, $this->cod_banco, $this->puesto, $this->ranking);
        $this->conectar();
        $result = $this->ejecutarSQL($sql);
        $this->desconectar();
        return $result;
    }

    public function listar() {
        $sql = "SELECT * FROM cajero ORDER BY nombre ASC";
        $this->conectar();
        $this->ejecutarSQL($sql);
        $res = $this->cargarTodo();
        $this->desconectar();
        return $res;
    }

    public function consultar() {
        $sql = sprintf("SELECT * FROM cajero WHERE id = %d", $this->id);
        $this->conectar();
        $this->ejecutarSQL($sql);
        $res = $this->cargarRegistro();
        $this->desconectar();
        if ($res) {
            $this->nombre = $res['nombre'];
            $this->cod_banco = $res['cod_banco'];
            $this->puesto = $res['puesto'];
            $this->ranking = $res['ranking'];
            return true;
        }
        return false;
    }

    public function eliminar() {
        $sql = sprintf("DELETE FROM cajero WHERE id = %d", $this->id);
        $this->conectar();
        $result = $this->ejecutarSQL($sql);
        $this->desconectar();
        return $result;
    }

    public function actualizar() {
        if (!$this->validarBanco($this->cod_banco)) {
            return false; // Banco no existe
        }
        $sql = sprintf("UPDATE cajero SET nombre = '%s', cod_banco = %d, puesto = '%s', ranking = %d WHERE id = %d",
            $this->nombre, $this->cod_banco, $this->puesto, $this->ranking, $this->id);
        $this->conectar();
        $result = $this->ejecutarSQL($sql);
        $this->desconectar();
        return $result;
    }

    // Método auxiliar para validar si el banco existe
    public function validarBanco($cod_banco) {
        $sql = sprintf("SELECT COUNT(*) as count FROM banco WHERE codigo = %d", $cod_banco);
        $this->conectar();
        $this->ejecutarSQL($sql);
        $res = $this->cargarRegistro();
        $this->desconectar();
        return ($res['count'] > 0);
    }
}
?>