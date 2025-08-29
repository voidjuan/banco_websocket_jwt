<?php
abstract class basedatos
{
	private $BaseDatos = 'ejemplo_banco';		// nombre de la base de datos
	private $Servidor = 'localhost';		// nombre del servidor
	private $Usuario = 'root';		// nombre del usuario
	private $Clave = '';			// clave del usuario

	protected $Conexion_ID; //identificador de conexión
	protected $Consulta_ID; //identificador de consulta
	protected $ResultadoCon; //identificador de consulta
	protected $ErrNo;  //numero de error
	protected $ErrTxt; //texto de error

	//funciones básicas
	abstract protected function consultar();
	abstract protected function insertar();
	abstract protected function actualizar();
	abstract protected function eliminar();

	//conecta a la base de datos
	protected function conectar()
	{
		try {
			$this->Conexion_ID = new PDO('mysql:host=' . $this->Servidor . ';dbname=' . $this->BaseDatos, $this->Usuario, $this->Clave, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'UTF8'", PDO::MYSQL_ATTR_LOCAL_INFILE => true));
		} catch (PDOException $e) {
			$this->ErrNo = -1;
			$this->ErrTxt = $e->getMessage();
		}
	}

	//desconecta la base de datos
	protected function desconectar()
	{
		$this->Conexion_ID = NULL;
	}

	//ejecuta un sql

	public function ejecutarSQL($sql)
	{
		if ($this->Conexion_ID) {
			try {
				$this->Consulta_ID = $this->Conexion_ID->query($sql);
				return $this->Consulta_ID;
			} catch (PDOException $e) {
				$this->ErrTxt = $e->getMessage();
				return false;
			}
		}
		return false;
	}

	/* carga una matriz con el resultado completo de una consulta
	   valida los errores retorna la matriz de resultados si es correcta, retorna false en caso de error
	*/
	protected function cargarTodo()
	{
		if ($this->Conexion_ID) {
			$this->ResultadoCon = $this->Consulta_ID->fetchAll();
		} else {
			$this->ResultadoCon = false;
		}
		$this->desconectar();
		return ($this->ResultadoCon);
	}

	/* carga una matriz con el registro actual de la consulta
	   valida los errores retorna el registro si es correcta, retorna false en caso de error
	*/
	protected function cargarRegistro()
	{
		if ($this->Conexion_ID) {
			$this->ResultadoCon = $this->Consulta_ID->fetch(PDO::FETCH_BOTH);
		} else {
			$this->ResultadoCon = false;
		}
		return ($this->ResultadoCon);
	}

	/*
	Devuelve un string con el error guardado en caso de que exista
	*/
	public function imprimirError()
	{
		return sprintf("Error: %s - %s", $this->ErrNo, $this->ErrTxt);
	}

	/*
	Limpia las variables de error
	*/
	private function limpiarerror()
	{
		$this->ErrNo = "";
		$this->ErrTxt = "";
	}
}
