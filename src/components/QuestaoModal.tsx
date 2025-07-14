'use client';

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

interface Questao {
  id?: string;
  enunciado: string;
  alternativas: string[];
  respostaCorreta: number;
  explicacao: string;
  criadorId?: string;
  dataCriacao?: string;
}

interface QuestaoModalProps {
  questao: Questao | null;
  simuladoId: string;
  onClose: () => void;
  onSave: (questao: Questao) => void;
}

export default function QuestaoModal({
  questao,
  simuladoId,
  onClose,
  onSave,
}: QuestaoModalProps) {
  const [enunciado, setEnunciado] = useState('');
  const [alternativas, setAlternativas] = useState(['', '', '', '']);
  const [respostaCorreta, setRespostaCorreta] = useState(0);
  const [explicacao, setExplicacao] = useState('');

  useEffect(() => {
    if (questao) {
      setEnunciado(questao.enunciado);
      setAlternativas(questao.alternativas);
      setRespostaCorreta(questao.respostaCorreta);
      setExplicacao(questao.explicacao);
    } else {
      setEnunciado('');
      setAlternativas(['', '', '', '']);
      setRespostaCorreta(0);
      setExplicacao('');
    }
  }, [questao]);

  const handleAlternativaChange = (index: number, value: string) => {
    const newAlternativas = [...alternativas];
    newAlternativas[index] = value;
    setAlternativas(newAlternativas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQuestaoData = {
      enunciado,
      alternativas,
      respostaCorreta,
      explicacao,
      criadorId: 'admin',
      dataCriacao: new Date().toISOString(),
    };

    if (questao?.id) {
      const docRef = doc(
        db,
        'simulados',
        simuladoId,
        'questoes',
        questao.id
      );
      await updateDoc(docRef, {
        enunciado,
        alternativas,
        respostaCorreta,
        explicacao,
      });
      onSave({
        ...questao,
        enunciado,
        alternativas,
        respostaCorreta,
        explicacao,
      });
    } else {
      const docRef = await addDoc(
        collection(db, 'simulados', simuladoId, 'questoes'),
        newQuestaoData
      );
      onSave({ ...newQuestaoData, id: docRef.id });
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-black">
          {questao ? 'Editar Questão' : 'Nova Questão'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="enunciado"
              className="text-sm font-medium text-gray-700"
            >
              Enunciado
            </label>
            <textarea
              id="enunciado"
              name="enunciado"
              required
              value={enunciado}
              onChange={(e) => setEnunciado(e.target.value)}
              className="block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Alternativas (selecione a correta)
            </label>
            {alternativas.map((alt, index) => (
              <div
                key={index}
                className={`flex items-center mt-1 p-2 rounded-md ${
                  respostaCorreta === index ? 'bg-indigo-100' : ''
                }`}
              >
                <input
                  type="radio"
                  name="respostaCorreta"
                  checked={respostaCorreta === index}
                  onChange={() => setRespostaCorreta(index)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  required
                  value={alt}
                  onChange={(e) =>
                    handleAlternativaChange(index, e.target.value)
                  }
                  className="block w-full px-3 py-2 ml-2 text-gray-900 placeholder-gray-500 bg-transparent border-none appearance-none focus:outline-none focus:ring-0 sm:text-sm"
                />
              </div>
            ))}
          </div>
          <div>
            <label
              htmlFor="explicacao"
              className="text-sm font-medium text-gray-700"
            >
              Explicação
            </label>
            <textarea
              id="explicacao"
              name="explicacao"
              required
              value={explicacao}
              onChange={(e) => setExplicacao(e.target.value)}
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
