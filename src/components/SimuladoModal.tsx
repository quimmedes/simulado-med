'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Simulado } from '../types/Simulado';

interface SimuladoModalProps {
  simulado: Simulado | null;
  onClose: () => void;
  onSave: (simulado: Simulado) => void;
}

export default function SimuladoModal({
  simulado,
  onClose,
  onSave,
}: SimuladoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    if (simulado) {
      setTitulo(simulado.titulo);
      setDescricao(simulado.descricao);
    } else {
      setTitulo('');
      setDescricao('');
    }
  }, [simulado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSimuladoData = {
      titulo,
      descricao,
      criadorId: 'admin',
      dataCriacao: new Date().toISOString(),
    };

    if (simulado?.id) {
      const docRef = doc(db, 'simulados', simulado.id);
      await updateDoc(docRef, { titulo, descricao });
      onSave({ ...simulado, titulo, descricao });
    } else {
      const docRef = await addDoc(collection(db, 'simulados'), newSimuladoData);
      onSave({ ...newSimuladoData, id: docRef.id });
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-black">
          {simulado ? 'Editar Simulado' : 'Novo Simulado'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="titulo"
              className="text-sm font-medium text-gray-700"
            >
              Título
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="descricao"
              className="text-sm font-medium text-gray-700"
            >
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
