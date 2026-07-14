"""Montagem do dossiê único: fichas assinadas (1-3) + documentos aprovados na ordem oficial."""

import io
from datetime import datetime, timezone

from pypdf import PdfWriter
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.assinatura import Assinatura, DocumentoAssinavel
from app.models.candidato import Candidato
from app.models.documento import SlotDocumento, StatusSlot, TipoDocumento
from app.services import storage

# Ordem oficial definida pelo RH (docs/planejamento/01-visao-e-decisoes.md).
ORDEM_FICHAS = (
    DocumentoAssinavel.ficha_cadastro,
    DocumentoAssinavel.ficha_emergencia,
    DocumentoAssinavel.termo_vt,
)
ORDEM_DOCUMENTOS = (
    TipoDocumento.foto_3x4,
    TipoDocumento.rg,
    TipoDocumento.cpf_doc,
    TipoDocumento.ctps_digital,
    TipoDocumento.pis_comprovante,
    TipoDocumento.titulo_eleitor_doc,
    TipoDocumento.reservista,
    TipoDocumento.habilitacao_prof,
    TipoDocumento.laudo_pcd,
    TipoDocumento.comp_endereco,
    TipoDocumento.comp_escolaridade,
    TipoDocumento.diplomas,
    TipoDocumento.nada_consta_eleitoral,
    TipoDocumento.nada_consta_criminal,
    TipoDocumento.cert_casamento,
    TipoDocumento.cert_nascimento_dep,
    TipoDocumento.cartao_vacina_dep,
    TipoDocumento.declaracao_escolar_dep,
    TipoDocumento.cartao_vt,
)


class DossieIncompleto(Exception):
    def __init__(self, pendencias: list[str]):
        self.pendencias = pendencias
        super().__init__(", ".join(pendencias))


def gerar_dossie(db: Session, candidato: Candidato) -> str:
    """Monta e grava o PDF único; devolve a key no MinIO. Exige fichas assinadas e
    todos os slots obrigatórios aprovados (ou dispensados)."""
    assinaturas = {
        a.documento: a
        for a in db.scalars(
            select(Assinatura).where(
                Assinatura.candidato_id == candidato.id, Assinatura.assinado_em.isnot(None)
            )
        )
    }
    slots = db.scalars(
        select(SlotDocumento).where(SlotDocumento.candidato_id == candidato.id)
    ).all()

    pendencias = [f"ficha:{d.value}" for d in ORDEM_FICHAS if d not in assinaturas]
    pendencias += [
        f"documento:{s.tipo.value}"
        for s in slots
        if s.obrigatorio and s.status not in (StatusSlot.aprovado, StatusSlot.dispensado)
    ]
    if pendencias:
        raise DossieIncompleto(pendencias)

    writer = PdfWriter()
    for doc in ORDEM_FICHAS:
        writer.append(io.BytesIO(storage.ler(assinaturas[doc].pdf_key)))

    ordem = {tipo: i for i, tipo in enumerate(ORDEM_DOCUMENTOS)}
    aprovados = sorted(
        (s for s in slots if s.status == StatusSlot.aprovado and s.arquivo_pdf_key),
        key=lambda s: (ordem.get(s.tipo, 99), s.criado_em),
    )
    for slot in aprovados:
        writer.append(io.BytesIO(storage.ler(slot.arquivo_pdf_key)))

    saida = io.BytesIO()
    writer.write(saida)

    key = f"candidatos/{candidato.id}/dossie.pdf"
    storage.salvar(key, saida.getvalue(), "application/pdf")
    candidato.dossie_pdf_key = key
    candidato.dossie_gerado_em = datetime.now(timezone.utc)
    return key
