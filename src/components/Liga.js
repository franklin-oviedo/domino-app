import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import firebase from 'firebase/compat/app'; // Asegúrate de importar Firebase
import 'firebase/compat/database'; // Asegúrate de importar la base de datos
import { useNavigate } from 'react-router-dom';

function Liga() {
  const [ligaName, setLigaName] = useState('');
  const [ligas, setLigas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const ligasRef = database.ref('ligas/'); // Usa database.ref directamente
    const unsubscribe = ligasRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const ligasList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setLigas(ligasList);
    });

    return () => ligasRef.off(); // Limpiar la suscripción
  }, []);

  const handleCrearLiga = () => {
    if (ligaName.trim() === '') {
      alert("El nombre de la liga no puede estar vacío.");
      return;
    }

    const ligasRef = database.ref('ligas/');
    const newLigaRef = ligasRef.push(); // Crear una nueva referencia para la liga
    newLigaRef.set({ name: ligaName }) // Usar set para establecer los datos
      .then(() => {
        setLigaName(''); // Limpiar el campo de entrada
        navigate(`/opciones-liga/${newLigaRef.key}`); // Redirigir a las opciones de liga
      })
      .catch((error) => {
        console.error("Error al crear la liga:", error);
      });
  };

  const handleSeleccionarLiga = (ligaId) => {
    navigate(`/opciones-liga/${ligaId}`);
  };

  return (
    <div>
      <h2 className="text-center mb-4">Crear o Seleccionar Liga</h2>
      
      <div className="input-group mb-3">
        <input 
          type="text" 
          value={ligaName} 
          onChange={(e) => setLigaName(e.target.value)} 
          placeholder="Nombre de la Liga" 
          className="form-control" 
        />
        <button onClick={handleCrearLiga} className="btn btn-primary">Crear Liga</button>
      </div>

      <h4 className="text-center">Ligas Disponibles</h4>
      <div className="list-group mb-4">
        {ligas.map(liga => (
          <button 
            key={liga.id} 
            className="list-group-item list-group-item-action" 
            onClick={() => handleSeleccionarLiga(liga.id)}
          >
            {liga.name}
          </button>
        ))}
      </div>
      {ligas.length === 0 && <p className="text-center">No hay ligas creadas.</p>}
    </div>
  );
}

export default Liga;
