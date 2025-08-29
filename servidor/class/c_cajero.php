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

    // Métodos CRUD implementados de la clase abstracta
    public function listar() {
        $sql = "SELECT c.id, c.nombre, c.cod_banco, b.nombre AS banco_nombre, c.puesto, c.ranking
                FROM cajero c
                JOIN banco b ON c.cod_banco = b.id";
        return $this->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }
    public function crear($nombre, $cod_banco, $puesto, $ranking) {
        $sql = "INSERT INTO cajero (nombre, cod_banco, puesto, ranking) VALUES (?, ?, ?, ?)";
        $stmt = $this->prepare($sql);
        return $stmt->execute([$nombre, $cod_banco, $puesto, $ranking]);
    }
    public function editar($id, $nombre, $cod_banco, $puesto, $ranking) {
        $sql = "UPDATE cajero SET nombre = ?, cod_banco = ?, puesto = ?, ranking = ? WHERE id = ?";
        $stmt = $this->prepare($sql);
        return $stmt->execute([$nombre, $cod_banco, $puesto, $ranking, $id]);
    }
    public function eliminar($id) {
        $sql = "DELETE FROM cajero WHERE id = ?";
        $stmt = $this->prepare($sql);
        return $stmt->execute([$id]);
    }
    public function consultar($id) {
        $sql = "SELECT * FROM cajero WHERE id = ?";
        $stmt = $this->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>