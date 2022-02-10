import { useState } from 'react'
import { useDispatch } from 'react-redux';
import { setGithubToken } from '../redux/actions';
import widgetStyle from './widget.module.scss'

export default function SignIn() {
  const [email, setEmail] = useState('sbBaoBao@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  let dispatch = useDispatch()

  return (
    <div className={`${widgetStyle.center} ${widgetStyle.fullScreen}`}>
      <div className={`${widgetStyle.container} ${widgetStyle.minWidth576}`}>
        <h1>Sign in</h1>
        <div className={`${widgetStyle.container} ${widgetStyle.card}`}>
          {errMsg ? (
            <div className={`${widgetStyle.alert} ${widgetStyle.marginBottom2} ${widgetStyle.dangerBg}`}>
              {errMsg}
            </div>) : (
            <div className={`${widgetStyle.alert} ${widgetStyle.marginBottom2}`}>
              使用 sbBaoBao 登入
            </div>)}
          <form>
            <div className={widgetStyle.marginBottom2}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={widgetStyle.formControl}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="password">Email</label>
              <input
                id="password"
                type="password"
                className={widgetStyle.formControl}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className={`${widgetStyle.btn} ${widgetStyle.btnPrimary} ${widgetStyle.fullWidth}`}
              onClick={async (e) => {
                e.preventDefault();
                setLoading(true);
                const res = await fetch(`https://cms-auth-test.herokuapp.com/auth`, {
                  headers: { 'content-type': 'application/json' },
                  method: 'POST',
                  body: JSON.stringify({
                    username: email,
                    password,
                  }),
                })
                const json = await res.json()
                if (json.errMsg) {
                  setErrMsg(json.errMsg)
                }
                if (json.token) {
                  dispatch(setGithubToken(json.token))
                }
                setLoading(false);
              }}>
              <span className={widgetStyle.center}>
                {loading ? (
                  <>
                    <span style={{ visibility: "hidden" }}>-</span>
                    <div className={`${widgetStyle.spinner} ${widgetStyle.small}`}></div>
                    <span style={{ visibility: "hidden" }}>-</span>
                  </>) : <div>登入</div>
                }
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}