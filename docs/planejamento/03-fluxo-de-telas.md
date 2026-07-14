# Fluxo de Telas — Portal de Admissão

> UX v1.0. Princípios: mobile-first (candidato usa celular), zero senha para o candidato,
> linguagem simples (nível de leitura fundamental), um objetivo por tela, tour de 4 passos,
> tooltip de ajuda em todo slot de documento. Data: 2026-07-13.

## Jornada do Candidato (mobile-first)

### C0 — Link mágico (fora do app)
RH cadastra o candidato → sistema envia e-mail/WhatsApp com link único.
Link expirado/usado → tela amigável "Link vencido — toque para receber um novo"
(reenvio self-service para o e-mail/celular já cadastrado, com rate-limit).

### C1 — Boas-vindas + Tour (primeira visita)
- Logo Green House, "Olá, {primeiro nome}! Falta pouco para sua admissão."
- **Tour de 4 passos** (driver.js), pulável, reapresentável pelo botão "?":
  1. "Preencha seus dados" 2. "Assine 3 documentos aqui mesmo"
  3. "Envie fotos dos seus documentos" 4. "Acompanhe o que falta nesta barra"
- Aviso LGPD resumido + botão "Li e concordo em continuar" (= Q1, com carimbo de hora).

### C2 — Formulário admissional (wizard em 6 etapas curtas)
Barra de progresso persistente ("Etapa 2 de 6"). Salvamento automático a cada campo
(autosave → "continue de onde parou" também vale para o formulário).
1. **Você** — nome, nascimento, sexo, identidade de gênero, cor/raça, nacionalidade,
   naturalidade, estado civil, escolaridade, PCD, e-mail, celular.
2. **Endereço** — CEP primeiro (autocompleta rua/bairro/cidade/UF via ViaCEP), número/complemento.
3. **Documentos** — RG (número, órgão, data), CPF, PIS (tooltip: "onde encontro?"),
   CNH (opcional), Título (número/zona/seção — tooltip com print do documento).
4. **Trabalho e banco** — uniforme (calça/camisa/calçado), banco, tipo de chave PIX + chave
   (máscara conforme o tipo).
5. **Dependentes** — "Você tem dependentes?" → cards "+ Adicionar dependente"
   (nome, nascimento, CPF, parentesco, deduzir IRRF sim/não). Sem limite.
6. **Vale-Transporte + Emergência** — opta VT? (explicação dos 6% em linguagem simples);
   se sim: cartão DFTrans (opcional) e trajeto; tipo sanguíneo, medicamentos, condições,
   contatos de emergência (mínimo 1, botão "+ Adicionar contato"), orientação especial.
Final: declaração de veracidade (= Q50) → gera as 3 fichas e avança.

### C3 — Assinatura das 3 fichas
- Uma por vez: Ficha Cadastro → Ficha de Emergência → Termo de VT.
- Visualização do PDF gerado com os dados do candidato ("confira seu nome, seu endereço…").
- Botão "Corrigir dados" (volta à etapa do wizard) | Botão "Assinar".
- Assinar = código de 6 dígitos enviado por e-mail/SMS → digitar → confirmação visual
  ("✔ Assinado em 13/07/2026 às 14:32"). Sem desenho de assinatura, sem app externo.

### C4 — Checklist de documentos (tela-âncora do "continue de onde parou")
- Lista vertical de slots personalizados (só o que se aplica: reservista só p/ homens etc.).
- Cada slot: ícone de status (⬜ pendente / 🕐 em análise / ✅ aprovado / ❌ recusado),
  nome em linguagem simples ("Foto do seu RG — frente e verso"), botão **"?"** com tooltip
  rico: o que é, onde conseguir (links TSE/TJDFT/app CTPS), exemplo de foto boa vs. ruim.
- Upload: câmera ou galeria/arquivo (foto, PDF, Word). Multi-página por slot.
  Validação imediata: nitidez/tamanho/formato → feedback na hora ("A foto ficou escura,
  tente de novo perto da janela").
- Slot recusado mostra o motivo em vermelho + botão "Enviar novamente".
- Barra fixa no topo: "7 de 11 documentos ok".
- Botão **"CONCLUÍ MEU ENVIO"** (só habilita com obrigatórios enviados) → congela edição,
  notifica RH, mostra tela C5. Estado explícito — mata o "achei que tinha mandado tudo".

### C5 — Acompanhamento
"Recebemos tudo! O RH está conferindo." Status por documento em tempo real.
Se algo for recusado: notificação (e-mail/WhatsApp) + o checklist reabre só naquele slot.
Quando tudo aprovado: "🎉 Documentação completa — bem-vindo(a) à Green House!"

## Jornada do RH (desktop-first)

### R1 — Login (e-mail + senha; candidato nunca loga aqui)

### R2 — Painel de candidatos
Tabela: nome, vaga/cidade, status (chips coloridos), progresso de docs (7/11), última
atividade, dias em aberto. Filtros por status. Botão "+ Novo candidato" (nome, e-mail,
celular → dispara link mágico). Ações: reenviar link, ver detalhes.

### R3 — Detalhe do candidato / Fila de revisão
- Coluna esquerda: dados do formulário (com dados de saúde recolhidos atrás de "mostrar —
  acesso registrado em auditoria").
- Centro: visualizador de documento (zoom/rotação), navegação "próximo pendente" para
  revisar em sequência sem voltar à lista.
- Ações por documento: **Aprovar** | **Recusar** (motivo pré-definido: ilegível, documento
  errado, vencido, incompleto + observação) | **Dispensar** (opcionais).
- Recusa → notificação automática ao candidato. Aprovação do último obrigatório → botão
  "Gerar dossiê" (ou geração automática, configurável).

### R4 — Dossiê
Preview do PDF único na ordem oficial (fichas 1-2-3 assinadas + docs). Botões: baixar,
reenviar por e-mail, reprocessar.

### R5 — Configurações
SMTP (teste de envio), textos dos e-mails/WhatsApp, dias de retenção (expurgo), usuários
do RH, catálogo de tooltips (editável — RH atualiza dicas sem deploy).

## Tour e tooltips — evolução por versão (compromisso de roadmap)
- v1.0: tour 4 passos candidato + tooltips de todos os slots; tour de 3 passos no R3 (RH).
- v1.1: tooltips com imagens de exemplo (doc bom vs. ruim); tour contextual na 1ª recusa.
- v2.0: revisão dos textos com base nas dúvidas reais registradas (motivos de recusa mais
  frequentes viram dica proativa).

## Estados vazios e de erro (não esquecer)
- Checklist sem pendências, painel RH sem candidatos, upload falhou (retry), sessão de
  assinatura expirada (reenviar código), arquivo grande demais (compressão automática antes
  de recusar).
