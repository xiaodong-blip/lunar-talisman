import { adminAccount, json, methodNotAllowed, parseJson, signToken, verifyLogin } from './_backend.mjs'

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed()

  try {
    const { account = '', password = '' } = parseJson(event)
    const result = verifyLogin(account, password)

    if (result.setupRequired) {
      return json(503, {
        ok: false,
        error: 'admin_password_not_configured',
        message: '请先在 Netlify 环境变量中设置 LUNAR_ADMIN_PASSWORD。',
      })
    }

    if (!result.ok) {
      return json(401, {
        ok: false,
        error: 'invalid_credentials',
        message: '账号或密码不正确。',
      })
    }

    const expiresAt = Date.now() + 1000 * 60 * 60 * 8
    const token = signToken({ account: adminAccount(), exp: expiresAt })
    return json(200, { ok: true, token, expiresAt })
  } catch {
    return json(400, { ok: false, error: 'bad_request' })
  }
}
