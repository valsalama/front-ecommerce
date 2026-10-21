import React, { useState } from 'react';
import './OnOff.css';
import Card from './Card';

function OnOff() {
  //setea por defecto el estado del botón en "Encendido" true
  //setIsOn es la función que se encarga de actualizar el estado del botón
  //useState es un hook que permite agregar estado a un componente funcional
  const [isOn, setIsOn] = useState(true);

  //Función que se ejecuta al hacer click en el botón, cambia el estado del botón a su valor contrario
  const handleClick = () => {
    setIsOn(!isOn);
  };

  return (
    <button
      id="btn"
      className={isOn ? 'on' : 'off'}
      onClick={handleClick}
    >
      {isOn ? 'Encendido' : 'Apagado'}
    </button>
    
  );
}

export default OnOff;