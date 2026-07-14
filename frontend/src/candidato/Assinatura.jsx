import { useEffect, useState } from 'react'
import { candidato as api } from '../api.js'
import { Cartao } from './CandidatoApp.jsx'

const NOMES = {
  ficha_cadastro: 'Ficha Cadastral',
  ficha_emergencia: 'Ficha de Emergência',
  termo_vt: 'Termo do Vale-Transporte',
}

export default function Assinatura({ token, aoConcluir }) {
  const [fichas, setFichas] = useState(null)
  const [assinando, setAssinando] = useState(null) // documento em processo
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
    setMsg({ tipo: 'ok', texto: 'Enviamos um código de 6 números para o seu e-mail. Digite-o abaixo.' })
  }

  const confirmar = async () => {
    try {
      await api.assinar(token, assinando, codigo)
      setAssinando(null)
      setMsg({ tipo: 'ok', texto: `${NOMES[assinando]} assinada com sucesso! ✔` })
      await recarregar()
    } catch (e) {
      const textos = {
        codigo_incorreto: 'Código incorreto. Confira no e-mail e tente de novo.',
        codigo_expirado: 'O código venceu. Toque em "Reenviar código".',
        tentativas_excedidas: 'Muitas tentativas. Peça um novo código.',
      }
      setMsg({ tipo: 'erro', texto: textos[e.detail] || 'Não foi possível assinar. Tente novamente.' })
    }
  }

  return (
    <Cartao>
      <h2>✍️ Assine seus documentos</h2>
      <p className="explica">Confira cada documento (geramos tudo com os seus dados) e assine
        digitando o código que enviamos por e-mail. Vale como assinatura eletrônica
        (Lei nº 14.063/2020).</p>

      {fichas.map(({ documento, assinado }) => (
        <div className={`ficha-item ${assinado ? 'ok' : ''}`} key={documento}>
          <div>
            <strong>{assinado ? '✅' : '📄'} {NOMES[documento]}</strong>
            {!assinado && (
              <a className="link-ver" href={api.previewUrl(token, documento)}
                 target="_blank" rel="noreferrer">ver documento</a>
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
