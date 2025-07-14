'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import SimuladoModal from '../../../components/SimuladoModal';
import { Simulado } from '../../../types/Simulado';

export default function AdminDashboard() {
  const router = useRouter();
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSimulado, setSelectedSimulado] = useState<Simulado | null>(null);

  useEffect(() => {
    const fetchSimulados = async () => {
const q = query(collection(db, 'simulados'), orderBy('dataCriacao', 'desc'));
      const querySnapshot = await getDocs(q);
      const simuladosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (Simulado & { id: string })[];
      setSimulados(simuladosData);
    };

    fetchSimulados();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'simulados', id));
    setSimulados(simulados.filter((s) => s.id !== id));
  };

  const handleSave = (simulado: Simulado) => {
    if (selectedSimulado) {
      setSimulados(
        simulados.map((s) => (s.id === simulado.id ? simulado : s))
      );
    } else {
      setSimulados([...simulados, simulado]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="container p-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-black">Admin Dashboard</h1>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-black">Simulados</h2>
        <button
          onClick={() => {
            setSelectedSimulado(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 mb-4 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Novo Simulado
        </button>
        <ul className="space-y-4">
          {simulados.map((simulado) => (
            <li
              key={simulado.id}
              className="flex items-center justify-between p-4 border rounded-md"
            >
              <div>
                <h3 className="text-xl font-semibold text-black">{simulado.titulo}</h3>
                <p className="text-gray-600">{simulado.descricao}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setSelectedSimulado(simulado);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (simulado.id) {
                      handleDelete(simulado.id);
                    }
                  }}
                  className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Excluir
                </button>
                <button
                  onClick={() => {
                    router.push(`/admin/simulado/${simulado.id}/questoes`);
                  }}
                  className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Gerenciar Questões
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {isModalOpen && (
        <SimuladoModal
          simulado={selectedSimulado}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
