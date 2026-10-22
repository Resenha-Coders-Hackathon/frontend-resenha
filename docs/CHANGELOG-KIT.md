# Análise — adaptação para Vue 3 + TypeScript

## Alterações realizadas
- Substituídas referências a aplicativos Django por domínios opcionais em `src/modules/<dominio>/`.
- Criado exemplo de separação entre `src/modules/`, `src/shared/` e `src/app/`, sem obrigar a criação dessas pastas.
- Regras específicas para Vue SFC, TypeScript, imports entre módulos, router, stores, HTTP e contratos compartilhados.
- Fluxo **padrão** explicitado: uma Issue por branch, commits incrementais e PR.
- Orquestração com múltiplos agentes mantida **opcional**, útil especialmente para quem trabalha sozinho com várias IAs.
- GitHub Projects, Kanban, dashboards e consultas por MCP mantidos como **possibilidades futuras**, sem dependência operacional.
- Issue/PR templates adaptados para módulos do frontend e verificações de typecheck/lint/test/build.
- `CODEOWNERS` atualizado com caminhos exemplificativos comentados.
- Workflow Django substituído por workflow Vue/TS **manual e demonstrativo**; nenhum comando de build/teste é presumido.

## Antes de usar
1. Inspecionar código real e adaptar os exemplos de `docs/MODULES.md`.
2. Preencher `docs/PROJECT_GUIDE.md` com `package.json`, lockfile e scripts existentes.
3. Escolher responsáveis por áreas compartilhadas e definir branch-base.
4. Configurar CI real e branch protection; ativar CODEOWNERS com nomes válidos se desejado.
5. Alinhar regras com colegas; não impor orquestração ou dashboards.

## Validação
Verificada a estrutura do ZIP e a leitura dos YAML. **Não foram executados typecheck, lint, testes ou build de aplicação**, pois o pacote contém apenas documentação.
