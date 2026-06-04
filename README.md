# Fina Robusto

Versao mais completa do Fina, com dados locais no navegador e empacotamento para Linux e Windows.

## Estrutura

```text
public/     Interface web: HTML, CSS, JavaScript, manifest e icones.
docs/       Guias de build e uso.
legacy/     Versao Python/Tkinter antiga preservada.
dist/       Executaveis gerados.
build/      Arquivos temporarios do PyInstaller.
tools/      Instaladores auxiliares usados pelo build via Wine.
```

## Funcionalidades

- Metas financeiras.
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
