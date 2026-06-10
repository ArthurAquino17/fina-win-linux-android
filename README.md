# Fina Robusto

Versao mais completa do Fina, com dados locais no navegador e empacotamento para Linux, Windows, PWA e Android.

## Estrutura

```text
public/     Interface web: HTML, CSS, JavaScript, manifest e icones.
public/js/  Modulos de dados e integracoes externas usados pela interface.
android/    Projeto Android gerado pelo Capacitor.
docs/       Guias de build e uso.
legacy/     Versao Python/Tkinter antiga preservada.
dist/       Executaveis gerados.
build/      Arquivos temporarios do PyInstaller.
tools/      Instaladores auxiliares usados pelo build via Wine.
```

## Funcionalidades

- Metas financeiras.
- Perfil do investidor com sugestao de carteira.
- Preferencia de acoes e criptomoedas no perfil de investimento.
- Aba de portfolio para acompanhar ativos, valor atual e resultado.
- Atualizacao automatica de cotacoes externas para portfolio, com fallback manual.
- Triagem educacional de acoes e criptomoedas por criterios de mercado, preco atual e variacao via fontes externas.
- Calculadora de milhas conforme o cartao escolhido pelo usuario, usando apenas despesas lancadas nesse cartao.
- Aba de educacao financeira com trilhas sobre receitas, despesas, cartoes, milhas, investimentos, crescimento patrimonial e indicadores de mercado.
- Cadastro de cartoes proprios separado de bancos/contas.
- Modelo de cartao vinculado ao orcamento por categoria.

## Modularizacao

- `public/app.js`: composicao do estado compartilhado, referencias DOM, storage e runtime central.
- `public/js/app-data.js`: chaves de armazenamento, categorias, contas padrao, perfil financeiro inicial e catalogo local de cartoes.
- `public/js/app-utils.js`: utilitarios puros de data, moeda, parsing, email, hash, UUID e JSON seguro.
- `public/js/app-storage.js`: camada de persistencia local com loaders/savers de usuario, sessao, lancamentos, orcamentos, metas, contas, portfolio, cartoes, categorias, perfil e configuracoes.
- `public/js/app-cards.js`: cartoes cadastrados, ranking de cartoes, gasto em cartao e calculadora de milhas.
- `public/js/app-investments.js`: perfil do investidor, carteira sugerida, triagem de acoes/criptos e status de cotacoes.
- `public/js/app-portfolio.js`: totais do portfolio, renderizacao de ativos e atualizacao automatica de cotacoes.
- `public/js/app-education.js`: educacao financeira, simulacoes de patrimonio e artigos de recomendacao.
- `public/js/app-backup.js`: exportacoes CSV/JSON/HTML, importacoes e snapshot local.
- `public/js/app-finance.js`: filtros, totais, orcamentos, recorrencias, score financeiro, previsao mensal e leitura do perfil financeiro.
- `public/js/app-dashboard.js`: metricas, coach financeiro, plano de acao, grafico, listas de planejamento e auditoria das funcoes do app.
- `public/js/app-forms.js`: opcoes de formularios, handlers de cadastro, tabelas de lancamentos, reset de dados e sincronizacao visual.
- `public/js/app-navigation.js`: menu central, abas, botoes de informacao e utilitarios de navegacao visual.
- `public/js/app-auth.js`: tela de login/cadastro, inicio da sessao do usuario e carregamento inicial dos dados.
- `public/js/app-events.js`: ligacao dos eventos de tela aos handlers de formularios, filtros, importacao, exportacao e logout.
- `public/js/app-pwa.js`: registro do service worker e instalacao PWA.
- `public/js/app-boot.js`: sequencia final de inicializacao do app.
- `public/js/market-data.js`: fontes externas de cotacao e catalogo base de acoes/criptos.
- `public/styles.css`: estilos visuais.
- `public/index.html`: estrutura das abas e formularios.
- Ranking local de cartoes por perfil de uso.
- Parcelamento automatico de compras.
- Dashboard mensal comparando mes atual e anterior.
- Relatorio HTML exportavel.
- Contas e carteiras.
- Sugestao automatica de categoria por descricao.
- Alertas de gastos fora do normal.
- Previsao de despesas ate o fim do mes.
- Score financeiro de 0 a 100.
- Plano de acao com 3 prioridades.
- Modo escuro.
- Busca e filtros avancados.
- Categorias personalizadas.
- Exclusao segura da conta local.
- Snapshot local de backup.
- Importacao CSV.
- Exportacao CSV, JSON e relatorio.
- Tela de configuracoes.
- Bloqueio de tela.
- Tutorial inicial.
- Abas separadas para despesas, rendas, planejamento, investimentos, portfolio, cartoes, automacao, relatorios e configuracoes.
- Cada aba concentra sua propria funcao, sem cards repetidos entre secoes.
- Menu central inicial para escolher rapidamente a area de trabalho.
- Tela principal limpa com botao `Funcoes do app` para abrir o menu de areas.
- Aba independente de milhas e inclusao do valor estimado das milhas no saldo economico.
- Auditoria das funcoes em Configuracoes, indicando se receitas, despesas, planejamento, investimentos, portfolio, cartoes, milhas, automacao, relatorios e backup estao prontos.
- Selecao do cartao usado em cada despesa, com impacto na tabela, exportacao CSV e calculo de milhas quando nao houver gasto manual definido no perfil.
- Botoes de informacoes completas em insights, plano de acao, educacao financeira e calculadora de milhas, abrindo abas internas ou fontes externas confiaveis quando util.

## Rodar localmente

```bash
.venv/bin/python server.py
```

Depois abra:

```text
http://127.0.0.1:8080/
```

## Gerar executaveis

Linux:

```bash
.venv/bin/python build.py
```

Windows pelo Wine:

```bash
./build-windows-linux.sh
```

## PWA no navegador

Rode o servidor local e abra o app no Chrome/Edge. Quando o navegador liberar a instalacao, use o botao `Instalar app`.

```bash
.venv/bin/python server.py
```

## Android

Instale as dependencias Java/Android e sincronize o projeto:

```bash
npm install
npm run android:sync
```

Para gerar um APK debug:

```bash
cd android
./gradlew assembleDebug
```

O APK fica em `android/app/build/outputs/apk/debug/app-debug.apk`.
