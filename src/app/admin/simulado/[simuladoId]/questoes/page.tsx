'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../../../../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { useParams } from 'next/navigation';
import QuestaoModal from '../../../../../components/QuestaoModal';

interface Questao {
  id?: string;
  enunciado: string;
  alternativas: string[];
  respostaCorreta: number;
  explicacao: string;
}

export default function QuestoesPage() {
  const router = useRouter();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestao, setSelectedQuestao] = useState<Questao | null>(null);
  const params = useParams();
  const { simuladoId } = params;

  useEffect(() => {
    if (simuladoId) {
      const fetchQuestoes = async () => {
        const q = query(
          collection(db, 'simulados', simuladoId as string, 'questoes'),
          orderBy('dataCriacao')
        );
        const querySnapshot = await getDocs(q);
        const questoesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Questao[];
        setQuestoes(questoesData);
      };

      fetchQuestoes();
    }
  }, [simuladoId]);

  const handleDelete = async (id: string) => {
    await deleteDoc(
      doc(db, 'simulados', simuladoId as string, 'questoes', id)
    );
    setQuestoes(questoes.filter((q) => q.id !== id));
  };

  const handleSave = (questao: Questao) => {
    if (selectedQuestao) {
      setQuestoes(
        questoes.map((q) => (q.id === questao.id ? questao : q))
      );
    } else {
      setQuestoes([...questoes, questao]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="container p-8 mx-auto">
      <button
        onClick={() => router.back()}
        className="px-4 py-2 mb-4 font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
      >
        Voltar
      </button>
      <h1 className="mb-8 text-3xl font-bold text-black">Gerenciar Questões</h1>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <button
          onClick={() => {
            setSelectedQuestao(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 mb-4 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Nova Questão
        </button>
        <ul className="space-y-4">
          {questoes.map((questao) => (
            <li
              key={questao.id}
              className="p-4 border rounded-md"
            >
              <h3 className="text-xl font-semibold text-black">{questao.enunciado}</h3>
              <ul className="pl-5 mt-2 list-disc">
                {questao.alternativas.map((alt, index) => (
                  <li
                    key={index}
                    className={`text-black ${
                      index === questao.respostaCorreta ? 'font-bold' : ''
                    }`}
                  >
                    {alt}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-gray-600">{questao.explicacao}</p>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => {
                    setSelectedQuestao(questao);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (questao.id) {
                      handleDelete(questao.id);
                    }
                  }}
                  className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {isModalOpen && (
        <QuestaoModal
          questao={selectedQuestao}
          simuladoId={simuladoId as string}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
