import admin, { ServiceAccount } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
// O serviceAccountKey.json deve estar na raiz do projeto ou o caminho ajustado
import serviceAccount from '../serviceAccountKey.json';

// Inicializa o Firebase Admin SDK se ainda não foi inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });
}

const db = getFirestore();

async function popularFirestore() {
  // Simulado 1
  const simulado1 = {
    titulo: 'Simulado de Cardiologia',
    descricao: 'Questões sobre cardiologia para revisão.',
    criadorId: 'admin',
    dataCriacao: '2024-06-01T12:00:00Z',
  };
  const simuladosRef = db.collection('simulados');
  const simulado1Doc = await simuladosRef.add(simulado1);

  const questoes1 = [
    {
      enunciado: 'Qual é o principal sintoma da insuficiência cardíaca?',
      alternativas: [
        'Dispneia',
        'Dor torácica',
        'Palpitação',
        'Edema de membros inferiores',
      ],
      respostaCorreta: 0,
      explicacao: 'Dispneia é o sintoma mais comum devido ao acúmulo de líquido nos pulmões.'
    },
    {
      enunciado: 'Qual exame é padrão-ouro para diagnóstico de embolia pulmonar?',
      alternativas: [
        'Raio-X de tórax',
        'Angiotomografia pulmonar',
        'Eletrocardiograma',
        'Ecocardiograma',
      ],
      respostaCorreta: 1,
      explicacao: 'A angiotomografia pulmonar é o exame padrão-ouro.'
    }
  ];

  const questoes1Collection = simulado1Doc.collection('questoes');
  for (const questao of questoes1) {
    await questoes1Collection.add(questao);
  }

  // Simulado 2
  const simulado2 = {
    titulo: 'Simulado de Clínica Médica',
    descricao: 'Questões gerais de clínica médica.',
    criadorId: 'admin',
    dataCriacao: '2024-06-02T10:00:00Z',
  };
  const simulado2Doc = await simuladosRef.add(simulado2);

  const questoes2 = [
    {
      enunciado: 'Qual é o tratamento inicial da crise asmática?',
      alternativas: [
        'Corticoide oral',
        'Beta-2 agonista inalatório',
        'Antibiótico',
        'Oxigenoterapia apenas',
      ],
      respostaCorreta: 1,
      explicacao: 'Beta-2 agonista inalatório é a primeira escolha.'
    },
    {
      enunciado: 'Qual exame confirma o diagnóstico de diabetes mellitus?',
      alternativas: [
        'Hemoglobina glicada',
        'Glicemia de jejum',
        'Curva glicêmica',
        'Todos os anteriores',
      ],
      respostaCorreta: 3,
      explicacao: 'Todos podem ser usados para diagnóstico.'
    }
  ];

  const questoes2Collection = simulado2Doc.collection('questoes');
  for (const questao of questoes2) {
    await questoes2Collection.add(questao);
  }

  console.log('Simulados e questões adicionados com sucesso ao Firestore!');
}

popularFirestore()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro ao popular o Firestore:', error);
    process.exit(1);
  });
