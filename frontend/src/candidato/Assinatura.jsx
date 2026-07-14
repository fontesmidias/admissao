import { useEffect, useState } from 'react'
import { candidato as api } from '../api.js'
import { Cartao } from './CandidatoApp.jsx'

const NOMES = {
  ficha_cadastro: 'Ficha Cadastral',
  ficha_emergencia: 'Ficha de Emergência',
  termo_vt: 'Termo do Vale-Transporte',
}

export default function Assinatura({ token, email, aoConcluir }) {
  const [fichas, setFichas] = useState(null)
  const [emailAtual, setEmailAtual] = useState(email || '')
  const [editandoEmail, setEditandoEmail] = useState(false)
  const [novoEmail, setNovoEmail] = useState(email || '')
  const [assinando, setAssinando] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [msg, setMsg] = useState(null)

  const recarregar = () => api.fichas(token).then((r) => {
    setFichas(r.fichas)
    if (r.fichas.every((f) => f.assinado)) aoConcluir()
  })
  useEffect(() => { recarregar() }, [token])

  if (!fichas) return <Cartao><p>Carregando…</p></Cartao>

  const pedirCodigo = async (doc) => {
    setMsg(null)
    await api.solicitarCodigo(token, doc)
    setAssinando(doc)
    setCodigo('')
    setMsg({ tipo: 'ok', texto: `Código enviado para ${emailAtual}. Digite os 6 números abaixo. O código vale por 10 minutos.` })
  }

  const confirmar = async () => {
    try {
      await api.assinar(token, assinando, codigo)
      const nomeDoc = NOMES[assinando]
      setAssinando(null)
      setMsg({ tipo: 'ok', texto: `${nomeDoc} assinada com sucesso! ✔` })
      await recarregar()
    } catch (e) {
      const textos = {
        codigo_incorreto: 'Código incorreto. Confira no e-mail e tente de novo.',
        codigo_expirado: 'O código venceu (10 minutos). Toque em "Reenviar código".',
        tentativas_excedidas: 'Muitas tentativas. Peça um novo código.',
      }
      setMsg({ tipo: 'erro', texto: textos[e.detail] || 'Não foi possível assinar. Tente novamente.' })
    }
  }

  return (
    <Cartao>
      <h2>✍️ Assine seus 3 documentos AGORA</h2>
      <p className="explica"><strong>Sua admissão só avança depois destas assinaturas.</strong> Não
        deixe para depois: sem elas, o RH não pode efetivar sua contratação.</p>

      <div className="aviso-codigo">
        <strong>Como funciona:</strong> ao tocar em <strong>Assinar</strong>, enviaremos um
        código de 6 números para o e-mail:
        {!editandoEmail ? (
          <div className="email-confirma">
            <code>{emailAtual}</code>
            <button className="btn-link" onClick={() => setEditandoEmail(true)}>
              e-mail errado? Corrigir</button>
          </div>
        ) : (
          <div className="email-confirma">
            <input type="email" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
            <button className="btn-secundario btn-mini" onClick={async () => {
              const limpo = novoEmail.trim()
              await api.salvarSecao(token, 'pessoais', { email: limpo })
              setEmailAtual(limpo)
              setEditandoEmail(false)
              setMsg({ tipo: 'ok', texto: `E-mail corrigido para ${limpo}.` })
            }}>Salvar e-mail</button>
          </div>
        )}
        Digite o código na tela e pronto — vale como assinatura eletrônica (Lei nº 14.063/2020).
      </div>

      {fichas.map(({ documento, assinado }) => (
        <div className={`ficha-item ${assinado ? 'ok' : ''}`} key={documento}>
          <div>
            <strong>{assinado ? '✅' : '📄'} {NOMES[documento]}</strong>
            {!assinado && (
              <a className="link-ver" href={api.previewUrl(token, documento)}
                 target="_blank" rel="noreferrer">conferir o documento antes de assinar</a>
            )}
          </div>
          {!assinado && assinando !== documento && (
            <button className="btn-principal btn-mini" onClick={() => pedirCodigo(documento)}>
              Assinar</button>
          )}
          {assinando === documento && (
            <div className="otp">
              <input inputMode="numeric" maxLength={6} placeholder="000000" value={codigo}
                     onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} />
              <button className="btn-principal btn-mini" disabled={codigo.length !== 6}
                      onClick={confirmar}>Confirmar</button>
              <button className="btn-link" onClick={() => pedirCodigo(documento)}>
                Reenviar código</button>
            </div>
          )}
        </div>
      ))}

      {msg && <div className={msg.tipo === 'erro' ? 'alerta' : 'sucesso'}>{msg.texto}</div>}
    </Cartao>
  )
}
