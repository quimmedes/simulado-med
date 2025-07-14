'use client';

import { useState, useEffect } from 'react';
import { AcademicCapIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

import { Simulado } from '../types/Simulado';

type Questao = {
  id: string;
  enunciado: string;
  alternativas: string[];
  respostaCorreta: number;
  explicacao: string;
};

export default function Home() {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [simuladoSelecionado, setSimuladoSelecionado] = useState<number | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [respostaSelecionada, setRespostaSelecionada] = useState<number|null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);

  // Buscar simulados ao carregar a página
  useEffect(() => {
    async function fetchSimulados() {
      setLoading(true);
      const q = query(collection(db, 'simulados'), orderBy('dataCriacao',  'desc'));
      const querySnapshot = await getDocs(q);
      const lista: Simulado[] = [];
      for (const docSnap of querySnapshot.docs) {
        lista.push({ id: docSnap.id, ...docSnap.data() } as Simulado);
      }
      setSimulados(lista);
      setLoading(false);
    }
    fetchSimulados();
  }, []);

  // Buscar questões do simulado selecionado
  useEffect(() => {
    async function fetchQuestoes() {
      if (simuladoSelecionado === null) return;
      setLoading(true);
      const simuladoId = simulados[simuladoSelecionado]?.id;
      if (!simuladoId) return;
      const questoesSnapshot = await getDocs(collection(db, 'simulados', simuladoId, 'questoes'));
      const lista: Questao[] = [];
      for (const docSnap of questoesSnapshot.docs) {
        lista.push({ id: docSnap.id, ...docSnap.data() } as Questao);
      }
      setQuestoes(lista);
      setLoading(false);
    }
    fetchQuestoes();
  }, [simuladoSelecionado]);

  // Cabeçalho
  const Header = () => (
    <header className="flex items-center gap-3 py-6 mb-8 border-b border-gray-200">
      <AcademicCapIcon className="h-10 w-10 text-blue-600" />
      <span className="text-2xl font-bold tracking-tight text-gray-800">Simulados de Medicina</span>
    </header>
  );

  // Página inicial: lista de simulados
  if (simuladoSelecionado === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4">
        <div className="max-w-2xl mx-auto">
          <Header />
          {loading ? (
            <div className="text-center py-12 text-gray-500">Carregando simulados...</div>
          ) : (
            <div className="grid gap-6 mt-8">
              {simulados.map((simulado, idx) => (
                <div
                  key={simulado.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 p-6 cursor-pointer group"
                  onClick={() => { setSimuladoSelecionado(idx); setQuestaoAtual(0); setRespostas([]); }}
                >
                  <h2 className="text-xl font-semibold text-blue-700 group-hover:underline flex items-center gap-2">
                    <AcademicCapIcon className="h-6 w-6 text-blue-400" />
                    {simulado.titulo}
                  </h2>
                  <p className="text-gray-600 mt-2">{simulado.descricao}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Simulado selecionado
  const simulado = simulados[simuladoSelecionado];
  const totalQuestoes = questoes.length;
  const questao = questoes[questaoAtual];

  function responder(alternativaIdx: number) {
    if (respostaSelecionada !== null) return; // Evita múltiplos cliques
    setRespostaSelecionada(alternativaIdx);
    setMostrarFeedback(true);
    setTimeout(() => {
      setRespostas([...respostas, alternativaIdx]);
      setRespostaSelecionada(null);
      setMostrarFeedback(false);
      if (questaoAtual < totalQuestoes - 1) {
        setQuestaoAtual(questaoAtual + 1);
      }
    }, 1200);
  }

  // Resultado final
  if (respostas.length === totalQuestoes && totalQuestoes > 0) {
    const acertos = respostas.filter((r, i) => r === questoes[i].respostaCorreta).length;
    const erros = totalQuestoes - acertos;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4">
        <div className="max-w-2xl mx-auto">
          <Header />
          <div className="bg-white rounded-xl shadow-lg p-8 mt-12 text-center">
            <h1 className="text-3xl font-bold text-blue-700 mb-2">Resultado</h1>
            <p className="text-lg mb-4 text-gray-900">
              Você acertou <span className="font-bold text-green-600">{acertos}</span> e errou <span className="font-bold text-red-600">{erros}</span> de <span className="font-bold">{totalQuestoes}</span> questões.
            </p>
            <button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow"
              onClick={() => { setSimuladoSelecionado(null); setQuestaoAtual(0); setRespostas([]); setQuestoes([]); }}
            >
              Voltar aos simulados
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Barra de progresso
  const progresso = totalQuestoes > 0 ? ((questaoAtual) / totalQuestoes) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="max-w-2xl mx-auto">
        <Header />
        <div className="flex items-center gap-2 mb-6">
          <button
            className="p-2 rounded hover:bg-blue-100 text-blue-600"
            onClick={() => { setSimuladoSelecionado(null); setQuestaoAtual(0); setRespostas([]); setQuestoes([]); }}
            aria-label="Voltar"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <span className="text-gray-700 font-medium">{simulado?.titulo}</span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Carregando questões...</div>
          ) : questao ? (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Questão {questaoAtual + 1} de {totalQuestoes}</span>
                <span className="text-xs text-blue-600 font-semibold">{Math.round(progresso)}% concluído</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${progresso}%` }} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{questao.enunciado}</h2>
              <ul className="space-y-3">
                {questao.alternativas.map((alt: string, idx: number) => {
                  let btnClass = 'w-full text-left border rounded-lg px-4 py-3 font-medium transition-colors bg-gray-50 text-gray-800 border-gray-200 hover:border-blue-400 hover:bg-blue-100';
                  let icon = null;
                  if (mostrarFeedback && respostaSelecionada !== null) {
                    if (idx === questao.respostaCorreta) {
                      btnClass = 'w-full text-left border rounded-lg px-4 py-3 font-medium transition-colors border-green-500 bg-green-50 text-green-800';
                      icon = <CheckCircleIcon className="h-5 w-5 inline ml-2 text-green-500" />;
                    } else if (idx === respostaSelecionada) {
                      btnClass = 'w-full text-left border rounded-lg px-4 py-3 font-medium transition-colors border-red-500 bg-red-50 text-red-800';
                      icon = <XCircleIcon className="h-5 w-5 inline ml-2 text-red-500" />;
                    } else {
                      btnClass = 'w-full text-left border rounded-lg px-4 py-3 font-medium transition-colors bg-gray-50 text-gray-800 border-gray-200';
                    }
                  }
                  return (
                    <li key={idx}>
                      <button
                        className={btnClass}
                        disabled={mostrarFeedback || respostaSelecionada !== null}
                        onClick={() => responder(idx)}
                      >
                        {alt} {icon}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {mostrarFeedback && respostaSelecionada !== null && (
                <div className="mt-4 text-sm text-gray-700">
                  <span className="font-semibold">Explicação:</span> {questao.explicacao}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Nenhuma questão encontrada.</div>
          )}
          <div className="flex justify-end mt-6">
            <span className="text-xs text-gray-400">Powered by Next.js + Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
