import { useEffect, useRef, useState } from 'react'
import { candidato as api } from '../api.js'
import { DICAS, CODIGOS_ERRO_UPLOAD } from '../tooltips.js'
import { Cartao } from './CandidatoApp.jsx'

const STATUS = {
  pendente: { icone: '⬜', texto: 'Falta enviar' },
  enviado: { icone: '🕐', texto: 'Em análise pelo RH' },
  aprovado: { icone: '✅', texto: 'Aprovado' },
  rejeitado: { icone: '❌', texto: 'Precisa reenviar' },
  dispensado: { icone: '➖', texto: 'Dispensado' },
}

const MOTIVOS = {
  ilegivel: 'A imagem ficou ilegível — tente com mais luz.',
  doc_errado: 'O documento enviado não é o solicitado.',
  vencido: 'O documento está vencido — emita um novo.',
  incompleto: 'Faltou parte do documento (frente ou verso).',
  outro: 'Houve um problema com o arquivo.',
}

export default function Checklist({ token, aoConcluir }) {
  const [check, setCheck] = useState(null)
  const [dicaAberta, setDicaAberta] = useState(null)
  const [enviando, setEnviando] = useState(null)
  const [erros, setErros] = useState({})
  const inputRef = useRef(null)
  const slotAtual = useRef(null)

  const recarregar = () => api.documentos(token).then(setCheck)
  useEffect(() => { recarregar() }, [token])

  if (!check) return <Cartao><p>Carregando…</p></Cartao>

  const escolher = (slotId) => {
    slotAtual.current = slotId
    inputRef.current.click()
  }

  const aoSelecionar = async (e) => {
    const arquivo = e.target.files[0]
    e.target.value = ''
    if (!arquivo) return
    const slotId = slotAtual.current
    setEnviando(slotId)
    setErros((x) => ({ ...x, [slotId]: null }))
    try {
      await api.enviarArquivo(token, slotId, arquivo)
      await recarregar()
    } catch (err) {
      setErros((x) => ({
        ...x,
        [slotId]: CODIGOS_ERRO_UPLOAD[err.detail] || 'Não foi possível enviar. Tente de novo.',
      }))
    } finally { setEnviando(null) }
  }

  const podeConcluir = check.slots
    .filter((s) => s.obrigatorio)
    .every((s) => ['enviado', 'aprovado', 'dispensado'].includes(s.status))

  const concluir = async () => {
    await api.concluirEnvio(token)
    aoConcluir()
  }

  return (
    <Cartao>
      <input ref={inputRef} type="file" hidden accept="image/*,.pdf,.doc,.docx" onChange={aoSelecionar} />
      <div className="progresso">
        <div className="progresso-barra"
             style={{ width: `${(check.progresso.ok / Math.max(check.progresso.total, 1)) * 100}%` }} />
      </div>
      <p className="etapa-num">{check.progresso.ok} de {check.progresso.total} documentos obrigatórios ok</p>
      <h2>📄 Envie seus documentos</h2>
      <p className="explica">Toque em <strong>Enviar</strong> e fotografe ou escolha o arquivo
        (foto, PDF ou Word — a gente converte). Não sabe onde conseguir? Toque no
        <strong> ?</strong> do item.</p>

      {check.slots.map((s) => {
        const info = DICAS[s.tipo] || { nome: s.tipo, dica: '' }
        const st = STATUS[s.status]
        return (
          <div className={`slot ${s.status}`} key={s.id}>
            <div className="slot-linha">
              <span className="slot-icone">{st.icone}</span>
              <div className="slot-nome">
                <strong>{info.nome}</strong>
                {!s.obrigatorio && <em> (opcional)</em>}
                <div className="slot-status">{st.texto}</div>
                {s.status === 'rejeitado' && (
                  <div className="slot-motivo">{MOTIVOS[s.motivo_rejeicao] || ''} {s.motivo_rejeicao_obs || ''}</div>
                )}
              </div>
              <button className="btn-ajuda" title="Como conseguir este documento"
                      onClick={() => setDicaAberta(dicaAberta === s.id ? null : s.id)}>?</button>
              {['pendente', 'rejeitado', 'enviado'].includes(s.status) && (
                <button className="btn-principal btn-mini" disabled={enviando === s.id}
                        onClick={() => escolher(s.id)}>
                  {enviando === s.id ? 'Enviando…' : s.status === 'pendente' ? 'Enviar' : 'Reenviar'}
                </button>
              )}
            </div>
            {dicaAberta === s.id && <div className="slot-dica">💡 {info.dica}</div>}
            {erros[s.id] && <div className="alerta">{erros[s.id]}</div>}
          </div>
        )
      })}

      <button className="btn-principal btn-concluir" disabled={!podeConcluir} onClick={concluir}>
        CONCLUÍ MEU ENVIO ✓
      </button>
      {!podeConcluir && (
        <p className="explica centro">O botão libera quando todos os documentos obrigatórios
          estiverem enviados.</p>
      )}
    </Cartao>
  )
}
