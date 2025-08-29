<?php
include_once("basedatos.php");
class banco extends basedatos{
	public $codigo;
	public $nombre;
	public $cod_transaccion;
	function __construct($codigo = NULL, $nombre = NULL, $cod_transaccion = NULL){
		$this->codigo = $codigo;
		$this->nombre = $nombre;
		$this->cod_transaccion = $cod_transaccion;
	}
	public function getCodigo(){
		return $this->codigo;
	}
	public function getNombre(){
		return $this->nombre;
	}
	public function getCod_transaccion(){
		return $this->cod_transaccion;
	}
	public function setCodigo($codigo){
		$this->codigo = $codigo;
	}
	public function setNombre($nombre){
		$this->nombre = $nombre;
	}
	public function setCod_transaccion($cod_transaccion){
		$this->cod_transaccion = $cod_transaccion;
	}
	public function insertar(){
		$sql = sprintf("INSERT INTO banco (codigo, nombre, cod_transaccion) VALUES ('%s', '%s', '%s')", $this->codigo, $this->nombre, $this->cod_transaccion);
		$this->conectar();
		// echo $sql;
		$this->ejecutarSQL($sql);
		$this->desconectar();
	}
	public function listar(){
		$sql = "SELECT * FROM banco ORDER BY nombre ASC";
		$this->conectar();
		$this->ejecutarSQL($sql);
		$res = $this->cargarTodo();
		$this->desconectar();
		return $res;
	}
	public function consultar(){
		$sql = sprintf("SELECT * FROM banco WHERE codigo = %s", $this->codigo);
		$this->conectar();
		$this->ejecutarSQL($sql);
		$res = $this->cargarRegistro();
		$this->desconectar();
		$this->nombre = $res['nombre'];
		$this->cod_transaccion = $res['cod_transaccion'];
	}
	public function eliminar(){
		$sql = sprintf("DELETE FROM banco WHERE codigo = %s", $this->codigo);
		$this->conectar();
		$this->ejecutarSQL($sql);
		$this->desconectar();
	}
	public function actualizar(){
		$sql = sprintf("UPDATE banco SET codigo = '%s', nombre = '%s', cod_transaccion = '%s' WHERE codigo = %s", $this->codigo, $this->nombre, $this->cod_transaccion, $this->codigo);
		//echo $sql;
		$this->conectar();
		$this->ejecutarSQL($sql);
		$this->desconectar();
	}
}
?>