<?php
include_once("basedatos.php");

class cajero extends basedatos
{
    public $id;
    public $nombre;
    public $cod_banco;
    public $puesto;
    public $ranking;

    function __construct($id = NULL, $nombre = NULL, $cod_banco = NULL, $puesto = NULL, $ranking = NULL)
    {
        $this->id = $id;
        $this->nombre = $nombre;
        $this->cod_banco = $cod_banco;
        $this->puesto = $puesto;
        $this->ranking = $ranking;
    }

    // Getters
    public function getId()
    {
        return $this->id;
    }

    public function getNombre()
    {
        return $this->nombre;
    }

    public function getCod_banco()
    {
        return $this->cod_banco;
    }

    public function getPuesto()
    {
        return $this->puesto;
    }

    public function getRanking()
    {
        return $this->ranking;
    }

    // Setters
    public function setId($id)
    {
        $this->id = $id;
    }

    public function setNombre($nombre)
    {
        $this->nombre = $nombre;
    }

    public function setCod_banco($cod_banco)
    {
        $this->cod_banco = $cod_banco;
    }

    public function setPuesto($puesto)
    {
        $this->puesto = $puesto;
    }

    public function setRanking($ranking)
    {
        $this->ranking = $ranking;
    }

    public function consultar()
    {
        $sql = sprintf("SELECT * FROM cajeros WHERE id = %d", $this->id);
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

    public function insertar()
    {
        $sql = sprintf(
            "INSERT INTO cajeros (nombre, cod_banco, puesto, ranking) VALUES ('%s', %d, '%s', %d)",
            $this->nombre,
            $this->cod_banco,
            $this->puesto,
            $this->ranking
        );
        $this->conectar();
        $result = $this->ejecutarSQL($sql);
        $this->desconectar();
        return $result;
    }

    public function actualizar()
    {
        $sql = sprintf(
            "UPDATE cajeros SET nombre = '%s', cod_banco = %d, puesto = '%s', ranking = %d WHERE id = %d",
            $this->nombre,
            $this->cod_banco,
            $this->puesto,
            $this->ranking,
            $this->id
        );
        $this->conectar();
        $result = $this->ejecutarSQL($sql);
        $this->desconectar();
        return $result;
    }

    public function eliminar()
    {
        $sql = sprintf("DELETE FROM cajeros WHERE id = %d", $this->id);
        $this->conectar();
        $result = $this->ejecutarSQL($sql);
        $this->desconectar();
        return $result;
    }

    public function listar()
    {
        $sql = "SELECT c.*, b.nombre as nombre_banco 
                FROM cajeros c 
                LEFT JOIN banco b ON c.cod_banco = b.codigo 
                ORDER BY c.ranking ASC, c.nombre ASC";
        $this->conectar();
        $this->ejecutarSQL($sql);
        $res = $this->cargarTodo();
        $this->desconectar();
        return $res;
    }

    public function validarBanco($cod_banco){
    // Acepta solo enteros positivos
    if ($cod_banco === null || $cod_banco === '' || !is_numeric($cod_banco)) {
        return false;
    }
    $cod_banco = (int)$cod_banco;

    $sql = sprintf("SELECT 1 FROM banco WHERE codigo = %d LIMIT 1", $cod_banco);
    $this->conectar();
    $this->ejecutarSQL($sql);
    $res = $this->cargarRegistro();
    $this->desconectar();

    return $res !== false;
}
}
?>